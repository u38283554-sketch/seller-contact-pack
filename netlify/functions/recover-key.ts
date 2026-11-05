import { getAppStore, fulfillOrder, OrderRecord } from '../lib/store.js';
import { verifyZapUpiStatus } from '../lib/zapupi.js';

export const config = {
  path: '/api/recover-key',
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
      return new Response(JSON.stringify({ error: 'Order ID enter karna zaroori hai.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanOrderId = order_id.trim();
    const ordersStore = getAppStore('orders');
    const existingOrder = (await ordersStore.get(cleanOrderId, { type: 'json' })) as OrderRecord | null;

    if (!existingOrder) {
      return new Response(
        JSON.stringify({
          found: false,
          error: 'Yeh Order ID system mein nahi mila. Kripya check karke dobara enter karein.',
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // If already marked as paid
    if (existingOrder.status === 'paid' && existingOrder.accessKey) {
      return new Response(
        JSON.stringify({
          found: true,
          status: 'paid',
          accessKey: existingOrder.accessKey,
          planId: existingOrder.planId,
          order_id: existingOrder.order_id,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Try checking live with ZapUPI in case webhook was delayed
    try {
      const zapData = await verifyZapUpiStatus(cleanOrderId);
      if (zapData && zapData.status === 'Success') {
        const result = await fulfillOrder(cleanOrderId, {
          txn_id: zapData.txn_id,
          utr: zapData.utr,
        });

        return new Response(
          JSON.stringify({
            found: true,
            status: 'paid',
            accessKey: result.accessKey,
            planId: result.planId,
            order_id: cleanOrderId,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } catch {
      // Continue to response
    }

    return new Response(
      JSON.stringify({
        found: true,
        status: existingOrder.status,
        message: 'Aapka payment abhi pending ya incomplete hai. Agar paise kat gaye hain, toh thodi der mein refresh karein ya WhatsApp support par contact karein.',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('recover-key error:', err.message);
    return new Response(JSON.stringify({ error: 'Key recover karne mein takleef hui.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
