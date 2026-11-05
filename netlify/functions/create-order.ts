import { PLANS } from '../lib/config.js';
import { getAppStore, generateOrderId, OrderRecord } from '../lib/store.js';
import { createZapUpiOrder } from '../lib/zapupi.js';

export const config = {
  path: '/api/create-order',
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
    const { plan: planId, renewKey, whatsapp } = body;

    if (!planId || !['starter', 'pro'].includes(planId)) {
      return new Response(JSON.stringify({ error: 'Valid plan (starter ya pro) select karein.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedPlan = PLANS[planId as 'starter' | 'pro'];
    const price = selectedPlan.price; // Comes STRICTLY from server config

    // Validate optional phone number
    let cleanWhatsapp: string | undefined = undefined;
    if (whatsapp) {
      const digits = String(whatsapp).replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 15) {
        cleanWhatsapp = digits;
      }
    }

    const orderId = generateOrderId();
    const ordersStore = getAppStore('orders');

    const newOrder: OrderRecord = {
      order_id: orderId,
      planId: planId as 'starter' | 'pro',
      amount: price,
      status: 'pending',
      whatsapp: cleanWhatsapp,
      renewKey: renewKey ? String(renewKey).trim() : undefined,
      createdAt: new Date().toISOString(),
    };

    // Save order in strong consistency store
    await ordersStore.setJSON(orderId, newOrder);

    // Determine site URL
    const envSiteUrl = process.env.SITE_URL;
    let siteUrl = envSiteUrl;
    if (!siteUrl) {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host');
      const proto = req.headers.get('x-forwarded-proto') || 'https';
      siteUrl = origin || (host ? `${proto}://${host}` : 'http://localhost:3000');
    }

    // Call ZapUPI create-order API
    const paymentUrl = await createZapUpiOrder({
      orderId,
      amount: price,
      mobile: cleanWhatsapp,
      remark: `SCP - ${selectedPlan.name}`,
      siteUrl,
    });

    return new Response(
      JSON.stringify({
        status: 'success',
        order_id: orderId,
        payment_url: paymentUrl,
        amount: price,
        plan: selectedPlan.name,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('create-order error:', err.message);
    return new Response(
      JSON.stringify({
        error: err.message || 'Payment link create karne mein error aaya. Kripya thodi der baad try karein.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
