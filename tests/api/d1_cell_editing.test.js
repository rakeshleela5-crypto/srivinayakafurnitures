import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../../functions/api/d1-tables.js';

/**
 * Creates a mock Cloudflare D1 Database binding to track SQL executions
 */
function createMockD1Database() {
  const executedStatements = [];

  return {
    executedStatements,
    prepare: (sql) => ({
      bind: (...args) => ({
        run: async () => {
          executedStatements.push({ sql, args });
          return {
            meta: { changes: 1 },
            success: true
          };
        }
      })
    })
  };
}

function createMockContext({ body, env = {} }) {
  return {
    request: new Request('https://srivinayakafurnitures.pages.dev/api/d1-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://srivinayakafurnitures.pages.dev'
      },
      body: JSON.stringify(body)
    }),
    env
  };
}

describe('Cloudflare D1 In-Line Cell Editing & Persistence Suite', () => {
  it('updates text cell and executes parameterized SQL UPDATE', async () => {
    const mockDB = createMockD1Database();
    const ctx = createMockContext({
      body: {
        action: 'update_cell',
        tableName: 'catalog',
        primaryKeyColumn: 'sku',
        primaryKeyValue: 'BED-HYD-001',
        columnName: 'product_name',
        newValue: 'Kalista King Hydraulic Bed (Teak)',
        columnType: 'TEXT'
      },
      env: { DB: mockDB }
    });

    const res = await onRequestPost(ctx);
    assert.equal(res.status, 200);
    const json = await res.json();

    assert.equal(json.success, true);
    assert.equal(json.isLiveD1, true);
    assert.equal(mockDB.executedStatements.length, 1);
    assert.equal(mockDB.executedStatements[0].sql, 'UPDATE catalog SET product_name = ? WHERE sku = ?;');
    assert.deepEqual(mockDB.executedStatements[0].args, ['Kalista King Hydraulic Bed (Teak)', 'BED-HYD-001']);
  });

  it('coerces and updates numeric REAL price column correctly', async () => {
    const mockDB = createMockD1Database();
    const ctx = createMockContext({
      body: {
        action: 'update_cell',
        tableName: 'catalog',
        primaryKeyColumn: 'sku',
        primaryKeyValue: 'BED-HYD-001',
        columnName: 'selling_price_inr',
        newValue: '79500.50',
        columnType: 'REAL'
      },
      env: { DB: mockDB }
    });

    const res = await onRequestPost(ctx);
    assert.equal(res.status, 200);
    const json = await res.json();

    assert.equal(json.success, true);
    assert.equal(json.details.newValue, 79500.50);
    assert.equal(typeof json.details.newValue, 'number');
    assert.deepEqual(mockDB.executedStatements[0].args, [79500.50, 'BED-HYD-001']);
  });

  it('rejects invalid or dangerous SQL identifiers to prevent SQL injection', async () => {
    const mockDB = createMockD1Database();
    const ctx = createMockContext({
      body: {
        action: 'update_cell',
        tableName: 'catalog; DROP TABLE orders; --',
        primaryKeyColumn: 'sku',
        primaryKeyValue: 'BED-HYD-001',
        columnName: 'status',
        newValue: 'ACTIVE'
      },
      env: { DB: mockDB }
    });

    const res = await onRequestPost(ctx);
    assert.equal(res.status, 400);
    const json = await res.json();
    assert.equal(json.success, false);
    assert.match(json.error, /Invalid or missing SQL table name/);
    assert.equal(mockDB.executedStatements.length, 0);
  });
});
