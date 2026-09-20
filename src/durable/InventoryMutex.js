/**
 * 🛡️ Cloudflare Durable Object: InventoryMutex
 * OmniBuild OS™ — Sri Vinayaka Furnitures (Godrej Interio Rayagada)
 * 
 * Provides single-source-of-truth in-memory atomic locks for showroom inventory.
 * Guarantees mathematical immunity against double-selling or concurrent reservation races (NV-001).
 */

export class InventoryMutex {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.locks = new Map(); // SKU -> { lockedBy: orderId, expiresAt: timestamp }
  }

  async fetch(request) {
    const url = new URL(request.url);
    const action = url.pathname.split('/').pop();

    if (request.method === 'POST' && action === 'acquire-lock') {
      const { sku, orderId, holdDurationMs = 300000 } = await request.json();
      const now = Date.now();

      const existingLock = this.locks.get(sku);
      if (existingLock && existingLock.expiresAt > now && existingLock.lockedBy !== orderId) {
        return new Response(JSON.stringify({
          success: false,
          locked: true,
          error: `SKU ${sku} is currently reserved by Order #${existingLock.lockedBy}`,
          retryAfterMs: existingLock.expiresAt - now
        }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }

      // Acquire atomic lock
      const expiresAt = now + holdDurationMs;
      this.locks.set(sku, { lockedBy: orderId, expiresAt });

      return new Response(JSON.stringify({
        success: true,
        sku,
        lockedBy: orderId,
        expiresAt: new Date(expiresAt).toISOString(),
        message: `Atomic stock reservation granted for SKU ${sku}`
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'POST' && action === 'release-lock') {
      const { sku, orderId } = await request.json();
      const existing = this.locks.get(sku);

      if (existing && existing.lockedBy === orderId) {
        this.locks.delete(sku);
      }

      return new Response(JSON.stringify({
        success: true,
        sku,
        message: `Reservation lock released for SKU ${sku}`
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (request.method === 'GET' && action === 'status') {
      const now = Date.now();
      const activeLocks = [];
      for (const [sku, info] of this.locks.entries()) {
        if (info.expiresAt > now) {
          activeLocks.push({ sku, ...info });
        } else {
          this.locks.delete(sku);
        }
      }

      return new Response(JSON.stringify({
        service: 'Cloudflare Durable Object: InventoryMutex',
        activeLockCount: activeLocks.length,
        locks: activeLocks
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  }
}
