/**
 * Vite dev-server plugin that serves the Vercel Functions in api/v1 locally, so `npm start`
 * works without `vercel dev` (no Vercel login or project link needed).
 * Dev server only (`apply: 'serve'`); production uses Vercel's own routing.
 */
import { Readable } from 'node:stream';

import { loadEnv } from 'vite';

// Mirrors Vercel's file-system routing for the files in api/v1.
const ROUTES = [
  { pattern: /^\/api\/v1\/me$/, file: '/api/v1/me.js' },
  { pattern: /^\/api\/v1\/sessions$/, file: '/api/v1/sessions.js' },
  { pattern: /^\/api\/v1\/link-previews$/, file: '/api/v1/link-previews.js' },
  { pattern: /^\/api\/v1\/registry-details$/, file: '/api/v1/registry-details.js' },
  { pattern: /^\/api\/v1\/hero-photo$/, file: '/api/v1/hero-photo.js' },
  { pattern: /^\/api\/v1\/items$/, file: '/api/v1/items/index.js' },
  { pattern: /^\/api\/v1\/items\/[^/]+$/, file: '/api/v1/items/[id].js' },
  { pattern: /^\/api\/v1\/items\/[^/]+\/purchases$/, file: '/api/v1/items/[id]/purchases.js' },
  { pattern: /^\/api\/v1\/purchases$/, file: '/api/v1/purchases/index.js' },
  { pattern: /^\/api\/v1\/purchases\/[^/]+$/, file: '/api/v1/purchases/[id].js' },
];

// Survives Vite's in-process restarts (module re-evaluation) so stale keys can be cleaned up.
const injectedEnvKeys = (globalThis.__babyRegistryInjectedEnv ??= new Set());

const notFound = (res) => {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ code: 'NOT_FOUND', message: 'Resource not found.' }));
};

const toWebRequest = (req, origin) => {
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  return new Request(new URL(req.url, origin), {
    method: req.method,
    headers: req.headers,
    body: hasBody ? Readable.toWeb(req) : undefined,
    duplex: hasBody ? 'half' : undefined,
  });
};

const sendWebResponse = async (response, res) => {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(Buffer.from(await response.arrayBuffer()));
};

export const apiDevServer = () => ({
  name: 'baby-registry-api-dev',
  apply: 'serve',
  configureServer(server) {
    // Expose server-side variables from .env / .env.local to the handlers (Vite only exposes VITE_*).
    // Vite restarts in the same process when an env file changes, so values injected last time are
    // removed first — otherwise a deleted line (e.g. AUTH_DISABLED) would linger until a full restart.
    for (const key of injectedEnvKeys) delete process.env[key];
    injectedEnvKeys.clear();

    const env = loadEnv(server.config.mode, server.config.root, '');
    for (const [key, value] of Object.entries(env)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
        injectedEnvKeys.add(key);
      }
    }

    server.middlewares.use(async (req, res, next) => {
      const { pathname } = new URL(req.url, 'http://localhost');
      if (!pathname.startsWith('/api/')) return next();

      const route = ROUTES.find(({ pattern }) => pattern.test(pathname));
      if (!route) return notFound(res);

      try {
        const module = await server.ssrLoadModule(route.file);
        const handler = module[req.method];
        if (!handler) {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' }));
          return;
        }
        const origin = `http://${req.headers.host ?? 'localhost'}`;
        await sendWebResponse(await handler(toWebRequest(req, origin)), res);
      } catch (error) {
        next(error);
      }
    });
  },
});
