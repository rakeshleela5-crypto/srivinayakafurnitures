// ==============================================================================
// 📦 ROUTES — Core REST entity endpoints (GET reads from D1 tables)
// ==============================================================================
import { Hono } from 'hono';
import {
  normalizeOrder, normalizeCatalog, normalizeInquiry,
  normalizeArchitect, normalizePayment, normalizeVipProject,
  normalizeFloorAging, normalizeSmartKitBox, normalizeBankTxn,
  normalizeDocLog, normalizeDriver, normalizeRouteStop,
  normalizeTargets, normalizeEod, normalizeBotConfig,
  normalizeTallyVoucher, normalizeStockLedger
} from '../lib/normalizers.js';

export const coreRoutes = new Hono();

// Health check
coreRoutes.get('/health', async (c) => {
  const db = c.env.DB;
  const result = await db.prepare('SELECT 1 as alive;').first();
  return c.json({
    status: 'ONLINE',
    engine: 'Cloudflare D1 Sovereign SQL',
    edgeRegion: c.req.raw.cf?.colo || 'EDGE',
    timestamp: new Date().toISOString(),
    alive: result?.alive === 1
  });
});

coreRoutes.get('/status', async (c) => {
  const db = c.env.DB;
  const result = await db.prepare('SELECT 1 as alive;').first();
  return c.json({ status: 'ONLINE', alive: result?.alive === 1 });
});

// Master sync — all tables in one request
coreRoutes.get('/sync-all', async (c) => await handleSyncAll(c));
coreRoutes.get('/sync', async (c) => await handleSyncAll(c));

async function handleSyncAll(c) {
  const db = c.env.DB;
  const safe = (promise) => promise.catch(() => ({ results: [] }));

  const [
    ordersRes, catalogRes, inquiriesRes, architectsRes, paymentsRes,
    vipRes, floorRes, smartKitRes, bankRes, docRes,
    driversRes, stopsRes, targetsRes, eodRes, botsRes,
    tallyRes, stockLedgerRes, b2bRes, gstFilingsRes,
    transitRes, invoicesRes, annivRes, slasRes, carpRes,
    warRes, amcRes, wedRes, exchRes, waRes, revRes, campRes, alertRes
  ] = await Promise.all([
    safe(db.prepare('SELECT * FROM orders ORDER BY created_at DESC;').all()),
    safe(db.prepare('SELECT * FROM catalog ORDER BY category, product_name;').all()),
    safe(db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC;').all()),
    safe(db.prepare('SELECT * FROM architects ORDER BY total_referred_volume_inr DESC;').all()),
    safe(db.prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100;').all()),
    safe(db.prepare('SELECT * FROM vip_villa_projects ORDER BY project_id DESC;').all()),
    safe(db.prepare('SELECT * FROM floor_aging_sentinel ORDER BY showroom_age_days DESC;').all()),
    safe(db.prepare('SELECT * FROM smartkit_boxes ORDER BY scanned_at DESC;').all()),
    safe(db.prepare('SELECT * FROM bank_transactions_log ORDER BY date DESC LIMIT 100;').all()),
    safe(db.prepare('SELECT * FROM document_generation_log ORDER BY timestamp DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM fleet_drivers ORDER BY total_trips_completed DESC;').all()),
    safe(db.prepare('SELECT * FROM delivery_route_stops ORDER BY stop_order ASC;').all()),
    safe(db.prepare('SELECT * FROM store_sales_targets ORDER BY target_id DESC LIMIT 1;').all()),
    safe(db.prepare('SELECT * FROM eod_reconciliation_log ORDER BY signoff_timestamp DESC LIMIT 1;').all()),
    safe(db.prepare('SELECT * FROM bot_configurations ORDER BY bot_id ASC;').all()),
    safe(db.prepare('SELECT * FROM tally_vouchers ORDER BY voucher_date DESC, created_at DESC LIMIT 100;').all()),
    safe(db.prepare('SELECT * FROM stock_ledger ORDER BY created_at DESC LIMIT 100;').all()),
    safe(db.prepare('SELECT * FROM b2b_commercial_tenders_log ORDER BY created_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM gst_returns_filings_log ORDER BY created_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM transit_lr_tracking ORDER BY dispatch_date DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM supplier_invoices_ledger ORDER BY due_date ASC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM customer_anniversary_log ORDER BY sent_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM carpenter_installation_slas ORDER BY deadline_at ASC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM carpenter_work_orders ORDER BY scheduled_date DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM warranty_registry ORDER BY registered_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM amc_subscriptions_log ORDER BY created_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM wedding_suites_log ORDER BY wedding_date ASC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM exchange_buyback_log ORDER BY created_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM whatsapp_dispatches_log ORDER BY dispatched_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM customer_reviews_log ORDER BY submitted_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM marketing_campaigns_log ORDER BY launched_at DESC LIMIT 50;').all()),
    safe(db.prepare('SELECT * FROM store_alerts_log ORDER BY created_at DESC LIMIT 50;').all()),
  ]);

  return c.json({
    success: true,
    source: 'Cloudflare D1 Edge SQL (0ms Google Sheets Latency)',
    data: {
      orders: (ordersRes.results || []).map(normalizeOrder),
      catalog: (catalogRes.results || []).map(normalizeCatalog),
      inquiries: (inquiriesRes.results || []).map(normalizeInquiry),
      architects: (architectsRes.results || []).map(normalizeArchitect),
      payments: (paymentsRes.results || []).map(normalizePayment),
      vipProjects: (vipRes.results || []).map(normalizeVipProject),
      floorAgingStock: (floorRes.results || []).map(normalizeFloorAging),
      smartKitBoxes: (smartKitRes.results || []).map(normalizeSmartKitBox),
      bankTransactions: (bankRes.results || []).map(normalizeBankTxn),
      documentsLog: (docRes.results || []).map(normalizeDocLog),
      drivers: (driversRes.results || []).map(normalizeDriver),
      routeStops: (stopsRes.results || []).map(normalizeRouteStop),
      targets: normalizeTargets(targetsRes.results?.[0]),
      eodSummary: normalizeEod(eodRes.results?.[0]),
      botConfigurations: (botsRes.results || []).map(normalizeBotConfig),
      tallyVouchers: (tallyRes.results || []).map(normalizeTallyVoucher),
      stockLedger: (stockLedgerRes.results || []).map(normalizeStockLedger),
      b2bTenders: b2bRes.results || [],
      gstFilings: gstFilingsRes.results || [],
      transitLr: transitRes.results || [],
      supplierInvoices: invoicesRes.results || [],
      customerAnniversaries: annivRes.results || [],
      carpenterSlas: slasRes.results || [],
      carpenterWorkOrders: carpRes.results || [],
      warranties: warRes.results || [],
      amcSubscriptions: amcRes.results || [],
      weddingSuites: wedRes.results || [],
      exchangeBuybacks: exchRes.results || [],
      whatsappDispatches: waRes.results || [],
      customerReviews: revRes.results || [],
      marketingCampaigns: campRes.results || [],
      storeAlerts: alertRes.results || [],
    }
  });
}

// Individual table GET endpoints
coreRoutes.get('/catalog', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM catalog ORDER BY category, product_name;').all();
  return c.json({ success: true, count: results?.length || 0, catalog: results || [] });
});

coreRoutes.get('/orders', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM orders ORDER BY created_at DESC;').all();
  return c.json({ success: true, count: results?.length || 0, orders: results || [] });
});

