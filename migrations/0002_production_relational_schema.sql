-- ==============================================================================
-- OmniBuild OS™ — Production-Grade Relational D1 Schema Migration
-- Architecture Pillar #09 (Schema Design) & #11 (Zero-Downtime Migration)
-- Client: Sri Vinayaka Furnitures (Rayagada Flagship Showroom)
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------------------------
-- 1. CUSTOMERS & VIP ACCOUNTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    gstin TEXT DEFAULT 'URP',
    billing_address TEXT NOT NULL,
    shipping_address TEXT,
    pincode TEXT NOT NULL DEFAULT '765001',
    state_code TEXT NOT NULL DEFAULT '21', -- Odisha State Code
    credit_limit_inr REAL DEFAULT 0.0,
    outstanding_balance_inr REAL DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_gstin ON customers(gstin);

-- ------------------------------------------------------------------------------
-- 2. MASTER PRODUCT CATALOG & HSN CODES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_products (
    sku TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    main_category TEXT NOT NULL,
    sub_category TEXT,
    hsn_code TEXT NOT NULL DEFAULT '9403',
    gst_rate_pct REAL NOT NULL DEFAULT 18.0,
    mrp_inr REAL NOT NULL,
    min_selling_price_inr REAL NOT NULL,
    standard_price_inr REAL NOT NULL,
    warranty_years INTEGER DEFAULT 5,
    material_spec TEXT,
    dimensions TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog_products(main_category, sub_category);
CREATE INDEX IF NOT EXISTS idx_catalog_hsn ON catalog_products(hsn_code);

-- ------------------------------------------------------------------------------
-- 3. WAREHOUSES & STORAGE HUBS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id TEXT PRIMARY KEY,
    warehouse_name TEXT NOT NULL,
    location_type TEXT NOT NULL CHECK(location_type IN ('SHOWROOM_DISPLAY', 'GODOWN_MAIN', 'WORKSHOP_TRANSIT', 'DAMAGED_CLEARANCE')),
    address TEXT,
    is_active INTEGER DEFAULT 1
);

INSERT OR IGNORE INTO warehouses (warehouse_id, warehouse_name, location_type, address) VALUES
('WH-SHOWROOM', 'Main Rayagada Showroom Display Floor', 'SHOWROOM_DISPLAY', 'Near Canara Bank, Rayagada, Odisha 765001'),
('WH-GODOWN-1', 'Central Godown Hub (Dock 1 & 2)', 'GODOWN_MAIN', 'Industrial Estate Road, Rayagada, Odisha 765001'),
('WH-WORKSHOP', 'Solid Wood Craft & Polish Workshop', 'WORKSHOP_TRANSIT', 'MIG Colony, Rayagada, Odisha 765001');

