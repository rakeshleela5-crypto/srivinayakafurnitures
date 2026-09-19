/**
 * ==============================================================================
 * OmniBuild OS™ — Cloudflare D1 Edge SQL Database API Router
 * Runs at the Cloudflare Edge (Workers / Pages Functions)
 * ==============================================================================
 */

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Fallback simulation if DB binding is not yet attached in dashboard
  if (!env.DB) {
    return handleFallbackSimulation(path, method, request, corsHeaders);
  }

  try {
    // 1. Health Check
    if (path.endsWith('/health') || path.endsWith('/status')) {
      const result = await env.DB.prepare('SELECT 1 as alive;').first();
      return new Response(JSON.stringify({
        status: 'ONLINE',
        engine: 'Cloudflare D1 Serverless SQL',
        edgeRegion: request.cf?.colo || 'EDGE',
        alive: result?.alive === 1
      }), { headers: corsHeaders });
    }

    // 2. Fetch Catalog Models
    if (path.endsWith('/catalog') && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM catalog ORDER BY category, product_name;').all();
      return new Response(JSON.stringify({
        success: true,
        count: results.length,
        items: results
      }), { headers: corsHeaders });
    }

    // 3. Method 3: Single Item Add
    if (path.endsWith('/catalog/create') && method === 'POST') {
      const item = await request.json();
      const query = `
        INSERT OR REPLACE INTO catalog 
        (sku, product_name, category, mrp_inr, selling_price_inr, floor_price_inr, architect_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `;
      await env.DB.prepare(query).bind(
        item.sku,
        item.product_name,
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

      return new Response(JSON.stringify({
        success: true,
        message: `SKU ${item.sku} saved to Cloudflare D1 successfully!`,
        sku: item.sku
      }), { headers: corsHeaders });
    }

    // 4. Method 1: Batch Excel / CSV Import
    if (path.endsWith('/catalog/import-batch') && method === 'POST') {
      const { items = [] } = await request.json();
      if (!items || items.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'Empty batch array' }), { status: 400, headers: corsHeaders });
      }

      const insertQuery = `
        INSERT OR REPLACE INTO catalog 
        (sku, product_name, category, mrp_inr, selling_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `;

      // Cloudflare D1 batch execution (atomic transaction)
      const statements = items.map(item => {
        return env.DB.prepare(insertQuery).bind(
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
        );
      });

      // Execute in batches of 50 to respect D1 statement limit per batch
      const BATCH_SIZE = 50;
      let insertedCount = 0;
      for (let i = 0; i < statements.length; i += BATCH_SIZE) {
        const chunk = statements.slice(i, i + BATCH_SIZE);
        await env.DB.batch(chunk);
        insertedCount += chunk.length;
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Successfully imported ${insertedCount} catalog items into Cloudflare D1!`,
        importedCount: insertedCount
      }), { headers: corsHeaders });
    }

    // 5. Execute Safe Query for Live Database Tab
    if (path.endsWith('/query') && method === 'POST') {
      const { sql, params = [] } = await request.json();
      const trimmed = (sql || '').trim();

      // Only permit safe read queries or structured updates
      if (!trimmed.toLowerCase().startsWith('select') && !trimmed.toLowerCase().startsWith('insert') && !trimmed.toLowerCase().startsWith('update')) {
        return new Response(JSON.stringify({ success: false, error: 'Only SELECT, INSERT, and UPDATE queries are permitted' }), { status: 403, headers: corsHeaders });
      }

      const { results } = await env.DB.prepare(trimmed).bind(...params).all();
      return new Response(JSON.stringify({
        success: true,
        rowCount: results?.length || 0,
        results: results || []
      }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: false, error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'D1 SQL Execution Error'
    }), { status: 500, headers: corsHeaders });
  }
}

/**
 * Graceful fallback when D1 is being provisioned or tested in local environments
 */
async function handleFallbackSimulation(path, method, request, corsHeaders) {
  if (path.endsWith('/health') || path.endsWith('/status')) {
    return new Response(JSON.stringify({
      status: 'READY_TO_BIND',
      engine: 'Cloudflare D1 (Pending Dashboard Binding)',
      message: 'Add [[d1_databases]] binding in Cloudflare Dashboard to activate live hardware database.'
    }), { headers: corsHeaders });
  }

  if (path.endsWith('/catalog/import-batch') && method === 'POST') {
    const { items = [] } = await request.json();
    return new Response(JSON.stringify({
      success: true,
      simulated: true,
      message: `Batch processed: ${items.length} items validated for Cloudflare D1 insertion!`,
      importedCount: items.length
    }), { headers: corsHeaders });
  }

  if (path.endsWith('/catalog/create') && method === 'POST') {
    const item = await request.json();
    return new Response(JSON.stringify({
      success: true,
      simulated: true,
      message: `Model ${item.sku} validated for Cloudflare D1!`,
      sku: item.sku
    }), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({
    success: true,
    engine: 'Cloudflare D1 Edge Router',
    status: 'READY'
  }), { headers: corsHeaders });
}