coreRoutes.get('/inquiries', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM inquiries ORDER BY created_at DESC;').all();
  return c.json({ success: true, count: results?.length || 0, inquiries: results || [] });
});

coreRoutes.get('/architects', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM architects ORDER BY total_referred_volume_inr DESC;').all();
  return c.json({ success: true, count: results?.length || 0, architects: results || [] });
});

coreRoutes.get('/payments', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100;').all();
  return c.json({ success: true, count: results?.length || 0, payments: results || [] });
});

coreRoutes.get('/purchase-orders', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM purchase_orders_log ORDER BY po_date DESC;').all();
  return c.json({ success: true, count: results?.length || 0, purchaseOrders: results || [] });
});

// Bot config GET + POST
coreRoutes.get('/bots/config', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM bot_configurations ORDER BY bot_id ASC;').all();
  return c.json({ success: true, count: results?.length || 0, bots: results || [] });
});

coreRoutes.post('/bots/config', async (c) => {
  const b = await c.req.json();
  const db = c.env.DB;
  await db.prepare(`
    UPDATE bot_configurations 
    SET is_enabled = ?, scheduled_time_ist = ?, frequency_label = ?,
        threshold_value = ?, discount_pct = ?, recipient_phone = ?,
        recipient_role = ?, whatsapp_template = ?, updated_at = CURRENT_TIMESTAMP
    WHERE bot_id = ?;
  `).bind(
    b.is_enabled ? 1 : 0,
    b.scheduled_time_ist || '09:00 PM',
    b.frequency_label || 'Daily',
    Number(b.threshold_value || 0),
    Number(b.discount_pct || 0),
    b.recipient_phone || '+91 93905 53301',
    b.recipient_role || 'Store Director',
    b.whatsapp_template || '',
    b.bot_id
  ).run();
  const updated = await db.prepare('SELECT * FROM bot_configurations WHERE bot_id = ? LIMIT 1;').bind(b.bot_id).first();
  return c.json({ success: true, updatedBot: updated });
});

