import { BRAND_CONFIG, PLANS } from '../lib/config.js';

export const config = {
  path: '/api/config',
};

export default async () => {
  return new Response(
    JSON.stringify({
      brand: BRAND_CONFIG,
      plans: PLANS,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    }
  );
};
