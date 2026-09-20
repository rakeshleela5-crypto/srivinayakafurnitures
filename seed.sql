-- ==============================================================================
-- OmniBuild OS™ — Cloudflare D1 Initial Seed Data
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
-- ==============================================================================

-- 1. Seed Core Catalog Models
INSERT OR REPLACE INTO catalog (sku, product_name, category, mrp_inr, selling_price_inr, floor_price_inr, architect_price_inr, warehouse_qty, floor_qty, showroom_display_qty, display_floor_days, finish, dimensions, warranty_years)
VALUES 
  ('BED-MOD-001', 'Godrej Interio Kalista King Bed with Hydraulic Storage', 'Bedroom Suites', 98000, 78247, 68857, 71600, 6, 2, 1, 14, 'Imperial Teak with Champagne Gold Trim', '78 x 72 x 42 in', 10),
  ('SOF-REC-002', 'Godrej Centuro Motorized Dual-Recliner Suite', 'Living Room', 125000, 99890, 87900, 91400, 4, 1, 1, 32, 'Breathable Saddle Brown Microfiber', '84 x 38 x 40 in', 5),
  ('ALM-SLM-003', 'Godrej Slimline Tata CRCA 3-Door Steel Wardrobe with Locker', 'Steel Storage', 68000, 54400, 47870, 49800, 8, 3, 1, 19, 'Royal Burgundy & Frost White', '78 x 54 x 21 in', 10),
  ('DIN-TEK-004', 'Godrej Elegance 6-Seater Solid Teak Dining Suite', 'Dining Room', 89000, 71200, 62650, 65150, 3, 1, 1, 49, 'Natural Seasoned CP Teak with Glass Top', '66 x 38 x 30 in', 10),
  ('KIT-MOD-005', 'Godrej Interio 710 Marine Grade Modular Kitchen (Per Rft)', 'Modular Kitchen', 4500, 3600, 3168, 3300, 25, 1, 1, 8, 'BWP Marine Ply with SS 304 Blum Hardware', 'Custom Modular Layout', 15);

-- 2. Seed Active SafeLock Orders
INSERT OR REPLACE INTO orders (order_id, customer_name, customer_phone, phone, project_address, delivery_address, ordered_sku, sku, item_names, product_name, total_amount_inr, advance_paid_inr, advance_token_inr, balance_due_inr, safelock_status, status, delivery_schedule, assigned_driver, carpenter_assigned, otp_code, architect_id, architect_name)
VALUES
  ('ORD-8921', 'Dr. Subhashish Jena', '9437188990', '9437188990', 'New Colony, Near District Hospital, Rayagada', 'New Colony, Near District Hospital, Rayagada', 'BED-MOD-001', 'BED-MOD-001', 'Kalista King Bed with Hydraulic Storage', 'Kalista King Bed with Hydraulic Storage', 78247, 39123, 39123, 39124, 'SAFELOCKED (STAGED)', 'SAFELOCKED (STAGED)', 'Today, 04:30 PM', 'Tophan Gouda (Tata Ace OD-18-B-4491)', 'Narayana Mistri', '8921', 'ARC-01', 'Ar. Sunita Patnaik'),
  ('ORD-8922', 'Smt. Gayatri Devi', '9437255660', '9437255660', 'Gayatri Nagar, Main Road, JK Pur', 'Gayatri Nagar, Main Road, JK Pur', 'SOF-REC-002', 'SOF-REC-002', 'Centuro Motorized Dual-Recliner Suite', 'Centuro Motorized Dual-Recliner Suite', 99890, 49945, 49945, 49945, 'ON_ROUTE (TRANSIT)', 'ON_ROUTE (TRANSIT)', 'Today, 06:00 PM', 'Tophan Gouda (Tata Ace OD-18-B-4491)', 'Kailash Mistri', '4421', 'ARC-02', 'Er. Rajesh Mishra'),
  ('ORD-8923', 'Er. Ashish Choudhury', '9437334411', '9437334411', 'Kasturi Nagar, 2nd Lane, Rayagada', 'Kasturi Nagar, 2nd Lane, Rayagada', 'ALM-SLM-003', 'ALM-SLM-003', 'Slimline Royal Burgundy 3-Door Wardrobe', 'Slimline Royal Burgundy 3-Door Wardrobe', 54400, 54400, 54400, 0, 'COMPLETED (DELIVERED)', 'COMPLETED (DELIVERED)', 'Delivered Yesterday', 'Tophan Gouda', 'Narayana Mistri', '1122', 'ARC-01', 'Ar. Sunita Patnaik');