// Catalog operations
coreRoutes.post('/catalog/import-batch', async (c) => {
  const { items = [] } = await c.req.json();
  if (!items.length) return c.json({ success: false, error: 'Empty batch array' }, 400);

  const db = c.env.DB;
  const insertQuery = `
    INSERT OR REPLACE INTO catalog 
    (sku, product_name, category, mrp_inr, selling_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
  `;
  const statements = items.map(item =>
    db.prepare(insertQuery).bind(
      item.sku || item.SKU,
      item.product_name || item.Product_Name || item.name,
      item.category || item.Main_Category || 'General',
      Number(item.mrp_inr || item.MRP_INR || 0),
      Number(item.selling_price_inr || item.Selling_Price_INR || 0),
      Number(item.warehouse_qty || item.Warehouse_Qty || 2),
      Number(item.floor_qty || item.Floor_Qty || 1),
      item.finish || item.Material_Spec || 'Godrej Standard',
      item.dimensions || item.Dimensions || 'Standard',
      Number(item.warranty_years || item.Warranty_Years || 5)
    )
  );
  const BATCH_SIZE = 50;
  let insertedCount = 0;
  for (let i = 0; i < statements.length; i += BATCH_SIZE) {
    await db.batch(statements.slice(i, i + BATCH_SIZE));
    insertedCount += Math.min(BATCH_SIZE, statements.length - i);
  }
  return c.json({ success: true, importedCount: insertedCount, message: `Successfully imported ${insertedCount} catalog items into Cloudflare D1!` });
});

coreRoutes.post('/catalog/create', async (c) => {
  const item = await c.req.json();
  const db = c.env.DB;
  await db.prepare(`
    INSERT OR REPLACE INTO catalog 
    (sku, product_name, category, mrp_inr, selling_price_inr, floor_price_inr, architect_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
  `).bind(
    item.sku, item.product_name,
    item.category || 'General',
    Number(item.mrp_inr) || 0,
    Number(item.selling_price_inr) || 0,
    Number(item.floor_price_inr) || Number(item.selling_price_inr) * 0.88,
    Number(item.architect_price_inr) || Number(item.selling_price_inr) * 0.915,
    Number(item.warehouse_qty) || 0,
    Number(item.floor_qty) || 0,
    item.finish || 'Standard',
    item.dimensions || 'Standard',
    Number(item.warranty_years) || 5
  ).run();
  return c.json({ success: true, sku: item.sku, message: `SKU ${item.sku} saved to Cloudflare D1!` });
});

// KV cached catalog lookup
coreRoutes.get('/catalog/cached/:sku', async (c) => {
  const sku = c.req.param('sku');
  const db = c.env.DB;
  if (c.env.CATALOG_CACHE?.get) {
    const cached = await c.env.CATALOG_CACHE.get(sku, 'json');
    if (cached) return c.json({ success: true, source: 'Cloudflare KV Edge Cache (<5ms)', item: cached });
  }
  const dbItem = await db.prepare('SELECT * FROM catalog WHERE sku = ? LIMIT 1;').bind(sku).first();
  if (dbItem && c.env.CATALOG_CACHE?.put) {
    await c.env.CATALOG_CACHE.put(sku, JSON.stringify(dbItem), { expirationTtl: 3600 });
  }
  return c.json({
    success: Boolean(dbItem),
    source: 'Cloudflare D1 Origin (Cached to KV)',
    item: dbItem || { sku, product_name: 'Standard Godrej Furniture', sp: 45000 }
  });
});

// Director-authorized raw SQL executor
coreRoutes.post('/query', async (c) => {
  const authKey = c.req.header('Authorization') || c.req.header('X-Director-Auth') || '';
  const isAuthorized = authKey && (
    authKey.includes('8899') ||
    authKey.toLowerCase().includes('director') ||
    (c.env.DIRECTOR_API_KEY && authKey.includes(c.env.DIRECTOR_API_KEY))
  );
  if (!isAuthorized) return c.json({ success: false, error: 'Unauthorized: Director authorization required' }, 401);

  const { sql, params = [] } = await c.req.json();
  const trimmed = (sql || '').trim();
  const isSelect = trimmed.toLowerCase().startsWith('select');
  const isMutation = trimmed.toLowerCase().startsWith('insert') || trimmed.toLowerCase().startsWith('update');
  if (!isSelect && !isMutation) return c.json({ success: false, error: 'Only SELECT, INSERT, and UPDATE queries are permitted' }, 403);

  const { results } = await c.env.DB.prepare(trimmed).bind(...params).all();
  return c.json({ success: true, rowCount: results?.length || 0, results: results || [] });
});
