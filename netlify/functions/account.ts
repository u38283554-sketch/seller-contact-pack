import { PLANS } from '../lib/config.js';
import { getAppStore, hashDevice, LicenseRecord, FreeUsageRecord } from '../lib/store.js';

export const config = {
  path: '/api/account',
};

export default async (req: Request) => {
  try {
    const accessKey = req.headers.get('x-access-key')?.trim();
    const clientDeviceId = req.headers.get('x-device-id')?.trim();

    if (accessKey) {
      const licensesStore = getAppStore('licenses');
      const license = (await licensesStore.get(accessKey, { type: 'json' })) as LicenseRecord | null;

      if (!license) {
        return new Response(JSON.stringify({ valid: false, error: 'Access Key invalid hai.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const now = new Date();
      const expiry = new Date(license.expiresAt);
      const isExpired = expiry < now;
      const msLeft = expiry.getTime() - now.getTime();
      const daysLeft = isExpired ? 0 : Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      const remainingGens = Math.max(0, license.limit - license.used);
      const plan = PLANS[license.planId];

      return new Response(
        JSON.stringify({
          valid: true,
          isPaid: true,
          planId: license.planId,
          planName: plan?.name || 'Active Plan',
          accessKey: license.accessKey,
          expiresAt: license.expiresAt,
          daysLeft,
          isExpired,
          limit: license.limit,
          used: license.used,
          remainingGens,
          needsRenewal: isExpired || daysLeft <= 3 || remainingGens <= 10,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Free device check
    if (clientDeviceId) {
      const clientIp =
        req.headers.get('x-nf-client-connection-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        '127.0.0.1';
      const deviceHash = hashDevice(clientIp, clientDeviceId);
      const freeStore = getAppStore('free-usage');
      const freeRecord = ((await freeStore.get(deviceHash, { type: 'json' })) as FreeUsageRecord | null) || {
        deviceHash,
        used: 0,
        limit: PLANS.free.limit,
        updatedAt: new Date().toISOString(),
      };

      const remainingGens = Math.max(0, freeRecord.limit - freeRecord.used);

      return new Response(
        JSON.stringify({
          valid: true,
          isPaid: false,
          planId: 'free',
          planName: 'Free Try',
          limit: freeRecord.limit,
          used: freeRecord.used,
          remainingGens,
          needsRenewal: remainingGens <= 0,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(JSON.stringify({ valid: false, error: 'No authorization provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('account endpoint error:', err.message);
    return new Response(JSON.stringify({ error: 'Account info check karne mein error aaya.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
