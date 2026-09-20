-- ==============================================================================
-- OmniBuild OS™ — Cloudflare D1 Edge SQL Database Schema
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
-- Database Engine: Cloudflare D1 (Serverless SQLite at the Edge)
-- ==============================================================================

-- 1. Furniture Catalog (SKUs, Models, Pricing & Specifications)
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
  project_address TEXT,
  ordered_sku TEXT,
  item_names TEXT,
  total_amount_inr REAL NOT NULL,
  advance_paid_inr REAL DEFAULT 0,
  balance_due_inr REAL DEFAULT 0,
  safelock_status TEXT DEFAULT 'SAFELOCKED',
  delivery_schedule TEXT,
  assigned_driver TEXT,
  carpenter_assigned TEXT,
  otp_code TEXT DEFAULT '5842',
  payment_mode TEXT DEFAULT 'DYNAMIC_UPI_QR',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Inquiries & VIP Leads
CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address TEXT DEFAULT 'Rayagada',
  category_models TEXT,
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
  order_id TEXT,
  customer_name TEXT NOT NULL,
  payment_type TEXT DEFAULT 'ADVANCE_50',
  amount_inr REAL NOT NULL,
  payment_mode TEXT DEFAULT 'DYNAMIC_UPI_QR',
  upi_vpa TEXT DEFAULT '9390553301@ybl',
  upi_transaction_ref TEXT,
  reconciliation_status TEXT DEFAULT 'SETTLED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 5. Architect & VIP Interior Designer Ledger
CREATE TABLE IF NOT EXISTS architects (
  architect_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
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

-- 7. High-Performance SQL Indexes for Sub-5ms Lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(safelock_status);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog(category);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(customer_phone);