-- ------------------------------------------------------------------------------
-- 4. DOUBLE-ENTRY INVENTORY LEDGER (STOCK AUDIT TRAIL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_ledger (
    ledger_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL,
    warehouse_id TEXT NOT NULL,
    change_qty INTEGER NOT NULL, -- Positive = Inward, Negative = Outward
    balance_qty INTEGER NOT NULL,
    reference_doc_type TEXT NOT NULL, -- 'PO', 'SALES_ORDER', 'STOCK_TRANSFER', 'DAMAGE_CLAIM'
    reference_doc_id TEXT NOT NULL,
    batch_barcode TEXT,
    created_by TEXT NOT NULL DEFAULT 'SYSTEM',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sku) REFERENCES catalog_products(sku) ON DELETE RESTRICT,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(warehouse_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_stock_ledger_sku_wh ON stock_ledger(sku, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_created ON stock_ledger(created_at);

-- ------------------------------------------------------------------------------
-- 5. RELATIONAL ORDERS & LIFECYCLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders_v2 (
    order_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    doc_type TEXT NOT NULL DEFAULT 'SALES_ORDER' CHECK(doc_type IN ('QUOTATION', 'SALES_ORDER', 'DELIVERY_NOTE', 'TAX_INVOICE')),
    doc_status INTEGER NOT NULL DEFAULT 1 CHECK(doc_status IN (0, 1, 2, 3, 4)), -- 0=Draft, 1=Confirmed, 2=In Transit, 3=Delivered, 4=Cancelled
    subtotal_taxable_inr REAL NOT NULL,
    cgst_amount_inr REAL NOT NULL DEFAULT 0.0,
    sgst_amount_inr REAL NOT NULL DEFAULT 0.0,
    igst_amount_inr REAL NOT NULL DEFAULT 0.0,
    total_tax_inr REAL NOT NULL,
    gross_total_inr REAL NOT NULL,
    discount_amount_inr REAL DEFAULT 0.0,
    trade_in_buyback_inr REAL DEFAULT 0.0,
    net_payable_inr REAL NOT NULL,
    advance_paid_inr REAL DEFAULT 0.0,
    balance_due_inr REAL DEFAULT 0.0,
    assigned_driver_id TEXT,
    carpenter_id TEXT,
    e_way_bill_no TEXT,
    payment_split_settled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_v2_customer ON orders_v2(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_v2_status ON orders_v2(doc_status, doc_type);

-- ------------------------------------------------------------------------------
-- 6. ORDER LINE ITEMS (HISTORICAL INVARIANCE AUDIT SNAPSHOTS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_mrp_snapshot REAL NOT NULL,
    unit_rate_snapshot REAL NOT NULL,
    line_discount_inr REAL DEFAULT 0.0,
    taxable_value_inr REAL NOT NULL,
    gst_rate_snapshot REAL NOT NULL DEFAULT 18.0,
    cgst_snapshot REAL NOT NULL DEFAULT 0.0,
    sgst_snapshot REAL NOT NULL DEFAULT 0.0,
    igst_snapshot REAL NOT NULL DEFAULT 0.0,
    line_total_inr REAL NOT NULL,
    custom_variant_specs TEXT, -- JSON: {"wood": "CPT Teak", "polish": "Italian Gloss"}
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders_v2(order_id) ON DELETE CASCADE,
    FOREIGN KEY (sku) REFERENCES catalog_products(sku) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------------------------
-- 7. SPLIT-TENDER PAYMENT TRANSACTIONS LEDGER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_transactions (
    txn_id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    amount_inr REAL NOT NULL CHECK(amount_inr > 0),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('CASH', 'UPI_QR', 'CARD_EDC', 'BANK_NEFT', 'CUSTOMER_KHATA_CREDIT')),
    gateway_rrn_ref TEXT, -- Bank UTR / Card EDC Slip RRN
    cashier_user_id TEXT NOT NULL DEFAULT 'sunil_sales',
    is_reconciled INTEGER DEFAULT 1,
    settlement_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders_v2(order_id) ON DELETE RESTRICT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payment_transactions(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_timestamp ON payment_transactions(settlement_timestamp);

-- ------------------------------------------------------------------------------
-- 8. ZERO-DOWNTIME DUAL-WRITE BACKFILL (PHASE 3 OF EXPAND-CONTRACT)
-- ------------------------------------------------------------------------------
-- Safe idempotent backfill from legacy orders to customers
INSERT OR IGNORE INTO customers (customer_id, full_name, phone, billing_address)
SELECT 'CUST-' || customer_phone, customer_name, customer_phone, project_address
FROM orders WHERE customer_phone IS NOT NULL AND customer_phone != '';

-- Safe idempotent backfill from legacy catalog to catalog_products
INSERT OR IGNORE INTO catalog_products (sku, product_name, main_category, sub_category, mrp_inr, min_selling_price_inr, standard_price_inr, material_spec)
SELECT sku, product_name, main_category, sub_category, mrp_inr, min_selling_price_inr, selling_price_inr, material_spec
FROM catalog WHERE sku IS NOT NULL;
