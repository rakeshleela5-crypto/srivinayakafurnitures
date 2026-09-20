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

-- 14. Seed Sovereign 20-Bot Fleet Configurations
INSERT OR REPLACE INTO bot_configurations (bot_id, bot_name, department, is_enabled, schedule_cron, scheduled_time_ist, frequency_label, threshold_value, discount_pct, recipient_phone, recipient_role, whatsapp_template)
VALUES
  ('BOT-01', '9:00 PM EOD Cash & Sales Summary Slip', 'Executive Sales', 1, '30 15 * * *', '09:00 PM', 'Daily at 9:00 PM', 0, 0, '+91 93905 53301', 'Store Director', '🔒 *GODREJ INTERIO RAYAGADA — DAILY CLOSING SLIP*\nDate: {date} | Gross Sales: ₹{gross_sales}\nUPI: ₹{upi_total} | Cash in Safe: ₹{cash_total}\nVerified ✓'),
  ('BOT-02', '10:00 AM Morning Customer Walk-In Follow-Up', 'CRM & VIP Sales', 1, '30 4 * * *', '10:00 AM', 'Daily at 10:00 AM', 48, 10, '+91 94374 11223', 'Customer Lead', 'Namaste {customer_name} ji! Thank you for visiting Godrej Interio Rayagada. Book your {product_name} today to get Complimentary Ortho Pillows!'),
  ('BOT-03', 'SafeLock 48-Hour Token Hold Recovery Guard', 'Stock Protection', 1, '0 */2 * * *', 'Every 2 Hours', 'Every 2 Hours', 48, 0, '+91 93905 53301', 'Sales Consultant', '⚠️ SafeLock Notice: Hold expired for Order #{order_id} ({customer_name}). Reserved unit returned to warehouse dock.'),
  ('BOT-04', '11:00 AM Floor Aging Display Clearance Radar', 'Merchandising', 1, '30 5 * * *', '11:00 AM', 'Daily at 11:00 AM', 45, 18, '+91 93905 53301', 'Store Director', '🏷️ Floor Aging Clearance: SKU {sku} ({product_name}) on floor for {days} days. Proposed 18% spot clearance discount.'),
  ('BOT-05', '08:30 AM Bank Statement UTR Auto-Reconciler', 'Finance & Accounts', 1, '0 3 * * *', '08:30 AM', 'Daily at 8:30 AM', 0, 0, '+91 93905 53301', 'Accountant Kishore', '🏛️ Bank Settlement Notice: UTR {utr_reference} for ₹{amount} reconciled against Order #{order_id}. Balance updated.'),
  ('BOT-06', '03:30 PM Fleet Route Manifest & Driver Dispatch', 'Logistics & Delivery', 1, '0 10 * * *', '03:30 PM', 'Daily at 3:30 PM', 0, 0, '+91 94371 00291', 'Driver Tophan Gouda', '🚚 Rayagada Fleet Manifest: {stop_count} deliveries scheduled for today. Stop 1: {first_address} (OTP: {otp_code}).'),
  ('BOT-07', 'Monday 10:00 AM Architect Commission & TDS', 'B2B Design Partners', 1, '30 4 * * 1', '10:00 AM', 'Weekly Monday', 10, 10, '+91 94375 00981', 'Architect Partner', '🏛️ Architect Partner Ledger: Weekly commission ₹{commission_amount} generated after 10% TDS deduction. Payment processed via UPI.'),
  ('BOT-08', '12:00 AM Midnight Database Maintenance & R2 Backup', 'Sovereign Cloud Ops', 1, '30 18 * * *', '12:00 AM', 'Daily Midnight', 0, 0, '+91 93905 53301', 'Store Director', '💾 Midnight R2 Cloud Backup: Database integrity verified, 17 tables archived and locked into sovereign cloud storage.'),
  ('BOT-09', 'Godrej Khalapur Factory Auto-PO Generator', 'Procurement', 1, '0 */4 * * *', 'Every 4 Hours', 'Every 4 Hours', 1, 0, '+91 93905 53301', 'Procurement Desk', '🏭 Factory Replenishment PO: Stock for {product_name} dropped to {warehouse_qty} units. Auto-PO #{po_id} drafted for Khalapur factory.'),
  ('BOT-10', '05:00 PM Carpenter Hydraulic Assembly SLA Sentinel', 'Field Service', 1, '30 11 * * *', '05:00 PM', 'Daily at 5:00 PM', 24, 0, '+91 94372 88192', 'Lead Carpenter Narayana', '🪚 Installation SLA Reminder: Order #{order_id} ({customer_name}) was delivered yesterday. Hydraulic assembly must be completed today.'),
  ('BOT-11', '12:00 PM Customer 1-Year Bed Care & Anniversary', 'Customer Retention', 1, '30 6 * * *', '12:00 PM', 'Daily at 12:00 PM', 365, 0, '+91 94371 99881', 'Customer', 'Namaste {customer_name} ji! Exactly 1 year ago, you welcomed your Godrej {product_name}. We are offering a complimentary hydraulic lubrication checkup!'),
  ('BOT-12', '1st of Month 09:00 AM GST 3B Outward Tax Summary', 'Taxation & Audit', 1, '30 3 1 * *', '09:00 AM', 'Monthly 1st at 9:00 AM', 18, 0, '+91 93905 53301', 'Chartered Accountant', '📊 Rayagada Showroom GST 3B Outward Tax Summary: Monthly Turnover ₹{turnover} | CGST ₹{cgst} | SGST ₹{sgst}. Ready for filing.'),
  ('BOT-13', '08:00 PM Staff Sales Leaderboard & Incentives', 'HR & Motivation', 1, '30 14 * * *', '08:00 PM', 'Daily at 8:00 PM', 0, 1.5, '+91 93905 53301', 'Sales Floor Group', '🏆 Today’s Sales Leaderboard: 🥇 {champion_name} booked ₹{champion_sales} ({order_count} bookings). Team gross: ₹{total_sales}!'),
  ('BOT-14', '06:00 PM Google 5-Star Review Booster', 'Brand Reputation', 1, '30 12 * * *', '06:00 PM', 'Daily at 6:00 PM', 2, 0, '+91 94371 88291', 'Delivered Customer', 'Dear {customer_name} ji, how is your new {product_name}? Share a 1-click Google review to get a ₹500 showroom voucher: {review_url}'),
  ('BOT-15', '10:00 AM Bridal & Wedding Season VIP Suite Registry', 'VIP Weddings', 1, '30 4 * * *', '10:00 AM', 'Daily at 10:00 AM', 21, 15, '+91 94378 82211', 'Wedding Lead', '💐 Congratulations {couple_name}! Planning your wedding? Explore our Grand Royal Bridal Bedroom Suites with complimentary mattress upgrade.'),
  ('BOT-16', '04:00 PM Delivered Orders Balance Due Recovery Chaser', 'Credit Control', 1, '30 10 * * *', '04:00 PM', 'Daily at 4:00 PM', 48, 0, '+91 94370 19283', 'Customer Balance Due', 'Namaste {customer_name} ji, outstanding balance of ₹{balance_due} is pending for Order #{order_id}. Pay securely via UPI: {upi_link}'),
  ('BOT-17', 'Wed 11:00 AM Godrej 2% Early Cash Discount Optimizer', 'Treasury', 1, '30 5 * * 3', '11:00 AM', 'Weekly Wednesday', 3, 2, '+91 93905 53301', 'Store Director', '🏷️ Supplier Discount Alert: Pay Godrej Invoice #{invoice_id} before {due_date} to save ₹{discount_savings} with 2% early cash settlement.'),
  ('BOT-18', '02:00 PM Factory LR Transit & Cargo Damage Radar', 'Freight', 1, '30 8 * * *', '02:00 PM', 'Daily at 2:00 PM', 5, 0, '+91 93905 53301', 'Warehouse Manager', '🚚 Freight Alert: Truck LR #{lr_number} from Khalapur plant is on day {transit_days} in transit ({box_count} cartons). Status: {status}.'),
  ('BOT-19', 'Every 30 Min SmartKit 5-Box Dock Integrity Guard', 'Quality Assurance', 1, '*/30 * * * *', 'Every 30 Mins', 'Every 30 Minutes', 5, 0, '+91 93905 53301', 'Dock Supervisor', '📦 SmartKit Dock Audit: Order #{order_id} has {scanned_boxes}/5 boxes staged. Ready for driver handover.'),
  ('BOT-20', 'Sunday 11:30 PM Zero Trust Security & Vault Digest', 'Cyber Governance', 1, '0 18 * * 0', '11:30 PM', 'Weekly Sunday', 7, 0, '+91 93905 53301', 'Store Director', '🛡️ Weekly Cyber Security Digest: Zero unauthorized Director PIN attempts. 7/7 encrypted R2 cloud snapshots verified.');


