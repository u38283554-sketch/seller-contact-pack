import crypto from 'crypto';
import { getStore } from '@netlify/blobs';
import { PLANS } from './config.js';

export interface OrderRecord {
  order_id: string;
  planId: 'starter' | 'pro';
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  whatsapp?: string;
  renewKey?: string;
  createdAt: string;
  paidAt?: string;
  accessKey?: string;
  txn_id?: string;
  utr?: string;
}

export interface LicenseRecord {
  accessKey: string;
  planId: 'starter' | 'pro';
  createdAt: string;
  expiresAt: string; // ISO string
  limit: number;
  used: number;
  orders: string[]; // Order IDs associated
  whatsapp?: string;
}

export interface FreeUsageRecord {
  deviceHash: string;
  used: number;
  limit: number;
  updatedAt: string;
}

// In-memory fallback stores for local development without Netlify environment
const localMemoryStore = {
  orders: new Map<string, string>(),
  licenses: new Map<string, string>(),
  'free-usage': new Map<string, string>(),
};

function hasNetlifyBlobsEnv(): boolean {
  return Boolean(
    process.env.NETLIFY_BLOBS_CONTEXT ||
    (process.env.NETLIFY_SITE_ID && process.env.NETLIFY_API_TOKEN)
  );
}

// Helper to access a blob store with fallback
export function getAppStore(name: 'orders' | 'licenses' | 'free-usage') {
  if (hasNetlifyBlobsEnv()) {
    try {
      return getStore({
        name,
        consistency: 'strong',
      });
    } catch {
      // fallback
    }
  }

  // Local memory store emulator
  const map = localMemoryStore[name];
  return {
    async get(key: string, options?: { type?: 'json' | 'text' }) {
      const val = map.get(key);
      if (!val) return null;
      if (options?.type === 'json') {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return val;
    },
    async setJSON(key: string, data: any) {
      map.set(key, JSON.stringify(data));
      return { etag: Date.now().toString() };
    },
    async delete(key: string) {
      map.delete(key);
    },
  };
}

export function generateAccessKey(): string {
  const buf = crypto.randomBytes(6).toString('hex').toUpperCase();
  const chunk1 = buf.slice(0, 4);
  const chunk2 = buf.slice(4, 8);
  const chunk3 = buf.slice(8, 12);
  return `SCP-${chunk1}-${chunk2}-${chunk3}`;
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SCP${timestamp}${rand}`;
}

export function hashDevice(ip: string, deviceId: string): string {
  const secret = process.env.TOKEN_SECRET || 'scp_default_token_secret_dev_mode';
  return crypto.createHmac('sha256', secret).update(`${ip}:${deviceId}`).digest('hex');
}

/**
 * Idempotently marks an order as paid, creates or extends the license, and returns the license info.
 */
export async function fulfillOrder(orderId: string, txnDetails: { txn_id?: string; utr?: string } = {}) {
  const ordersStore = getAppStore('orders');
  const licensesStore = getAppStore('licenses');

  const orderData = (await ordersStore.get(orderId, { type: 'json' })) as OrderRecord | null;
  if (!orderData) {
    throw new Error('Order not found');
  }

  // If already processed and has an access key, return existing key idempotently
  if (orderData.status === 'paid' && orderData.accessKey) {
    const existingLicense = (await licensesStore.get(orderData.accessKey, { type: 'json' })) as LicenseRecord | null;
    return {
      accessKey: orderData.accessKey,
      planId: orderData.planId,
      expiresAt: existingLicense?.expiresAt || '',
      limit: existingLicense?.limit || 0,
      used: existingLicense?.used || 0,
      isRenewal: Boolean(orderData.renewKey),
    };
  }

  const plan = PLANS[orderData.planId];
  if (!plan) {
    throw new Error('Invalid plan on order');
  }

  const now = new Date();
  let targetKey = orderData.renewKey;
  let isRenewal = false;
  let license: LicenseRecord;

  if (targetKey) {
    // Renewal: extend existing key
    const existing = (await licensesStore.get(targetKey, { type: 'json' })) as LicenseRecord | null;
    if (existing) {
      isRenewal = true;
      const currentExpiry = new Date(existing.expiresAt);
      const baseDate = currentExpiry > now ? currentExpiry : now;
      const newExpiry = new Date(baseDate.getTime() + plan.days * 24 * 60 * 60 * 1000);

      license = {
        ...existing,
        planId: orderData.planId,
        expiresAt: newExpiry.toISOString(),
        limit: plan.limit, // reset limit to new plan limit
        used: 0,
        orders: [...(existing.orders || []), orderId],
        whatsapp: orderData.whatsapp || existing.whatsapp,
      };
    } else {
      // Key not found, create fresh key
      targetKey = generateAccessKey();
      const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000).toISOString();
      license = {
        accessKey: targetKey,
        planId: orderData.planId,
        createdAt: now.toISOString(),
        expiresAt,
        limit: plan.limit,
        used: 0,
        orders: [orderId],
        whatsapp: orderData.whatsapp,
      };
    }
  } else {
    // Fresh purchase: create new access key
    targetKey = generateAccessKey();
    const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000).toISOString();
    license = {
      accessKey: targetKey,
      planId: orderData.planId,
      createdAt: now.toISOString(),
      expiresAt,
      limit: plan.limit,
      used: 0,
      orders: [orderId],
      whatsapp: orderData.whatsapp,
    };
  }

  // Save license
  await licensesStore.setJSON(targetKey, license);

  // Update order record
  orderData.status = 'paid';
  orderData.paidAt = now.toISOString();
  orderData.accessKey = targetKey;
  if (txnDetails.txn_id) orderData.txn_id = txnDetails.txn_id;
  if (txnDetails.utr) orderData.utr = txnDetails.utr;
  await ordersStore.setJSON(orderId, orderData);

  return {
    accessKey: targetKey,
    planId: orderData.planId,
    expiresAt: license.expiresAt,
    limit: license.limit,
    used: license.used,
    isRenewal,
  };
}

/**
 * Reserves 1 generation quota before calling the AI.
 */
export async function reserveQuota(auth: { accessKey?: string; deviceHash?: string }) {
  if (auth.accessKey) {
    const licensesStore = getAppStore('licenses');
    const license = (await licensesStore.get(auth.accessKey, { type: 'json' })) as LicenseRecord | null;
    if (!license) {
      return { allowed: false, error: 'Aapki Access Key invalid hai. Kripya check karein.' };
    }

    const now = new Date();
    if (new Date(license.expiresAt) < now) {
      return { allowed: false, error: 'Aapka plan expire ho gaya hai. Dobara renew karein.' };
    }

    if (license.used >= license.limit) {
      return { allowed: false, error: 'Aapki plan generation limit khatam ho chuki hai. Renew karein.' };
    }

    // Reserve 1 count
    license.used += 1;
    await licensesStore.setJSON(auth.accessKey, license);
    return {
      allowed: true,
      isPaid: true,
      remaining: Math.max(0, license.limit - license.used),
      limit: license.limit,
      used: license.used,
    };
  }

  if (auth.deviceHash) {
    const freeStore = getAppStore('free-usage');
    const freeRecord = ((await freeStore.get(auth.deviceHash, { type: 'json' })) as FreeUsageRecord | null) || {
      deviceHash: auth.deviceHash,
      used: 0,
      limit: PLANS.free.limit,
      updatedAt: new Date().toISOString(),
    };

    if (freeRecord.used >= freeRecord.limit) {
      return {
        allowed: false,
        error: 'Aapke device ka 1 free try khatam ho chuka hai! Unlimited access ke liye Starter ya Pro plan lein.',
      };
    }

    // Reserve 1 free try
    freeRecord.used += 1;
    freeRecord.updatedAt = new Date().toISOString();
    await freeStore.setJSON(auth.deviceHash, freeRecord);
    return {
      allowed: true,
      isPaid: false,
      remaining: Math.max(0, freeRecord.limit - freeRecord.used),
      limit: freeRecord.limit,
      used: freeRecord.used,
    };
  }

  return { allowed: false, error: 'Authorization missing. Please provide Access Key or Device ID.' };
}

/**
 * Refunds 1 reserved count if generation completely failed.
 */
export async function refundQuota(auth: { accessKey?: string; deviceHash?: string }) {
  try {
    if (auth.accessKey) {
      const licensesStore = getAppStore('licenses');
      const license = (await licensesStore.get(auth.accessKey, { type: 'json' })) as LicenseRecord | null;
      if (license && license.used > 0) {
        license.used -= 1;
        await licensesStore.setJSON(auth.accessKey, license);
      }
    } else if (auth.deviceHash) {
      const freeStore = getAppStore('free-usage');
      const freeRecord = (await freeStore.get(auth.deviceHash, { type: 'json' })) as FreeUsageRecord | null;
      if (freeRecord && freeRecord.used > 0) {
        freeRecord.used -= 1;
        await freeStore.setJSON(auth.deviceHash, freeRecord);
      }
    }
  } catch (err) {
    console.error('Failed to refund quota:', (err as any)?.message);
  }
}
