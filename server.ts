import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Netlify function handlers
import createOrderHandler from './netlify/functions/create-order.ts';
import checkPaymentHandler from './netlify/functions/check-payment.ts';
import webhookHandler from './netlify/functions/zapupi-webhook.ts';
import generateHandler from './netlify/functions/generate.ts';
import accountHandler from './netlify/functions/account.ts';
import recoverKeyHandler from './netlify/functions/recover-key.ts';
import configHandler from './netlify/functions/config.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Helper to adapt Express req/res to Netlify Functions v2 (Web standard Request/Response)
function adaptHandler(handler: (req: Request) => Promise<Response>) {
  return async (req: express.Request, res: express.Response) => {
    try {
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const headers = new Headers();
      for (const [key, val] of Object.entries(req.headers)) {
        if (Array.isArray(val)) {
          val.forEach((v) => headers.append(key, v));
        } else if (val !== undefined) {
          headers.set(key, val);
        }
      }

      const body =
        req.method !== 'GET' && req.method !== 'HEAD'
          ? JSON.stringify(req.body)
          : undefined;

      const webReq = new Request(url, {
        method: req.method,
        headers,
        body,
      });

      const webRes = await handler(webReq);

      res.status(webRes.status);
      webRes.headers.forEach((v, k) => res.setHeader(k, v));

      const responseText = await webRes.text();
      res.send(responseText);
    } catch (err: any) {
      console.error('Express handler adapter error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Register API routes matching Netlify function paths
app.all('/api/create-order', adaptHandler(createOrderHandler));
app.all('/api/check-payment', adaptHandler(checkPaymentHandler));
app.all('/api/zapupi-webhook', adaptHandler(webhookHandler));
app.all('/api/generate', adaptHandler(generateHandler));
app.all('/api/account', adaptHandler(accountHandler));
app.all('/api/recover-key', adaptHandler(recoverKeyHandler));
app.all('/api/config', adaptHandler(configHandler));

// Mount Vite in dev mode or serve static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);

    // SPA fallback in development mode
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  VITE v8.3.0  ready in 150 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/\n`);
  });
}

startServer();
