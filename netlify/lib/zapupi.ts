import { ZAPUPI_CONFIG } from './config.js';

export interface ZapCreateOrderResponse {
  status: string;
  payment_url?: string;
  message?: string;
  [key: string]: any;
}

export interface ZapOrderStatusResponse {
  status: string;
  data?: {
    status: 'Pending' | 'Success' | 'Failed' | string;
    amount?: string | number;
    pay_amount?: string | number;
    txn_id?: string;
    utr?: string;
    environment?: 'cashier' | 'zappay' | 'test' | string;
  };
  message?: string;
}

export async function createZapUpiOrder(params: {
  orderId: string;
  amount: number;
  mobile?: string;
  remark?: string;
  siteUrl: string;
}): Promise<string> {
  const zapKey = process.env.ZAP_KEY;
  if (!zapKey) {
    // If testing in dev without key, log warning
    console.warn('ZAP_KEY not found in environment');
    throw new Error('ZAP_KEY is not configured on the server');
  }

  const cleanSiteUrl = params.siteUrl.replace(/\/+$/, '');
  const resultUrl = `${cleanSiteUrl}/payment-result`;
  const webhookUrl = `${cleanSiteUrl}/api/zapupi-webhook`;

  const payload: any = {
    zap_key: zapKey,
    order_id: params.orderId,
    amount: String(params.amount),
    remark: params.remark || 'Seller Content Pack',
    webhook_url: webhookUrl,
    success_url: resultUrl,
    failed_url: resultUrl,
    timeout_url: resultUrl,
  };

  if (params.mobile) {
    payload.customer_mobile = params.mobile.replace(/\D/g, '');
  }

  const response = await fetch(ZAPUPI_CONFIG.createOrderUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    console.error(`ZapUPI create-order error status: ${response.status}`);
    throw new Error(`ZapUPI server responded with HTTP ${response.status}`);
  }

  const data: ZapCreateOrderResponse = await response.json();
  if (data.status !== 'success' || !data.payment_url) {
    const rawMsg = data.message || 'ZapUPI order creation failed';
    if (/insufficient.*topup|insufficient.*balance|topup/i.test(rawMsg)) {
      throw new Error(
        'Aapke ZapUPI dashboard mein "Wallet/Topup Balance" 0 hai. Kripya apne ZapUPI dashboard (zapupi.com) mein login karein aur "Wallet / Recharge" mein chhota topup (jaise ₹50 ya ₹100) karein taaki customers ke payments process ho sakein.'
      );
    }
    throw new Error(rawMsg);
  }

  return data.payment_url;
}

export async function verifyZapUpiStatus(orderId: string): Promise<ZapOrderStatusResponse['data'] | null> {
  const zapKey = process.env.ZAP_KEY;
  if (!zapKey) {
    throw new Error('ZAP_KEY is not configured on the server');
  }

  const response = await fetch(ZAPUPI_CONFIG.orderStatusUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      zap_key: zapKey,
      order_id: orderId,
    }),
  });

  if (!response.ok) {
    console.error(`ZapUPI order-status error status: ${response.status}`);
    throw new Error(`ZapUPI check failed with HTTP ${response.status}`);
  }

  const res: ZapOrderStatusResponse = await response.json();
  if (res.status === 'success' && res.data) {
    return res.data;
  }
  return null;
}
