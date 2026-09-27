-- Migration 0004: Add Missing 9 Enterprise Tables to Cloudflare D1 Remote

CREATE TABLE IF NOT EXISTS stock_ledger (
  ledger_id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL,
  warehouse_id TEXT NOT NULL DEFAULT 'WH-GODOWN-1',
  change_qty INTEGER NOT NULL, -- Positive = Inward, Negative = Outward
  balance_qty INTEGER NOT NULL,
  reference_doc_type TEXT NOT NULL, -- 'PO', 'SALES_ORDER', 'STOCK_TRANSFER', 'DAMAGE_CLAIM'
  reference_doc_id TEXT NOT NULL,
  batch_barcode TEXT,
  created_by TEXT NOT NULL DEFAULT 'SYSTEM',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sku) REFERENCES catalog(sku)
);

CREATE TABLE IF NOT EXISTS transit_lr_tracking (
  lr_number TEXT PRIMARY KEY,
  transporter_name TEXT DEFAULT 'VRL Logistics / Safechem',
  dispatch_date TEXT NOT NULL,
  expected_delivery TEXT NOT NULL,
  days_in_transit INTEGER DEFAULT 1,
  boxes_count INTEGER NOT NULL,
  status TEXT DEFAULT 'IN_TRANSIT',
  insurance_claim_filed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_invoices_ledger (
  invoice_id TEXT PRIMARY KEY,
  supplier_name TEXT DEFAULT 'Godrej Interio Corporate',
  invoice_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  invoice_amount_inr REAL NOT NULL,
  discount_eligible_inr REAL DEFAULT 0,
  status TEXT DEFAULT 'DISCOUNT_ALERTED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tally_vouchers (
  voucher_id TEXT PRIMARY KEY,
  voucher_no TEXT NOT NULL UNIQUE,
  voucher_type TEXT NOT NULL, -- 'CONTRA', 'PAYMENT', 'RECEIPT', 'JOURNAL', 'SALES', 'PURCHASE'
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

CREATE TABLE IF NOT EXISTS gst_returns_filings_log (
  filing_id TEXT PRIMARY KEY,
  return_type TEXT NOT NULL, -- 'GSTR_1', 'GSTR_3B', 'GSTR_2B_RECON', 'EWAY_BILL'
  tax_period TEXT NOT NULL, -- e.g. '092026'
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

CREATE TABLE IF NOT EXISTS bot_configurations (
  bot_id TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  department TEXT NOT NULL,
  is_enabled INTEGER DEFAULT 1,
  schedule_cron TEXT NOT NULL,
  scheduled_time_ist TEXT NOT NULL,
  frequency_label TEXT NOT NULL,
  threshold_value REAL DEFAULT 0,
  discount_pct REAL DEFAULT 0,
  recipient_phone TEXT DEFAULT '+91 93905 53301',
  recipient_role TEXT DEFAULT 'Store Director',
  whatsapp_template TEXT,
  last_triggered_at DATETIME,
  last_status TEXT DEFAULT 'IDLE',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_anniversary_log (
  log_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  purchased_date TEXT NOT NULL,
  nudge_type TEXT DEFAULT '1_YEAR_HYDRAULIC_LUBRICATION',
  status TEXT DEFAULT 'MESSAGE_DISPATCHED',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE IF NOT EXISTS carpenter_installation_slas (
  sla_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  carpenter_name TEXT DEFAULT 'Narayana Mistri',
  delivered_at DATETIME NOT NULL,
  deadline_at DATETIME NOT NULL,
  status TEXT DEFAULT 'ASSEMBLY_PENDING',
  customer_rating INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

