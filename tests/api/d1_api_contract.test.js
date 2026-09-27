import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../../functions/api/d1/[[route]].js';

/**
 * Creates a mock Cloudflare D1 Database binding
 */
function createMockD1Database() {
  return {
    prepare: (sql) => {
      const stmt = {
        bind: (...args) => ({
          first: async () => {
            if (sql.includes('SELECT 1 as alive')) return { alive: 1 };
            return { total_orders: 8, total_sales: 420000, total_upi: 124000 };
          },
          all: async () => ({ results: [] }),
          run: async () => ({ success: true })
        }),
        first: async () => {
          if (sql.includes('SELECT 1 as alive')) return { alive: 1 };
          return { total_orders: 8, total_sales: 420000, total_upi: 124000 };
        },
        all: async () => ({
          results: [
            { sku: 'BED-MOD-001', product_name: 'Solid Teak King Bed', category: 'Bedroom', selling_price_inr: 62000, warehouse_qty: 4 }
          ]
        }),
        run: async () => ({ success: true })
      };
      return stmt;
    },
    batch: async (statements) => statements.map(() => ({ success: true }))
  };
}

/**
 * Helper to construct a mock Cloudflare execution context
 */
function createMockContext({
  url = 'https://srivinayakafurnitures.pages.dev/api/d1/health',
  method = 'GET',
  headers = {},
  body = null,
  env = {}
} = {}) {
  const reqHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers
  });

  const request = new Request(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : null
  });

  return { request, env };
}

describe('Sovereign Edge REST API Contract Testing (#21)', () => {
  const mockDB = createMockD1Database();

  describe('Health & Status Endpoints', () => {
    it('GET /api/d1/health with D1 binding returns 200 OK and ONLINE status', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/health',
        method: 'GET',
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Content-Type'), 'application/json');

      const data = await response.json();
      assert.equal(data.status, 'ONLINE');
      assert.equal(data.alive, true);
      assert.ok(data.timestamp);
    });

    it('GET /api/d1/health in simulation mode returns 200 OK with READY_TO_BIND notice', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/health',
        method: 'GET',
        env: {} // No DB binding
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.status, 'READY_TO_BIND');
    });

    it('OPTIONS request returns 200 with CORS headers', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/catalog',
        method: 'OPTIONS',
        headers: { 'Origin': 'https://srivinayakafurnitures.rakeshleela5.workers.dev' },
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 200);
      assert.ok(response.headers.get('Access-Control-Allow-Origin'));
      assert.ok(response.headers.get('Access-Control-Allow-Methods'));
    });
  });

  describe('Authentication & Authorization Gate (401 & 403 States)', () => {
    it('POST /api/d1/query returns 401 Unauthorized when missing Director Authorization header', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/query',
        method: 'POST',
        headers: {}, // Missing authorization
        body: { sql: 'SELECT * FROM orders;' },
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 401);

      const data = await response.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('Director authorization required'));
    });

    it('POST /api/d1/query returns 403 Forbidden when attempting destructive SQL (e.g. DROP/DELETE)', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/query',
        method: 'POST',
        headers: { 'Authorization': 'Bearer 8899' }, // Authorized Director token
        body: { sql: 'DROP TABLE orders;' }, // Destructive query forbidden
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 403);

      const data = await response.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('Only SELECT, INSERT, and UPDATE queries are permitted'));
    });

    it('POST /api/d1/query returns 200 OK when valid Director token (8899) and allowed query are provided', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/query',
        method: 'POST',
        headers: { 'Authorization': 'Bearer 8899' },
        body: { sql: 'SELECT COUNT(*) FROM orders;' },
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.success, true);
    });
  });

  describe('Input Validation & Error Edge Cases (400, 404, 500)', () => {
    it('GET /api/d1/unknown_nonexistent_endpoint returns 404 Not Found contract', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/unknown_nonexistent_endpoint',
        method: 'GET',
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 404);

      const data = await response.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'Endpoint not found');
    });

    it('Returns 500 Internal Server Error when D1 execution throws', async () => {
      const failingDB = {
        prepare: () => {
          throw new Error('Cloudflare D1 Query Execution Timeout');
        }
      };

      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/catalog',
        method: 'GET',
        env: { DB: failingDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 500);

      const data = await response.json();
      assert.equal(data.success, false);
      assert.ok(data.error.includes('Timeout'));
    });
  });

  describe('Master State Sync & Direct Entity Endpoints (Positive 200 Flows)', () => {
    it('GET /api/d1/sync-all returns 200 with complete 14-entity master data contract', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/sync-all',
        method: 'GET',
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.success, true);
      assert.ok(data.data, 'Response must contain master data wrapper');

      const requiredTables = [
        'orders',
        'catalog',
        'inquiries',
        'architects',
        'payments',
        'vipProjects',
        'floorAgingStock',
        'smartKitBoxes',
        'bankTransactions',
        'documentsLog',
        'drivers',
        'routeStops',
        'botConfigurations'
      ];

      for (const table of requiredTables) {
        assert.ok(table in data.data, `Data contract missing table: ${table}`);
        assert.ok(Array.isArray(data.data[table]), `${table} must be an array`);
      }
    });

    it('POST /api/d1/dispatch with CREATE_SAFELOCK_ORDER generates orderId and OTP in live D1', async () => {
      const ctx = createMockContext({
        url: 'https://srivinayakafurnitures.pages.dev/api/d1/dispatch',
        method: 'POST',
        body: {
          action: 'CREATE_SAFELOCK_ORDER',
          payload: {
            order_id: 'ORD-TEST-9988',
            customer_name: 'Dr. Subhashish Jena',
            customer_phone: '9437188291',
            project_address: 'Gayatri Nagar Villa, Rayagada',
            sku: 'BED-MOD-001',
            total_amount_inr: 65000,
            advance_paid_inr: 20000
          }
        },
        env: { DB: mockDB }
      });

      const response = await onRequest(ctx);
      assert.equal(response.status, 200);

      const data = await response.json();
      assert.equal(data.success, true);
      assert.equal(data.orderId, 'ORD-TEST-9988');
      assert.ok(data.otp);
    });
  });
});
