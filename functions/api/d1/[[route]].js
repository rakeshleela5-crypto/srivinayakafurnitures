/**
 * ==============================================================================
 * OmniBuild OS™ — Cloudflare Sovereign Edge Backend (Hono-Powered)
 * Refactored from monolithic onRequest handler to structured Hono routing.
 *
 * Route modules:
 *   lib/cors.js         — CORS middleware
 *   lib/normalizers.js  — Dual-key data normalizers
 *   lib/copilot.js      — D1 SQL Copilot (natural-language queries)
 *   routes/core.js      — REST: /health, /sync-all, /catalog, /orders, etc.
 *   routes/dispatch.js  — POST /dispatch — all 51 action types
 *   routes/cron.js      — GET /cron/* — 20 scheduled bot endpoints
 *   routes/ai.js        — POST /ai/chat, /ai/transcribe, /storage/*, etc.
 * ==============================================================================
 */
import { Hono } from 'hono';
import { corsMiddleware } from './lib/cors.js';
import { coreRoutes } from './routes/core.js';
import { dispatchRoutes } from './routes/dispatch.js';
import { cronRoutes } from './routes/cron.js';
import { aiRoutes } from './routes/ai.js';

// ==============================================================================
// 🏗️  Build the Hono app
// ==============================================================================
const app = new Hono();

// Global CORS (handles OPTIONS preflight automatically)
app.use('*', corsMiddleware);

// Mount route modules
app.route('/', coreRoutes);
app.route('/dispatch', dispatchRoutes);
app.route('/cron', cronRoutes);
app.route('/ai', aiRoutes);
app.route('/storage', aiRoutes);       // Storage endpoints live in aiRoutes
app.route('/documents', aiRoutes);     // Invoice renderer lives in aiRoutes
app.route('/analytics', aiRoutes);     // Analytics events live in aiRoutes
app.route('/queue', aiRoutes);         // Queue endpoints live in aiRoutes
app.route('/workflows', aiRoutes);     // Workflow endpoints live in aiRoutes
app.route('/stream', aiRoutes);        // Stream endpoints live in aiRoutes

// 404 fallback
app.notFound((c) => c.json({ success: false, error: 'Endpoint not found' }, 404));

// Global error handler
app.onError((err, c) => {
  console.error('[OmniBuild OS Error]', err);
  return c.json({ success: false, error: err.message || 'D1 SQL Execution Error' }, 500);
});

// ==============================================================================
// 🔌 Cloudflare Pages Functions export
// Pages Functions expects { onRequest } — we wrap Hono's fetch handler
// ==============================================================================
export async function onRequest(context) {
  return app.fetch(context.request, context.env, context);
}

// ==============================================================================
// ⏰ Scheduled Cron Trigger Handler (Workers cron triggers)
// Maps cron schedule → the corresponding /cron/* endpoint internally
// ==============================================================================
export async function scheduled(event, env, ctx) {
  const cronMap = {
    '30 15 * * *': '/cron/9pm-summary',
    '30 4 * * *':  '/cron/morning-followups',
    '0 */2 * * *': '/cron/safelock-expiry-guard',
    '0 10 * * *':  '/cron/fleet-dispatch-manifest',
    '30 4 * * 1':  '/cron/architect-commission',
    '30 5 * * *':  '/cron/floor-aging-radar',
    '0 3 * * *':   '/cron/bank-utr-reconcile',
    '30 18 * * *': '/cron/midnight-maintenance-backup',
    '0 */4 * * *': '/cron/factory-auto-po',
    '30 11 * * *': '/cron/carpenter-sla-sentinel',
    '30 6 * * *':  '/cron/customer-anniversary-care',
    '30 3 1 * *':  '/cron/monthly-gst-3b-ledger',
    '30 14 * * *': '/cron/staff-leaderboard',
    '30 12 * * *': '/cron/google-review-booster',
    '30 10 * * *': '/cron/balance-due-chaser',
    '30 5 * * 3':  '/cron/supplier-early-discount',
    '30 8 * * *':  '/cron/transit-lr-radar',
    '*/30 * * * *': '/cron/smartkit-dock-integrity',
    '0 18 * * 0':  '/cron/security-vault-digest',
    '30 4 * * 6':  '/cron/bridal-registry',
  };

  const cronPath = cronMap[event.cron] || '/cron/eod-summary';
  const fakeRequest = new Request(`https://worker.internal${cronPath}`, { method: 'GET' });
  ctx.waitUntil(app.fetch(fakeRequest, env));
}

// Named export for Cloudflare Workers (non-Pages) compatibility
export default { fetch: app.fetch, scheduled };
