-- ==============================================================================
-- OmniBuild OS™ — Cloudflare D1 Initial Seed Data
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
-- ==============================================================================

-- 1. Seed Core Catalog Models
INSERT OR REPLACE INTO catalog (sku, product_name, category, mrp_inr, selling_price_inr, floor_price_inr, architect_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years)
VALUES 
  ('BED-MOD-001', 'Godrej Interio Kalista King Bed with Hydraulic Storage', 'Bedroom Suites', 98000, 78247, 68857, 71600, 6, 2, 'Imperial Teak with Champagne Gold Trim', '78 x 72 x 42 in', 10),
  ('SOF-REC-002', 'Godrej Centuro Motorized Dual-Recliner Suite', 'Living Room', 125000, 99890, 87900, 91400, 4, 1, 'Breathable Saddle Brown Microfiber', '84 x 38 x 40 in', 5),
  ('ALM-SLM-003', 'Godrej Slimline Tata CRCA 3-Door Steel Wardrobe with Locker', 'Steel Storage', 68000, 54400, 47870, 49800, 8, 3, 'Royal Burgundy & Frost White', '78 x 54 x 21 in', 10),
  ('DIN-TEK-004', 'Godrej Elegance 6-Seater Solid Teak Dining Suite', 'Dining Room', 89000, 71200, 62650, 65150, 3, 1, 'Natural Seasoned CP Teak with Glass Top', '66 x 38 x 30 in', 10),
  ('KIT-MOD-005', 'Godrej Interio 710 Marine Grade Modular Kitchen (Per Rft)', 'Modular Kitchen', 4500, 3600, 3168, 3300, 25, 1, 'BWP Marine Ply with SS 304 Blum Hardware', 'Custom Modular Layout', 15);

-- 2. Seed Active SafeLock Orders
INSERT OR REPLACE INTO orders (order_id, customer_name, customer_phone, project_address, ordered_sku, item_names, total_amount_inr, advance_paid_inr, balance_due_inr, safelock_status, delivery_schedule, assigned_driver, carpenter_assigned, otp_code)
VALUES
  ('ORD-8921', 'Dr. Subhashish Jena', '9437188990', 'New Colony, Near District Hospital, Rayagada', 'BED-MOD-001', 'Kalista King Bed with Hydraulic Storage', 78247, 39123, 39124, 'SAFELOCKED (STAGED)', 'Today, 04:30 PM', 'Tophan Gouda (Tata Ace OD-18-A-1234)', 'Narayana Mistri', '8899'),
  ('ORD-8922', 'Smt. Gayatri Devi', '9437255660', 'Gayatri Nagar, Main Road, JK Pur', 'SOF-REC-002', 'Centuro Motorized Dual-Recliner Suite', 99890, 49945, 49945, 'ON_ROUTE (TRANSIT)', 'Today, 06:00 PM', 'Tophan Gouda (Tata Ace OD-18-A-1234)', 'Kailash Mistri', '4421'),
  ('ORD-8923', 'Er. Ashish Choudhury', '9437334411', 'Kasturi Nagar, 2nd Lane, Rayagada', 'ALM-SLM-003', 'Slimline Royal Burgundy 3-Door Wardrobe', 54400, 54400, 0, 'DELIVERED_COMPLETE', 'Delivered Yesterday', 'Tophan Gouda', 'Narayana Mistri', '1122');

-- 3. Seed VIP Architects
INSERT OR REPLACE INTO architects (architect_id, name, phone, firm_name, city, tier, commission_pct, total_referred_volume_inr, total_payout_settled_inr, balance_due_inr, upi_id, last_commission_date)
VALUES
  ('ARC-01', 'Ar. Sunita Patnaik', '9437177889', 'Studio Vastu Rayagada', 'Rayagada', 'PLATINUM_VIP', 12.0, 1850000, 185000, 37000, 'sunita.patnaik@okaxis', '15-Sep-2026'),
  ('ARC-02', 'Er. Rajesh Mishra', '9437288991', 'Mishra Interior Associates', 'Jeypore', 'GOLD_TIER', 10.0, 1240000, 99200, 24800, 'rajesh.interiors@sbi', '10-Sep-2026'),
  ('ARC-03', 'Ar. Dilip Senapati', '9437399002', 'Kalinga Design Studio', 'Koraput', 'GOLD_TIER', 10.0, 950000, 76000, 19000, 'dilip.senapati@ibl', '02-Sep-2026');

-- 4. Seed Inquiries & Leads
INSERT OR REPLACE INTO inquiries (inquiry_id, customer_name, customer_phone, address, category_models, budget_inr, ai_intent_score, assigned_staff, occasion, status, notes)
VALUES
  ('INQ-3041', 'Shree Rajesh Panda', '9437411223', 'Rayagada Town', 'Bedroom Suites + Modular Wardrobe', 150000, '94% (DIRECTOR_HOT)', 'Sunil (Sales Executive)', 'WEDDING', 'MOBILE_AI_ENGAGED', 'Interested in Kalista King Bed + Slimline Royal Burgundy for wedding next month.'),
  ('INQ-3042', 'Dr. Alok Mohapatra', '9437522334', 'JK Pur Colony', 'Centuro Recliners + Teak Dining', 180000, '88% (HOT)', 'Sunil (Sales Executive)', 'HOME_UPGRADE', 'FOLLOW_UP_SCHEDULED', 'Wants trial of motorized recliner mechanism in showroom.');
