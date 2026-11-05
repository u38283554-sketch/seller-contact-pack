import { getAppStore, fulfillOrder, OrderRecord } from '../lib/store.js';
import { verifyZapUpiStatus } from '../lib/zapupi.js';

export const config = {
  path: '/api/zapupi-webhook',
};

export default async (req: Request) => {
  // Always respond HTTP 200 {"status":"ok"} to webhooks to avoid repetitive delivery retries
  try {
    if (req.method === 'POST') {
      const payload = await req.json().catch(() => ({}));
      const orderId = payload.order_id;

      if (orderId && typeof orderId === 'string') {
        const cleanOrderId = orderId.trim();
        const ordersStore = getAppStore('orders');
        const existingOrder = (await ordersStore.get(cleanOrderId, { type: 'json' })) as OrderRecord | null;

        if (existingOrder && existingOrder.status !== 'paid') {
          // Re-verify with ZapUPI order-status (never trust payload alone)
          const zapData = await verifyZapUpiStatus(cleanOrderId);
          if (zapData && zapData.status === 'Success') {
            const allowTest = process.env.ALLOW_TEST_PAYMENTS === 'true';
            if (zapData.environment === 'test' && !allowTest) {
              console.warn('Webhook received test payment in production. Skipping fulfillment.');
            } else {
              const zapAmount = Number(zapData.pay_amount || zapData.amount);
              if (Math.abs(zapAmount - existingOrder.amount) <= 0.01) {
                await fulfillOrder(cleanOrderId, {
                  txn_id: zapData.txn_id,
                  utr: zapData.utr,
                });
                console.log(`Webhook fulfilled order ${cleanOrderId} successfully.`);
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    console.error('zapupi-webhook processing error:', err.message);
  }

  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
