import { checkRateLimit } from '../lib/rateLimit.js';
import { hashDevice, reserveQuota, refundQuota } from '../lib/store.js';
import {
  generateFullPack,
  generatePartA,
  generatePartB,
  generatePartC,
  ProductInput,
} from '../lib/ai.js';

export const config = {
  path: '/api/generate',
};

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const accessKey = req.headers.get('x-access-key')?.trim();
    const clientDeviceId = req.headers.get('x-device-id')?.trim();

    // Client IP detection
    const clientIp =
      req.headers.get('x-nf-client-connection-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1';

    const deviceHash = clientDeviceId ? hashDevice(clientIp, clientDeviceId) : undefined;
    const rateLimitIdentifier = accessKey || deviceHash || clientIp;

    // 1. Rate Limiting (max 5 requests per minute)
    const rateCheck = checkRateLimit(rateLimitIdentifier, 5, 60000);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Aap bahot tezi se request bhej rahe hain. Kripya ${rateCheck.retryAfterSeconds} second wait karein.`,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { product, part } = body; // part can be "A", "B", "C" for single retry

    if (!product || !product.name || !product.features) {
      return new Response(
        JSON.stringify({ error: 'Product name aur key features likhna zaroori hai.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Input validation & capping
    const sanitizedInput: ProductInput = {
      name: String(product.name).slice(0, 150).trim(),
      category: product.category ? String(product.category).slice(0, 50).trim() : undefined,
      price: product.price ? String(product.price).slice(0, 20).trim() : undefined,
      features: String(product.features).slice(0, 1000).trim(),
      targetCustomer: product.targetCustomer ? String(product.targetCustomer).slice(0, 100).trim() : undefined,
      offer: product.offer ? String(product.offer).slice(0, 100).trim() : undefined,
      platform: product.platform ? String(product.platform).slice(0, 50).trim() : 'Meesho / Instagram / WhatsApp',
      language: product.language ? String(product.language).slice(0, 50).trim() : 'Hinglish (Roman script)',
      tone: product.tone ? String(product.tone).slice(0, 50).trim() : 'Persuasive & Friendly',
    };

    // 2. Single-part regeneration (Free retry for failed parts - does NOT deduct quota)
    if (part === 'A' || part === 'B' || part === 'C') {
      try {
        let singleResult: any;
        if (part === 'A') singleResult = await generatePartA(sanitizedInput);
        if (part === 'B') singleResult = await generatePartB(sanitizedInput);
        if (part === 'C') singleResult = await generatePartC(sanitizedInput);

        return new Response(
          JSON.stringify({
            status: 'success',
            part,
            data: singleResult,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            error: 'Yeh part regenerate nahi ho paya. Kripya 1 minute baad try karein.',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 3. Full Generation: Reserve quota BEFORE calling AI
    const authRecord = { accessKey, deviceHash };
    const quota = await reserveQuota(authRecord);

    if (!quota.allowed) {
      return new Response(
        JSON.stringify({
          error: quota.error,
          quotaExhausted: true,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Execute AI Generation
    try {
      const contentPack = await generateFullPack(sanitizedInput);

      if (contentPack.safetyRefusal) {
        // Refund quota because this was rejected by safety policy
        await refundQuota(authRecord);
        return new Response(
          JSON.stringify({
            safetyRefusal: contentPack.safetyRefusal,
            remaining: (quota.remaining ?? 0) + 1,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          status: 'success',
          content: contentPack,
          isPaid: quota.isPaid,
          remaining: quota.remaining,
          limit: quota.limit,
          used: quota.used,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (aiErr: any) {
      // If AI failed completely, refund the generation
      await refundQuota(authRecord);

      return new Response(
        JSON.stringify({
          error: 'Service thodi busy hai, 1 minute baad try karo.',
          refunded: true,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (err: any) {
    console.error('generate endpoint error:', err.message);
    return new Response(
      JSON.stringify({ error: 'Server par temporary issue aaya. Dobara try karein.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
