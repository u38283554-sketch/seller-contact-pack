import { PLANS } from '../lib/config.js';
import { getAppStore, fulfillOrder, OrderRecord } from '../lib/store.js';
import { verifyZapUpiStatus } from '../lib/zapupi.js';

export const config = {
  path: '/api/check-payment',
};

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { order_id } = body;

    if (!order_id || typeof order_id !== 'string') {
      return new Response(JSON.stringify({ error: 'order_id zaroori hai.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanOrderId = order_id.trim();
    const ordersStore = getAppStore('orders');

    // The order must exist in our orders store (never query arbitrary ids)
    const existingOrder = (await ordersStore.get(cleanOrderId, { type: 'json' })) as OrderRecord | null;
    if (!existingOrder) {
      return new Response(JSON.stringify({ error: 'Order record nahi mila. Kripya valid Order ID daalein.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If already marked paid and fulfilled
    if (existingOrder.status === 'paid' && existingOrder.accessKey) {
      const plan = PLANS[existingOrder.planId];
      return new Response(
        JSON.stringify({
          status: 'paid',
          accessKey: existingOrder.accessKey,
          plan: plan?.name || existingOrder.planId,
          planId: existingOrder.planId,
          limit: plan?.limit || 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Call ZapUPI order-status
    const zapData = await verifyZapUpiStatus(cleanOrderId);
    if (!zapData) {
      return new Response(JSON.stringify({ status: 'pending', message: 'Payment verify ho rahi hai...' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const expectedAmount = existingOrder.amount;
    const zapStatus = zapData.status; // 'Pending' | 'Success' | 'Failed'
    const zapAmount = Number(zapData.pay_amount || zapData.amount);
    const zapEnv = zapData.environment; // 'cashier' | 'zappay' | 'test'
    const allowTest = process.env.ALLOW_TEST_PAYMENTS === 'true';

    if (zapStatus === 'Success') {
      // Security verification: amount must match expected plan price
      if (Math.abs(zapAmount - expectedAmount) > 0.01) {
        console.error(`Amount mismatch: expected ${expectedAmount}, received ${zapAmount}`);
        return new Response(JSON.stringify({ status: 'failed', error: 'Payment amount mismatch detect hua.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Security check: environment must not be test unless explicitly enabled
      if (zapEnv === 'test' && !allowTest) {
        console.warn('Test payment rejected in production environment');
        return new Response(JSON.stringify({ status: 'failed', error: 'Test mode payment production mein allowed nahi hai.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Fulfill order idempotently
      const result = await fulfillOrder(cleanOrderId, {
        txn_id: zapData.txn_id,
        utr: zapData.utr,
      });

      return new Response(
        JSON.stringify({
          status: 'paid',
          accessKey: result.accessKey,
          expiry: result.expiresAt,
          plan: PLANS[result.planId]?.name || result.planId,
          planId: result.planId,
          limit: result.limit,
          isRenewal: result.isRenewal,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (zapStatus === 'Failed') {
      existingOrder.status = 'failed';
      await ordersStore.setJSON(cleanOrderId, existingOrder);
      return new Response(JSON.stringify({ status: 'failed', message: 'Payment fail ho gaya. Kripya dobara try karein.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ status: 'pending', message: 'Payment status pending hai.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('check-payment error:', err.message);
    return new Response(JSON.stringify({ error: err.message || 'Payment check karne mein takleef hui.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