-- 3. Seed VIP Architects
INSERT OR REPLACE INTO architects (architect_id, name, architect_name, phone, firm_name, city, tier, commission_pct, total_referred_volume_inr, total_payout_settled_inr, balance_due_inr, upi_id, last_commission_date)
VALUES
  ('ARC-01', 'Ar. Sunita Patnaik', 'Ar. Sunita Patnaik', '9437177889', 'Studio Vastu Rayagada', 'Rayagada', 'PLATINUM_VIP', 12.0, 1850000, 185000, 37000, 'sunita.patnaik@okaxis', '15-Sep-2026'),
  ('ARC-02', 'Er. Rajesh Mishra', 'Er. Rajesh Mishra', '9437288991', 'Mishra Interior Associates', 'Jeypore', 'GOLD_TIER', 10.0, 1240000, 99200, 24800, 'rajesh.interiors@sbi', '10-Sep-2026'),
  ('ARC-03', 'Ar. Dilip Senapati', 'Ar. Dilip Senapati', '9437399002', 'Kalinga Design Studio', 'Koraput', 'GOLD_TIER', 10.0, 950000, 76000, 19000, 'dilip.senapati@ibl', '02-Sep-2026');

-- 4. Seed Inquiries & Leads
INSERT OR REPLACE INTO inquiries (inquiry_id, customer_name, customer_phone, phone, address, category_models, interested_category, budget_inr, ai_intent_score, assigned_staff, occasion, status, notes)
VALUES
  ('INQ-3041', 'Shree Rajesh Panda', '9437411223', '9437411223', 'Rayagada Town', 'Bedroom Suites + Modular Wardrobe', 'Bedroom Suites', 150000, '94% (DIRECTOR_HOT)', 'Sunil (Sales Executive)', 'WEDDING', 'NEW_HOT_LEAD', 'Interested in Kalista King Bed + Slimline Royal Burgundy for wedding next month.'),
  ('INQ-3042', 'Dr. Alok Mohapatra', '9437522334', '9437522334', 'JK Pur Colony', 'Centuro Recliners + Teak Dining', 'Living Room', 180000, '88% (HOT)', 'Sunil (Sales Executive)', 'HOME_UPGRADE', 'NEW_HOT_LEAD', 'Wants trial of motorized recliner mechanism in showroom.');

-- 5. Seed Payments
INSERT OR REPLACE INTO payments (txn_id, payment_id, order_id, customer_name, payment_type, amount_inr, payment_mode, upi_vpa, upi_transaction_ref, utr_reference, reconciliation_status, status, bank_verified_at)
VALUES
  ('TXN-901', 'TXN-901', 'ORD-8921', 'Dr. Subhashish Jena', 'ADVANCE_50', 39123, 'DYNAMIC_UPI_QR', '9390553301@ybl', 'UPI94381029481', 'UPI94381029481', 'SETTLED_VERIFIED', 'SETTLED_VERIFIED', CURRENT_TIMESTAMP),
  ('TXN-902', 'TXN-902', 'ORD-8922', 'Smt. Gayatri Devi', 'ADVANCE_50', 49945, 'DYNAMIC_UPI_QR', '9390553301@ybl', 'UPI94381029482', 'UPI94381029482', 'SETTLED_VERIFIED', 'SETTLED_VERIFIED', CURRENT_TIMESTAMP);

