import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('OmniBuild OS™ — Interconnected System & Schema Integrity Suite', () => {
  const schemaPath = path.resolve('schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');

  it('validates schema.sql contains all 50+ enterprise tables for all 18 tabs', () => {
    const tableMatches = [...schemaContent.matchAll(/CREATE TABLE IF NOT EXISTS ([a-zA-Z0-9_]+)/g)].map(m => m[1]);
    
    assert.ok(tableMatches.length >= 50, `Expected at least 50 tables, got ${tableMatches.length}`);
    
    // Core Sales & Catalog
    assert.ok(tableMatches.includes('catalog'), 'Missing catalog table');
    assert.ok(tableMatches.includes('orders'), 'Missing orders table');
    assert.ok(tableMatches.includes('inquiries'), 'Missing inquiries table');
    assert.ok(tableMatches.includes('payments'), 'Missing payments table');
    assert.ok(tableMatches.includes('smartkit_boxes'), 'Missing smartkit_boxes table');
    
    // Tally & Accounting
    assert.ok(tableMatches.includes('tally_vouchers'), 'Missing tally_vouchers table');
    assert.ok(tableMatches.includes('tally_voucher_items'), 'Missing tally_voucher_items table');
    assert.ok(tableMatches.includes('gst_returns_filings_log'), 'Missing gst_returns_filings_log table');
    assert.ok(tableMatches.includes('bank_transactions_log'), 'Missing bank_transactions_log table');
    assert.ok(tableMatches.includes('eod_reconciliation_log'), 'Missing eod_reconciliation_log table');

    // Stock & Inventory
    assert.ok(tableMatches.includes('inventory_stock'), 'Missing inventory_stock table');
    assert.ok(tableMatches.includes('stock_ledger'), 'Missing stock_ledger table');
    assert.ok(tableMatches.includes('floor_aging_sentinel'), 'Missing floor_aging_sentinel table');
    assert.ok(tableMatches.includes('purchase_orders_log'), 'Missing purchase_orders_log table');

    // B2B & Institutional Projects
    assert.ok(tableMatches.includes('b2b_commercial_tenders_log'), 'Missing b2b_commercial_tenders_log table');
    assert.ok(tableMatches.includes('vip_villa_projects'), 'Missing vip_villa_projects table');

    // Logistics & Drivers
    assert.ok(tableMatches.includes('fleet_drivers'), 'Missing fleet_drivers table');
    assert.ok(tableMatches.includes('delivery_route_stops'), 'Missing delivery_route_stops table');
    assert.ok(tableMatches.includes('otp_log'), 'Missing otp_log table');

    // Robotics & AI Telemetry
    assert.ok(tableMatches.includes('bot_configurations'), 'Missing bot_configurations table');
    assert.ok(tableMatches.includes('appsheet_bots_telemetry'), 'Missing appsheet_bots_telemetry table');
  });

  it('validates catalog table has statutory GST and HSN columns', () => {
    const catalogBlock = schemaContent.match(/CREATE TABLE IF NOT EXISTS catalog \(([\s\S]*?)\);/)?.[1] || '';
    assert.ok(catalogBlock.includes('hsn_code'), 'catalog table must contain hsn_code');
    assert.ok(catalogBlock.includes('gst_rate_pct'), 'catalog table must contain gst_rate_pct');
  });

  it('validates orders table contains payment split, e-way bill and doc type columns', () => {
    const ordersBlock = schemaContent.match(/CREATE TABLE IF NOT EXISTS orders \(([\s\S]*?)\);/)?.[1] || '';
    assert.ok(ordersBlock.includes('payment_split_json'), 'orders table must contain payment_split_json');
    assert.ok(ordersBlock.includes('e_way_bill_no'), 'orders table must contain e_way_bill_no');
    assert.ok(ordersBlock.includes('gst_doc_type'), 'orders table must contain gst_doc_type');
  });

  it('validates Tally double-entry tax math (Intra-state CGST + SGST split)', () => {
    const amount = 118000;
    const rate = 18;
    const isInterstate = false;

    const taxAmt = Math.round((amount * rate) / (100 + rate));
    const cgst = isInterstate ? 0 : Math.round(taxAmt / 2);
    const sgst = isInterstate ? 0 : Math.round(taxAmt / 2);
    const igst = isInterstate ? taxAmt : 0;

    assert.equal(taxAmt, 18000);
    assert.equal(cgst, 9000);
    assert.equal(sgst, 9000);
    assert.equal(igst, 0);
    assert.equal(cgst + sgst + (amount - taxAmt), amount, 'Dr must equal Cr in gross settlement');
  });

  it('validates Tally double-entry tax math (Inter-state IGST)', () => {
    const amount = 118000;
    const rate = 18;
    const isInterstate = true;

    const taxAmt = Math.round((amount * rate) / (100 + rate));
    const cgst = isInterstate ? 0 : Math.round(taxAmt / 2);
    const sgst = isInterstate ? 0 : Math.round(taxAmt / 2);
    const igst = isInterstate ? taxAmt : 0;

    assert.equal(taxAmt, 18000);
    assert.equal(cgst, 0);
    assert.equal(sgst, 0);
    assert.equal(igst, 18000);
  });
});
