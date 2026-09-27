-- Migration 0002: Upgrade purchase_orders_log and other schema tables
ALTER TABLE purchase_orders_log ADD COLUMN factory_name TEXT;
ALTER TABLE purchase_orders_log ADD COLUMN sku TEXT;
ALTER TABLE purchase_orders_log ADD COLUMN product_name TEXT;
ALTER TABLE purchase_orders_log ADD COLUMN order_qty INTEGER DEFAULT 1;
ALTER TABLE purchase_orders_log ADD COLUMN total_amount_inr REAL DEFAULT 0;
ALTER TABLE purchase_orders_log ADD COLUMN supplier TEXT;
ALTER TABLE purchase_orders_log ADD COLUMN transporter TEXT;
ALTER TABLE purchase_orders_log ADD COLUMN advance_paid_inr REAL DEFAULT 0;
ALTER TABLE purchase_orders_log ADD COLUMN balance_due_inr REAL DEFAULT 0;
ALTER TABLE purchase_orders_log ADD COLUMN items_json TEXT;
ALTER TABLE purchase_orders_log ADD COLUMN notes TEXT;
