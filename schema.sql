-- ==============================================================================
-- OmniBuild OS™ — Cloudflare D1 Edge SQL Database Master Schema
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
-- Database Engine: Cloudflare D1 (Serverless SQLite at the Edge)
-- ==============================================================================

-- 1. Furniture Catalog (SKUs, Models, Pricing, Display Aging & Stock)
CREATE TABLE IF NOT EXISTS catalog (
  sku TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  mrp_inr REAL NOT NULL,
  selling_price_inr REAL NOT NULL,
  floor_price_inr REAL,
  architect_price_inr REAL,
  warehouse_qty INTEGER DEFAULT 0,
  floor_qty INTEGER DEFAULT 0,
  showroom_display_qty INTEGER DEFAULT 1,
  display_floor_days INTEGER DEFAULT 0,
  buffer_threshold INTEGER DEFAULT 2,
  finish TEXT,
  dimensions TEXT,
  warranty_years INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SafeLock Customer Orders
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  phone TEXT,
  project_address TEXT,
  delivery_address TEXT,
  ordered_sku TEXT,
  sku TEXT,
  item_names TEXT,
  product_name TEXT,
  items_json TEXT,
  total_amount_inr REAL NOT NULL,
  advance_paid_inr REAL DEFAULT 0,
  advance_token_inr REAL DEFAULT 0,
  balance_due_inr REAL DEFAULT 0,
  safelock_status TEXT DEFAULT 'SAFELOCKED',
  status TEXT DEFAULT 'SAFELOCKED',
  delivery_schedule TEXT,
  assigned_driver TEXT,
  carpenter_assigned TEXT,
  otp_code TEXT DEFAULT '5842',
  payment_mode TEXT DEFAULT 'DYNAMIC_UPI_QR',
  architect_id TEXT,
  architect_name TEXT,
  manager_remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Inquiries & VIP Leads
CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  phone TEXT,
  address TEXT DEFAULT 'Rayagada',
  category_models TEXT,
  interested_category TEXT,
  budget_inr REAL DEFAULT 0,
  ai_intent_score TEXT DEFAULT '85%',
  assigned_staff TEXT DEFAULT 'Sunil (Sales Executive)',
  occasion TEXT DEFAULT 'HOME_UPGRADE',
  status TEXT DEFAULT 'NEW_HOT_LEAD',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Dynamic Payments & UPI Settlements
CREATE TABLE IF NOT EXISTS payments (
  txn_id TEXT PRIMARY KEY,
  payment_id TEXT,
  order_id TEXT,
  customer_name TEXT NOT NULL,
  payment_type TEXT DEFAULT 'ADVANCE_50',
  amount_inr REAL NOT NULL,
  payment_mode TEXT DEFAULT 'DYNAMIC_UPI_QR',
  upi_vpa TEXT DEFAULT '9390553301@ybl',
  upi_transaction_ref TEXT,
  utr_reference TEXT,
  reconciliation_status TEXT DEFAULT 'SETTLED',
  status TEXT DEFAULT 'SETTLED',
  bank_verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 5. Architect & VIP Interior Designer Ledger
CREATE TABLE IF NOT EXISTS architects (
  architect_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  architect_name TEXT,
  phone TEXT NOT NULL,
  firm_name TEXT,
  city TEXT DEFAULT 'Rayagada',
  tier TEXT DEFAULT 'GOLD_TIER',
  commission_pct REAL DEFAULT 10.0,
  total_referred_volume_inr REAL DEFAULT 0,
  total_payout_settled_inr REAL DEFAULT 0,
  balance_due_inr REAL DEFAULT 0,
  upi_id TEXT,
  last_commission_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. SmartKit Flat-Pack Box Components (Carton Tracking)
CREATE TABLE IF NOT EXISTS smartkit_boxes (
  box_barcode TEXT PRIMARY KEY,
  order_id TEXT,
  sku TEXT,
  product_name TEXT,
  box_number INTEGER,
  total_boxes INTEGER,
  box_status TEXT DEFAULT 'STAGED',
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 7. Daily Sales Summary (EOD 9:00 PM Automation)
CREATE TABLE IF NOT EXISTS daily_sales_summary (
  summary_date TEXT PRIMARY KEY,
  day_name TEXT DEFAULT 'Today',
  walkin_footfall INTEGER DEFAULT 0,
  total_orders_booked INTEGER DEFAULT 0,
  gross_sales_inr REAL DEFAULT 0,
  advance_collected_inr REAL DEFAULT 0,
  safelock_conversion_pct TEXT DEFAULT '75%',
  upi_settled_inr REAL DEFAULT 0,
  cash_in_safe_inr REAL DEFAULT 0,
  discrepancy_inr REAL DEFAULT 0,
  director_signoff TEXT DEFAULT 'VERIFIED ✓',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. EOD Cash & Safe Reconciliation Log
CREATE TABLE IF NOT EXISTS eod_reconciliation_log (
  log_id TEXT PRIMARY KEY,
  closing_date TEXT NOT NULL,
  opening_cash_inr REAL DEFAULT 0,
  cash_collected_inr REAL DEFAULT 0,
  cash_expense_inr REAL DEFAULT 0,
  cash_in_safe_inr REAL DEFAULT 0,
  upi_settled_inr REAL DEFAULT 0,
  discrepancy_inr REAL DEFAULT 0,
  audited_by TEXT DEFAULT 'Store Director (Verified)',
  signoff_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Architect Weekly Commission Ledger Log
CREATE TABLE IF NOT EXISTS architect_commissions_log (
  payout_id TEXT PRIMARY KEY,
  architect_id TEXT NOT NULL,
  architect_name TEXT NOT NULL,
  project_count INTEGER DEFAULT 1,
  weekly_volume_inr REAL NOT NULL,
  commission_rate_pct REAL NOT NULL,
  gross_commission_inr REAL NOT NULL,
  tds_10pct_inr REAL NOT NULL,
  net_payable_inr REAL NOT NULL,
  payout_status TEXT DEFAULT 'PENDING_UPI',
  settled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (architect_id) REFERENCES architects(architect_id)
);

-- 10. Bank Statement Reconciliation Transactions
CREATE TABLE IF NOT EXISTS bank_statement_transactions (
  bank_txn_id TEXT PRIMARY KEY,
  value_date TEXT NOT NULL,
  description TEXT NOT NULL,
  credit_inr REAL DEFAULT 0,
  debit_inr REAL DEFAULT 0,
  utr_reference TEXT,
  matched_order_id TEXT,
  reconciliation_state TEXT DEFAULT 'UNMATCHED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Delivery Manifest & Driver Stops
CREATE TABLE IF NOT EXISTS delivery_manifest_stops (
  stop_id TEXT PRIMARY KEY,
  manifest_date TEXT NOT NULL,
  driver_name TEXT DEFAULT 'Tophan Gouda (Tata Ace OD-18-B-4491)',
  lead_carpenter TEXT DEFAULT 'Narayana Mistri',
  order_id TEXT NOT NULL,
  stop_sequence INTEGER DEFAULT 1,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  balance_due_inr REAL DEFAULT 0,
  otp_code TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'SCHEDULED',
  epod_signature_key TEXT,
  epod_photo_key TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 13. Godrej Factory Auto-PO Tracking
CREATE TABLE IF NOT EXISTS factory_purchase_orders (
  po_id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  factory_name TEXT DEFAULT 'Godrej Khalapur Plant',
  order_qty INTEGER NOT NULL,
  estimated_cost_inr REAL NOT NULL,
  status TEXT DEFAULT 'DRAFTED_AUTO_CRON',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Carpenter Hydraulic Assembly SLA Sentinel
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

-- 15. Customer 1-Year Bed Hydraulic Care & Anniversary
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

-- 16. Bridal & Wedding Season VIP Suite Registry
CREATE TABLE IF NOT EXISTS wedding_registry_leads (
  registry_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  preferred_package TEXT DEFAULT 'Royal Bridal Teak Suite',
  budget_inr REAL DEFAULT 250000,
  status TEXT DEFAULT 'BRIDAL_CATALOG_SENT',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. Godrej Supplier Invoices & Early Payment Cash Discounts
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

-- 18. Factory Lorry Receipt (LR) & Transit Tracking
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

-- 19. High-Performance SQL Indexes for Sub-5ms Lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_safelock_status ON orders(safelock_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog(category);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bank_utr ON bank_statement_transactions(utr_reference);
CREATE INDEX IF NOT EXISTS idx_factory_po_sku ON factory_purchase_orders(sku);
CREATE INDEX IF NOT EXISTS idx_carpenter_sla ON carpenter_installation_slas(order_id);

-- 20. Sovereign Autonomous Bot Fleet Dynamic Configurations
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
CREATE INDEX IF NOT EXISTS idx_bot_config_dept ON bot_configurations(department);


