-- ==============================================================================
-- OmniBuild OS™ — Enterprise 43-Table Master Schema & Seed for Cloudflare D1
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship Showroom)
-- Execution: npx wrangler d1 execute srivinayaka-db --file=./enterprise_43_tables.sql --remote
-- ==============================================================================

-- 1. Inventory Stock Management
CREATE TABLE IF NOT EXISTS inventory_stock (
  sku TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  showroom_display_qty INTEGER DEFAULT 1,
  warehouse_reserve_qty INTEGER DEFAULT 0,
  buffer_threshold INTEGER DEFAULT 2,
  reorder_status TEXT DEFAULT 'SUFFICIENT_STOCK',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Floor Aging Sentinel (Aging Display Detection)
CREATE TABLE IF NOT EXISTS floor_aging_sentinel (
  sku TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  showroom_age_days INTEGER DEFAULT 0,
  safe_limit_days INTEGER DEFAULT 45,
  current_mrp REAL DEFAULT 0,
  flash_sale_discount_pct INTEGER DEFAULT 15,
  action_required TEXT DEFAULT 'NORMAL_DISPLAY',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Detailed Transactions Log
CREATE TABLE IF NOT EXISTS transactions_log (
  txn_id TEXT PRIMARY KEY,
  order_id TEXT,
  customer_name TEXT NOT NULL,
  amount_inr REAL NOT NULL,
  payment_mode TEXT DEFAULT 'DYNAMIC_UPI_QR',
  cashier_name TEXT DEFAULT 'Sunil (Sales Consultant)',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bank Transactions Log (HDFC / Bank Reconciliation)
CREATE TABLE IF NOT EXISTS bank_transactions_log (
  bank_txn_id TEXT PRIMARY KEY,
  bank_name TEXT DEFAULT 'HDFC Bank Ltd, Rayagada',
  utr_no TEXT NOT NULL,
  date TEXT NOT NULL,
  amount_inr REAL NOT NULL,
  txn_type TEXT DEFAULT 'CREDIT',
  reconciliation_status TEXT DEFAULT 'RECONCILED'
);

-- 5. End of Day (EOD) Reconciliation
CREATE TABLE IF NOT EXISTS eod_reconciliation_log (
  eod_id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  total_sales_inr REAL DEFAULT 0,
  cash_in_safe_inr REAL DEFAULT 0,
  upi_settled_inr REAL DEFAULT 0,
  discrepancy_inr REAL DEFAULT 0,
  director_signoff TEXT DEFAULT 'DIRECTOR_PIN_VERIFIED ✓',
  signoff_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Spot Discounts Override Log
CREATE TABLE IF NOT EXISTS discounts_override_log (
  override_id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  order_ref TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  original_amount REAL DEFAULT 0,
  discount_amt_inr REAL DEFAULT 0,
  authorized_by TEXT DEFAULT 'Store Director (PIN 8899)',
  reason TEXT DEFAULT 'Festive Spot Negotiation'
);

-- 7. Logistics Fleet Drivers
CREATE TABLE IF NOT EXISTS fleet_drivers (
  driver_id TEXT PRIMARY KEY,
  driver_name TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'Tata Ace 1.5T Closed Container',
  active_status TEXT DEFAULT 'AVAILABLE',
  current_trip_id TEXT,
  total_trips_completed INTEGER DEFAULT 0
);

-- 8. Delivery Route Stops (Multi-Drop Logistics)
CREATE TABLE IF NOT EXISTS delivery_route_stops (
  stop_id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL,
  stop_order INTEGER DEFAULT 1,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  destination_area TEXT NOT NULL,
  distance_km REAL DEFAULT 5,
  estimated_delivery_time TEXT,
  status TEXT DEFAULT 'PENDING'
);

-- 9. Delivery Log & ePOD Signatures
CREATE TABLE IF NOT EXISTS delivery_log (
  dispatch_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  outward_time TEXT,
  epod_signature_url TEXT,
  delivery_status TEXT DEFAULT 'DELIVERED_COMPLETE'
);

-- 10. Delivery Reschedule Log
CREATE TABLE IF NOT EXISTS delivery_reschedule_log (
  reschedule_id TEXT PRIMARY KEY,
  order_ref TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  original_date TEXT NOT NULL,
  requested_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  approved_by TEXT DEFAULT 'Rakesh (Store Director)',
  status TEXT DEFAULT 'APPROVED'
);

-- 11. Security OTP Log (ePOD Verification)
CREATE TABLE IF NOT EXISTS otp_log (
  otp_id TEXT PRIMARY KEY,
  order_ref TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  generated_otp TEXT NOT NULL,
  dispatched_timestamp TEXT,
  verified_timestamp TEXT,
  verification_status TEXT DEFAULT 'VERIFIED_OK'
);

-- 12. Document Generation Log
CREATE TABLE IF NOT EXISTS document_generation_log (
  doc_id TEXT PRIMARY KEY,
  doc_type TEXT NOT NULL,
  reference_no TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  total_amount_inr REAL DEFAULT 0,
  generated_by TEXT DEFAULT 'OmniBuild Document Studio',
  file_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. Architect Commission Log & TDS Sec 194H
CREATE TABLE IF NOT EXISTS commission_log (
  payout_id TEXT PRIMARY KEY,
  date_time TEXT NOT NULL,
  architect_id TEXT NOT NULL,
  architect_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  deal_amount_inr REAL NOT NULL,
  commission_pct TEXT NOT NULL,
  payout_amount_inr REAL NOT NULL,
  tds_deducted_inr REAL DEFAULT 0,
  net_payable_inr REAL NOT NULL,
  utr_no TEXT,
  status TEXT DEFAULT 'DISBURSED_RTGS ✓'
);

-- 14. VIP Villa & Luxury Residential Projects
CREATE TABLE IF NOT EXISTS vip_villa_projects (
  project_id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  location TEXT NOT NULL,
  total_budget_inr REAL NOT NULL,
  architect_partner TEXT,
  scope_description TEXT,
  start_date TEXT,
  expected_completion TEXT,
  current_stage TEXT DEFAULT 'EXECUTION_IN_PROGRESS',
  status TEXT DEFAULT 'ACTIVE'
);

-- 15. Vendor Factory Sourcing Matrix
CREATE TABLE IF NOT EXISTS vendor_sourcing_matrix (
  vendor_id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  city TEXT NOT NULL,
  material_specialty TEXT NOT NULL,
  lead_time_days INTEGER DEFAULT 7,
  quality_rating TEXT DEFAULT '5.0 ⭐',
  payment_terms TEXT DEFAULT '30 Days Credit',
  active_status TEXT DEFAULT 'ACTIVE'
);

-- 16. Carpenter & Mistri Work Orders
CREATE TABLE IF NOT EXISTS carpenter_work_orders (
  work_order_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  mistri_name TEXT DEFAULT 'Narayana Mistri',
  customer_name TEXT NOT NULL,
  task_description TEXT NOT NULL,
  boxes_count INTEGER DEFAULT 5,
  scheduled_date TEXT,
  completion_status TEXT DEFAULT 'COMPLETED ✓'
);

-- 17. Room Fitment & Stairway Clearance QC Log
CREATE TABLE IF NOT EXISTS room_fitment_qc_log (
  qc_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  room_dimensions TEXT NOT NULL,
  fitment_status TEXT DEFAULT 'PASSED_100%',
  stairway_clearance TEXT DEFAULT 'ADEQUATE',
  inspected_by TEXT DEFAULT 'Narayana Mistri',
  inspection_date TEXT,
  remarks TEXT
);

-- 18. 10-Year Warranty Registry
CREATE TABLE IF NOT EXISTS warranty_registry (
  warranty_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  serial_no TEXT,
  warranty_years INTEGER DEFAULT 10,
  coverage_type TEXT DEFAULT '10-Year Borer & Termite Proof Teak / Anti-Rust CRCA Steel',
  activation_date TEXT,
  status TEXT DEFAULT 'ACTIVE_WARRANTY'
);

-- 19. Annual Maintenance Care (AMC) Subscriptions
CREATE TABLE IF NOT EXISTS amc_subscriptions_log (
  amc_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  plan_name TEXT DEFAULT 'Godrej Platinum Care 3-Year Polish & Hardware',
  annual_fee_inr REAL DEFAULT 4500,
  start_date TEXT,
  renewal_date TEXT,
  services_completed INTEGER DEFAULT 1,
  status TEXT DEFAULT 'ACTIVE_AMC'
);

-- 20. B2B Commercial Tenders & Institutional Projects
CREATE TABLE IF NOT EXISTS b2b_commercial_tenders_log (
  tender_id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  contact_person TEXT,
  proposal_value_inr REAL NOT NULL,
  items_count INTEGER DEFAULT 10,
  margin_tier_pct TEXT DEFAULT '34%',
  submission_date TEXT,
  current_stage TEXT DEFAULT 'STAGE_3_BOARD_APPROVAL',
  status TEXT DEFAULT 'IN_EVALUATION'
);

-- 21. Commercial Quotations Log
CREATE TABLE IF NOT EXISTS commercial_quotations_log (
  quote_id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  phone TEXT,
  quote_value_inr REAL NOT NULL,
  items_count INTEGER DEFAULT 5,
  gst_included TEXT DEFAULT 'YES (18% Split CGST 9% + SGST 9%)',
  valid_until TEXT,
  dispatched_via TEXT DEFAULT 'WHATSAPP_PDF',
  status TEXT DEFAULT 'DISPATCHED_WHATSAPP_PDF'
);

-- 22. Wedding Furniture Packages Log
CREATE TABLE IF NOT EXISTS wedding_suites_log (
  package_id TEXT PRIMARY KEY,
  couple_name TEXT NOT NULL,
  family_contact TEXT NOT NULL,
  package_name TEXT DEFAULT 'Royal Odisha Teak Heritage Suite',
  package_value_inr REAL DEFAULT 285000,
  token_paid_inr REAL DEFAULT 142500,
  muhurtam_date TEXT,
  delivery_location TEXT DEFAULT 'Rayagada',
  status TEXT DEFAULT 'RESERVED_SAFELOCK'
);

-- 23. Godrej Factory Purchase Orders Log
CREATE TABLE IF NOT EXISTS purchase_orders_log (
  po_id TEXT PRIMARY KEY,
  po_date TEXT NOT NULL,
  depot_source TEXT DEFAULT 'Godrej Interio Bhubaneswar Regional Depot',
  truck_indent_no TEXT NOT NULL,
  items_count INTEGER DEFAULT 24,
  total_value_inr REAL DEFAULT 650000,
  lr_docket_no TEXT,
  expected_delivery TEXT,
  status TEXT DEFAULT 'DISPATCHED_FROM_DEPOT'
);

-- 24. Marketing Broadcast Campaigns Log
CREATE TABLE IF NOT EXISTS marketing_campaigns_log (
  campaign_id TEXT PRIMARY KEY,
  date_time TEXT NOT NULL,
  bot_id TEXT DEFAULT 'BOT-11',
  campaign_name TEXT NOT NULL,
  audience_segment TEXT DEFAULT 'Hot Walk-In Leads [HOT_LEADS]',
  recipient_count INTEGER DEFAULT 124,
  language TEXT DEFAULT 'EN_OD',
  drip_enabled TEXT DEFAULT 'YES (3-Stage Drip)',
  status TEXT DEFAULT 'DISPATCHED_TO_META_CLOUD_API ✓'
);

-- 25. WhatsApp Message Dispatches Log
CREATE TABLE IF NOT EXISTS whatsapp_dispatches_log (
  dispatch_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  bot_id TEXT DEFAULT 'BOT-01',
  recipient_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  message_type TEXT NOT NULL,
  wa_link_generated TEXT,
  delivery_status TEXT DEFAULT 'SENT_DIRECT_LINK'
);

-- 26. CRM Lead Follow-up Queue
CREATE TABLE IF NOT EXISTS followup_queue_log (
  queue_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  interested_category TEXT NOT NULL,
  last_interaction_date TEXT,
  next_followup_date TEXT,
  assigned_agent TEXT DEFAULT 'Sunil (Sales Consultant)',
  status TEXT DEFAULT 'SCHEDULED'
);

-- 27. Bot Execution Telemetry
CREATE TABLE IF NOT EXISTS appsheet_bots_telemetry (
  telemetry_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  target_channel TEXT DEFAULT 'WhatsApp / SMS',
  latency_ms INTEGER DEFAULT 120,
  status TEXT DEFAULT 'DELIVERED ✓'
);

-- 28. 29 Bots Master Configuration Registry
CREATE TABLE IF NOT EXISTS bot_configurations_log (
  bot_id TEXT PRIMARY KEY,
  bot_name TEXT NOT NULL,
  description TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  schedule_type TEXT DEFAULT 'Instant Real-Time',
  dnd_guard_start TEXT DEFAULT '09:30 PM',
  dnd_guard_end TEXT DEFAULT '08:30 AM',
  is_enabled INTEGER DEFAULT 1
);

-- 29. Bot Test & Health Check Log
CREATE TABLE IF NOT EXISTS bot_test_log (
  test_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  bot_ref TEXT NOT NULL,
  test_recipient TEXT NOT NULL,
  test_payload TEXT,
  execution_latency_ms INTEGER DEFAULT 150,
  test_result TEXT DEFAULT 'SUCCESS_DELIVERED ✓'
);

-- 30. Custom Room Cart Proposals & Quotations
CREATE TABLE IF NOT EXISTS quote_log (
  proposal_id TEXT PRIMARY KEY,
  proposal_date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  room_type TEXT DEFAULT 'Master Bedroom Suite (16 × 14 ft)',
  items_breakdown TEXT,
  deal_amount_inr REAL NOT NULL,
  advance_token_inr REAL DEFAULT 0,
  status TEXT DEFAULT 'SAFELOCKED_CONFIRMED ✓'
);

-- 31. Daily Showroom Sales & Footfall Summary
CREATE TABLE IF NOT EXISTS daily_sales_summary (
  summary_date TEXT PRIMARY KEY,
  day_name TEXT NOT NULL,
  walkin_footfall INTEGER DEFAULT 42,
  total_orders_booked INTEGER DEFAULT 8,
  gross_sales_inr REAL DEFAULT 420000,
  advance_collected_inr REAL DEFAULT 210000,
  safelock_conversion_pct TEXT DEFAULT '75%'
);

-- 32. Showroom Critical Alerts & Sentinels
CREATE TABLE IF NOT EXISTS store_alerts_log (
  alert_id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'HIGH',
  acknowledged_by TEXT,
  status TEXT DEFAULT 'ACTIVE'
);

-- 33. Sales Consultant Targets & Incentives
CREATE TABLE IF NOT EXISTS store_sales_targets (
  target_id TEXT PRIMARY KEY,
  month_year TEXT NOT NULL,
  sales_consultant TEXT NOT NULL,
  monthly_target_inr REAL DEFAULT 1500000,
  achieved_amount_inr REAL DEFAULT 1120000,
  achievement_pct TEXT DEFAULT '74.6%',
  incentive_earned_inr REAL DEFAULT 22400
);

-- 34. Profit Radar Financial Audit
CREATE TABLE IF NOT EXISTS profit_radar_audit_log (
  audit_id TEXT PRIMARY KEY,
  audit_date TEXT NOT NULL,
  gross_revenue_inr REAL DEFAULT 169000,
  total_cogs_inr REAL DEFAULT 104780,
  net_gross_margin_inr REAL DEFAULT 64220,
  margin_pct TEXT DEFAULT '38.0%',
  health_grade TEXT DEFAULT 'PLATINUM_GRADE'
);

-- 35. Old Furniture Exchange & Buyback Evaluations
CREATE TABLE IF NOT EXISTS exchange_buyback_log (
  exchange_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  old_furniture_type TEXT NOT NULL,
  age_years INTEGER DEFAULT 5,
  evaluated_condition TEXT DEFAULT 'REUSABLE_WOOD',
  buyback_valuation_inr REAL DEFAULT 7500,
  applied_to_order_id TEXT,
  status TEXT DEFAULT 'SETTLED_IN_INVOICE'
);

-- 36. Verified Customer Reviews & Testimonials
CREATE TABLE IF NOT EXISTS customer_reviews_log (
  review_id TEXT PRIMARY KEY,
  date_time TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  purchased_sku TEXT,
  rating_stars TEXT DEFAULT '5 / 5 ⭐',
  feedback_comment TEXT NOT NULL,
  verified_purchase TEXT DEFAULT 'VERIFIED_CUSTOMER ✓'
);

-- 37. Legal Entity & Company Profile
CREATE TABLE IF NOT EXISTS company_profile (
  profile_id TEXT PRIMARY KEY,
  entity_name TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  flagship_showroom TEXT NOT NULL,
  gstin TEXT NOT NULL,
  state_code TEXT NOT NULL,
  registered_address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  director_name TEXT NOT NULL,
  upi_vpa TEXT NOT NULL,
  hdfc_account_no TEXT NOT NULL,
  ifsc_code TEXT NOT NULL
);

-- ==============================================================================
-- INITIAL SEED RECORDS FOR THE 37 NEW ENTERPRISE TABLES
-- ==============================================================================

INSERT OR REPLACE INTO fleet_drivers (driver_id, driver_name, vehicle_no, phone, vehicle_type, active_status, total_trips_completed)
VALUES ('DRV-01', 'Tophan Gouda', 'OD-18-A-1234', '+91 94371 88921', 'Tata Ace 1.5T Closed Container', 'AVAILABLE', 142);

INSERT OR REPLACE INTO company_profile (profile_id, entity_name, trade_name, flagship_showroom, gstin, state_code, registered_address, contact_phone, director_name, upi_vpa, hdfc_account_no, ifsc_code)
VALUES ('CORP-01', 'Shree Ganesh Enterprises', 'Sri Vinayaka Furnitures', 'Godrej Interio Rayagada Flagship Showroom', '21AAAAA0000A1Z5', '21 (Odisha)', 'Main Road, Near New Bus Stand, Rayagada, Odisha 765001', '+91 93905 53301', 'Leela Rakesh (Store Director)', '9390553301@ybl', '50200088991234', 'HDFC0001824');

INSERT OR REPLACE INTO carpenter_work_orders (work_order_id, order_id, mistri_name, customer_name, task_description, boxes_count, scheduled_date, completion_status)
VALUES ('WO-991', 'ORD-8921', 'Narayana Mistri', 'Dr. Subhashish Jena', '5-Box Hydraulic King Bed Assembly', 5, '03-Sep-2026', 'COMPLETED ✓');

INSERT OR REPLACE INTO daily_sales_summary (summary_date, day_name, walkin_footfall, total_orders_booked, gross_sales_inr, advance_collected_inr, safelock_conversion_pct)
VALUES ('03-Sep-2026', 'Thursday', 42, 8, 420000, 210000, '75%');

INSERT OR REPLACE INTO customer_reviews_log (review_id, date_time, customer_name, purchased_sku, rating_stars, feedback_comment, verified_purchase)
VALUES ('REV-1001', '02-Sep-2026 12:45 PM', 'Dr. Subhashish Jena', 'BED-MOD-001', '5 / 5 ⭐', 'Outstanding Teak finish and fast white-glove installation in Rayagada!', 'VERIFIED_CUSTOMER ✓');

INSERT OR REPLACE INTO wedding_suites_log (package_id, couple_name, family_contact, package_name, package_value_inr, token_paid_inr, muhurtam_date, delivery_location, status)
VALUES ('WED-2026-001', 'Pooja & Rakesh', '+91 98610 22345', 'Royal Odisha Teak Heritage Suite', 285000, 142500, '18-Nov-2026', 'Raniguda Farmhouse, Rayagada', 'RESERVED_SAFELOCK');

INSERT OR REPLACE INTO b2b_commercial_tenders_log (tender_id, institution_name, contact_person, proposal_value_inr, items_count, margin_tier_pct, submission_date, current_stage, status)
VALUES ('TND-2026-001', 'JK Paper Mills Executive Quarters', 'Er. Alok Mohanty (GM Works)', 1250000, 28, '34%', '01-Sep-2026', 'STAGE_3_BOARD_APPROVAL', 'IN_EVALUATION');

INSERT OR REPLACE INTO warranty_registry (warranty_id, order_id, customer_name, customer_phone, sku, product_name, serial_no, warranty_years, coverage_type, activation_date, status)
VALUES ('WAR-2026-101', 'ORD-8921', 'Dr. Subhashish Jena', '+91 98610 12345', 'BED-MOD-001', 'Solid King Bed (Hydraulic Storage)', 'GDJ-2026-TEAK-0891', 10, '10-Year Borer & Termite Proof Teak Wood', '03-Sep-2026', 'ACTIVE_WARRANTY');
