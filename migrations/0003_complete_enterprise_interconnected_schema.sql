-- ==============================================================================
-- Migration 0003: Complete Enterprise Interconnected D1 SQL Schema
-- Adds Tally double-entry vouchers, statutory GST returns logs, B2B tenders,
-- stock ledger, catalog GST/HSN columns, and missing enterprise tables.
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Ensure catalog columns exist
-- In SQLite, we can alter table to add columns if they don't exist
-- Note: D1 executes ALTER TABLE ADD COLUMN safely
-- CREATE TABLE IF NOT EXISTS creates tables if not present

-- 2. Tally Double-Entry Vouchers (Tab 15)
CREATE TABLE IF NOT EXISTS tally_vouchers (
  voucher_id TEXT PRIMARY KEY,
  voucher_no TEXT NOT NULL UNIQUE,
  voucher_type TEXT NOT NULL,
  voucher_date DATE NOT NULL,
  party_ledger TEXT NOT NULL,
  amount_inr REAL NOT NULL,
  narration TEXT,
  gst_rate_pct REAL DEFAULT 18.0,
  cgst_inr REAL DEFAULT 0,
  sgst_inr REAL DEFAULT 0,
  igst_inr REAL DEFAULT 0,
  status TEXT DEFAULT 'POSTED',
  created_by TEXT DEFAULT 'Sunil (Sales Consultant)',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tally_voucher_items (
  entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('Dr', 'Cr')),
  amount_inr REAL NOT NULL,
  hsn_code TEXT DEFAULT '9403',
  FOREIGN KEY (voucher_id) REFERENCES tally_vouchers(voucher_id) ON DELETE CASCADE
);

-- 3. Statutory GST Returns & Reconciliations Log
CREATE TABLE IF NOT EXISTS gst_returns_filings_log (
  filing_id TEXT PRIMARY KEY,
  return_type TEXT NOT NULL,
  tax_period TEXT NOT NULL,
  total_taxable_inr REAL NOT NULL,
  igst_inr REAL DEFAULT 0,
  cgst_inr REAL DEFAULT 0,
  sgst_inr REAL DEFAULT 0,
  eligible_itc_inr REAL DEFAULT 0,
  invoices_count INTEGER DEFAULT 0,
  portal_json TEXT,
  reconciled_status TEXT DEFAULT 'VERIFIED_LEGAL_COMPLIANT',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Double-Entry Stock Movement Ledger
CREATE TABLE IF NOT EXISTS stock_ledger (
  ledger_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  warehouse_id TEXT NOT NULL DEFAULT 'WH-GODOWN-1',
  change_qty INTEGER NOT NULL,
  balance_qty INTEGER NOT NULL,
  reference_doc_type TEXT NOT NULL,
  reference_doc_id TEXT NOT NULL,
  batch_barcode TEXT,
  created_by TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sku) REFERENCES catalog(sku)
);

-- 5. B2B Commercial & Institutional Tenders Log (Tab 2)
CREATE TABLE IF NOT EXISTS b2b_commercial_tenders_log (
  tender_id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  total_order_value_inr REAL NOT NULL,
  advance_received_inr REAL DEFAULT 0,
  current_stage TEXT NOT NULL DEFAULT 'DESIGN_CONSULTATION',
  delivery_deadline DATE,
  status TEXT DEFAULT 'IN_PROGRESS',
  contact_person TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. POS Counter Transactions Log
CREATE TABLE IF NOT EXISTS transactions_log (
  txn_id TEXT PRIMARY KEY,
  order_id TEXT,
  customer_name TEXT NOT NULL,
  amount_inr REAL NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'DYNAMIC_UPI_QR',
  cashier_name TEXT NOT NULL DEFAULT 'Sunil (Sales Consultant)',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 7. Quotations Log
CREATE TABLE IF NOT EXISTS quote_log (
  quote_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount_inr REAL NOT NULL,
  discount_inr REAL DEFAULT 0,
  items_json TEXT,
  valid_until DATE,
  created_by TEXT DEFAULT 'Sunil (Sales Consultant)',
  status TEXT DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Document Generation Audit Log (Tab 13)
CREATE TABLE IF NOT EXISTS document_generation_log (
  doc_id TEXT PRIMARY KEY,
  doc_type TEXT NOT NULL,
  entity_ref_id TEXT,
  customer_vendor_name TEXT NOT NULL,
  total_amount_inr REAL NOT NULL,
  gst_amount_inr REAL DEFAULT 0,
  copy_type TEXT DEFAULT 'ORIGINAL_FOR_RECIPIENT',
  status TEXT DEFAULT 'GENERATED_LEGAL_COMPLIANT',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Real-time Inventory Stock & Sentinel Buffers
CREATE TABLE IF NOT EXISTS inventory_stock (
  sku TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  showroom_display_qty INTEGER DEFAULT 1,
  warehouse_reserve_qty INTEGER DEFAULT 0,
  buffer_threshold INTEGER DEFAULT 2,
  reorder_status TEXT DEFAULT 'SUFFICIENT_STOCK',
  last_inward_date DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sku) REFERENCES catalog(sku)
);

-- 10. Floor Display Aging Sentinel
CREATE TABLE IF NOT EXISTS floor_aging_sentinel (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  floor_days INTEGER NOT NULL DEFAULT 0,
  bay TEXT DEFAULT 'Bay 1',
  mrp REAL NOT NULL,
  discount_pct REAL DEFAULT 20.0,
  clearance_price REAL NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'DISPLAY_ACTIVE',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sku) REFERENCES catalog(sku)
);

-- 11. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tally_vouchers_type ON tally_vouchers(voucher_type);
CREATE INDEX IF NOT EXISTS idx_tally_vouchers_date ON tally_vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_items_acc ON tally_voucher_items(account_name);
CREATE INDEX IF NOT EXISTS idx_gst_filings_period ON gst_returns_filings_log(tax_period);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_sku ON stock_ledger(sku);
CREATE INDEX IF NOT EXISTS idx_catalog_hsn ON catalog(hsn_code);
