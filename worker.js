/**
 * ==============================================================================
 * OmniBuild OS™ — Cloudflare Sovereign Edge Worker Entry Point
 * Unified entry point for Cloudflare Workers Builds & Workers Static Assets.
 *
 * Routes:
 *   - /api/d1-tables* -> functions/api/d1-tables.js
 *   - /api/*          -> functions/api/d1/[[route]].js (Hono Sovereign Edge Backend)
 *   - Static Assets   -> Cloudflare Workers Assets (dist/)
 * ==============================================================================
 */

import { onRequest as onD1Route, scheduled as d1Scheduled } from './functions/api/d1/[[route]].js';
import { onRequestGet as onD1TablesGet, onRequestPost as onD1TablesPost, onRequestOptions as onD1TablesOptions } from './functions/api/d1-tables.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle /api/d1-tables (Live D1 Database Explorer & Inline Cell Editor)
    if (url.pathname === '/api/d1-tables' || url.pathname.startsWith('/api/d1-tables/')) {
      const context = {
        request,
        env,
        ctx,
        params: {},
        waitUntil: (promise) => (ctx && ctx.waitUntil ? ctx.waitUntil(promise) : promise)
      };

      if (request.method === 'OPTIONS') {
        return onD1TablesOptions(context);
      } else if (request.method === 'GET') {
        return onD1TablesGet(context);
      } else if (request.method === 'POST') {
        return onD1TablesPost(context);
      }
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 2. Handle /api/* (All REST, Dispatch, Cron, and AI endpoints via Hono)
    if (url.pathname.startsWith('/api/')) {
      const context = {
        request,
        env,
        ctx,
        params: {},
        waitUntil: (promise) => (ctx && ctx.waitUntil ? ctx.waitUntil(promise) : promise)
      };
      return onD1Route(context);
    }

    // 3. Fallback to Static Assets (Vite SPA in ./dist)
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    if (typeof d1Scheduled === 'function') {
      return d1Scheduled(event, env, ctx);
    }
  }
};