-- 6. Seed Daily Sales Summary
INSERT OR REPLACE INTO daily_sales_summary (summary_date, day_name, walkin_footfall, total_orders_booked, gross_sales_inr, advance_collected_inr, safelock_conversion_pct, upi_settled_inr, cash_in_safe_inr, discrepancy_inr, director_signoff)
VALUES
  ('2026-09-19', 'Saturday', 46, 9, 485000, 242500, '78%', 185000, 57500, 0, 'VERIFIED ✓');

-- 7. Seed EOD Reconciliation Log
INSERT OR REPLACE INTO eod_reconciliation_log (log_id, closing_date, opening_cash_inr, cash_collected_inr, cash_expense_inr, cash_in_safe_inr, upi_settled_inr, discrepancy_inr, audited_by)
VALUES
  ('EOD-2026-09-19', '2026-09-19', 20000, 45000, 7500, 57500, 185000, 0, 'Store Director (Verified)');

-- 8. Seed Godrej Factory Auto-POs
INSERT OR REPLACE INTO factory_purchase_orders (po_id, sku, product_name, factory_name, order_qty, estimated_cost_inr, status)
VALUES
  ('PO-KHL-101', 'BED-MOD-001', 'Kalista King Bed with Hydraulic Storage', 'Godrej Khalapur Plant', 4, 184000, 'DRAFTED_AUTO_CRON'),
  ('PO-KHL-102', 'ALM-SLM-003', 'Slimline Tata CRCA 3-Door Steel Wardrobe', 'Godrej Khalapur Plant', 6, 192000, 'DISPATCHED_EX_FACTORY');

-- 9. Seed Carpenter Installation SLAs
INSERT OR REPLACE INTO carpenter_installation_slas (sla_id, order_id, customer_name, carpenter_name, delivered_at, deadline_at, status, customer_rating)
VALUES
  ('SLA-401', 'ORD-8921', 'Dr. Subhashish Jena', 'Narayana Mistri', datetime('now', '-4 hours'), datetime('now', '+20 hours'), 'IN_PROGRESS', 5),
  ('SLA-402', 'ORD-8923', 'Er. Ashish Choudhury', 'Narayana Mistri', datetime('now', '-2 days'), datetime('now', '-1 day'), 'COMPLETED_VERIFIED', 5);

-- 10. Seed Customer Anniversaries
INSERT OR REPLACE INTO customer_anniversary_log (log_id, order_id, customer_name, customer_phone, product_name, purchased_date, nudge_type, status)
VALUES
  ('ANNIV-01', 'ORD-PREV-101', 'Prof. B. C. Panda', '9437199881', 'Godrej Kalista Hydraulic Bed', '2025-09-20', '1_YEAR_HYDRAULIC_LUBRICATION', 'MESSAGE_DISPATCHED');

-- 11. Seed Wedding Registry Leads
INSERT OR REPLACE INTO wedding_registry_leads (registry_id, customer_name, customer_phone, wedding_date, preferred_package, budget_inr, status)
VALUES
  ('WED-2026-01', 'Er. Soumya Ranjan & Smruti', '9437882211', '2026-11-28', 'Grand Royal Bridal Teak Bedroom Suite', 320000, 'BRIDAL_CATALOG_SENT');

-- 12. Seed Supplier Invoices & Cash Discounts
INSERT OR REPLACE INTO supplier_invoices_ledger (invoice_id, supplier_name, invoice_date, due_date, invoice_amount_inr, discount_eligible_inr, status)
VALUES
  ('INV-GDJ-9821', 'Godrej Interio Corporate Mumbai', '2026-09-15', '2026-09-25', 485000, 9700, 'DISCOUNT_ALERTED');

-- 13. Seed Transit LR Tracking
INSERT OR REPLACE INTO transit_lr_tracking (lr_number, transporter_name, dispatch_date, expected_delivery, days_in_transit, boxes_count, status)
VALUES
  ('LR-VRL-88219', 'VRL Logistics (Mumbai-Rayagada)', '2026-09-17', '2026-09-22', 3, 24, 'IN_TRANSIT');

