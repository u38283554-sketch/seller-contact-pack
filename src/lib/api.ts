import { getStoredAccessKey, getOrCreateDeviceId } from './storage';
import { ProductInput, ContentPack, AccountState, PlanConfig } from '../types';

export interface PublicConfig {
  brand: {
    name: string;
    tagline: string;
    supportWhatsapp: string;
    supportWhatsappRaw: string;
    supportEmail: string;
  };
  plans: Record<string, PlanConfig>;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const accessKey = getStoredAccessKey();
  if (accessKey) {
    headers['x-access-key'] = accessKey;
  } else {
    headers['x-device-id'] = getOrCreateDeviceId();
  }
  return headers;
}

export async function fetchPublicConfig(): Promise<PublicConfig> {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('Failed to load configuration');
  return res.json();
}

export async function fetchAccount(): Promise<AccountState> {
  const res = await fetch('/api/account', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch account info');
  }
  return res.json();
}

export async function createOrder(params: {
  plan: 'starter' | 'pro';
  renewKey?: string;
  whatsapp?: string;
}) {
  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error || 'Order create karne mein issue aaya.');
  }
  return data as { status: string; order_id: string; payment_url: string; amount: number; plan: string };
}

export async function checkPaymentStatus(orderId: string) {
  const res = await fetch('/api/check-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment check fail hua.');
  }
  return data as {
    status: 'paid' | 'pending' | 'failed';
    accessKey?: string;
    expiry?: string;
    plan?: string;
    limit?: number;
    message?: string;
    error?: string;
  };
}

export async function recoverKeyByOrderId(orderId: string) {
  const res = await fetch('/api/recover-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_id: orderId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Recovery request failed');
  }
  return data as {
    found: boolean;
    status: string;
    accessKey?: string;
    planId?: string;
    order_id?: string;
    error?: string;
    message?: string;
  };
}

export async function generateContent(product: ProductInput, part?: 'A' | 'B' | 'C') {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ product, part }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.error || data.safetyRefusal || 'Content generate karne mein error aaya.';
    const err: any = new Error(errorMsg);
    err.quotaExhausted = data.quotaExhausted;
    err.safetyRefusal = data.safetyRefusal;
    throw err;
  }

  return data as {
    status: string;
    content?: ContentPack;
    part?: 'A' | 'B' | 'C';
    data?: any;
    remaining?: number;
    limit?: number;
    used?: number;
  };
}
