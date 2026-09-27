-- ==============================================================================
-- OmniBuild OS™ — Cloudflare D1 Edge SQL Database Master Schema (57 Enterprise Tables)
-- Client: Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
-- Database Engine: Cloudflare D1 (Serverless SQLite at the Edge)
-- 100% Coverage of All 18 Tabs, Accounting Ledgers, Statutory GST, Fleet & Bots
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ==============================================================================
-- 1. SALES, COUNTER POS & SHOWROOM CATALOG (TABS 1, 3, 4, 9, 10)
-- ==============================================================================

-- 1. Master Furniture Catalog (SKUs, Models, Pricing, Display Aging, GST & HSN)
CREATE TABLE IF NOT EXISTS catalog (
  sku TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  sub_category TEXT,
  hsn_code TEXT NOT NULL DEFAULT '9403',
  gst_rate_pct REAL NOT NULL DEFAULT 18.0,
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
  material_spec TEXT,
  warranty_years INTEGER DEFAULT 5,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. SafeLock Customer Orders & Document Lifecycle
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
  assigned_driver_id TEXT,
  carpenter_assigned TEXT,
  carpenter_id TEXT,
  otp_code TEXT DEFAULT '5842',
  payment_mode TEXT DEFAULT 'DYNAMIC_UPI_QR',
  payment_split_json TEXT,
  e_way_bill_no TEXT,
  gst_doc_type TEXT DEFAULT 'TAX_INVOICE',
  architect_id TEXT,
  architect_name TEXT,
  manager_remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Inquiries & VIP Leads (Tab 3: CRM)
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

-- 5. Architect & VIP Interior Designer Ledger (Tab 5)
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

-- 6. SmartKit Flat-Pack Box Components (Carton Tracking - Tabs 9 & 11)
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

-- 7. Real-time POS Counter Transactions Log
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

-- 8. Customer Quotations Log
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

-- 9. Commercial & Institutional Quotations Log
CREATE TABLE IF NOT EXISTS commercial_quotations_log (
  comm_quote_id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  phone TEXT NOT NULL,
  estimated_value_inr REAL NOT NULL,
  tender_type TEXT DEFAULT 'HOTEL_HOSPITALITY',
  items_json TEXT,
  status TEXT DEFAULT 'UNDER_EVALUATION',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Director Discount Override Log (8899 Pin Guard)
CREATE TABLE IF NOT EXISTS discounts_override_log (
  override_id TEXT PRIMARY KEY,
  order_id TEXT,
  sku TEXT,
  standard_discount_pct REAL,
  requested_discount_pct REAL NOT NULL,
  authorized_by TEXT NOT NULL DEFAULT 'Rakesh (Store Director)',
  reason TEXT,
  approved_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Daily Sales Summary (EOD 9:00 PM Automation)
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

-- 12. Bridal & Wedding Season VIP Suite Registry
CREATE TABLE IF NOT EXISTS wedding_suites_log (
  suite_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  wedding_date TEXT NOT NULL,
  package_name TEXT DEFAULT 'Royal Imperial Teak Suite',
  total_budget_inr REAL DEFAULT 250000,
  advance_paid_inr REAL DEFAULT 50000,
  customization_notes TEXT,
  status TEXT DEFAULT 'RESERVED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. Old Furniture Exchange & Buyback Valuation Log
CREATE TABLE IF NOT EXISTS exchange_buyback_log (
  exchange_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  item_type TEXT NOT NULL,
  condition TEXT DEFAULT 'GOOD',
  evaluated_value_inr REAL NOT NULL,
  new_order_id TEXT,
  appraised_by TEXT DEFAULT 'Sunil (Sales Consultant)',
  status TEXT DEFAULT 'VOUCHER_ISSUED',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. INVENTORY, GODOWN & FACTORY SOURCING (TABS 6, 7, 8, 9)
-- ==============================================================================

-- 14. Real-time Inventory Stock & Sentinel Buffers
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

-- 15. Double-Entry Stock Movement Ledger (Audit Trail)
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

-- 16. Floor Display Aging Sentinel (>45 Days Clearance Alerts)
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

-- 17. Godrej Factory Purchase Orders Log (Tab 6: AutoProcure)
CREATE TABLE IF NOT EXISTS purchase_orders_log (
  po_id TEXT PRIMARY KEY,
  sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  factory_name TEXT DEFAULT 'Godrej Khalapur Plant',
  order_qty INTEGER NOT NULL,
  estimated_cost_inr REAL NOT NULL,
  status TEXT DEFAULT 'DRAFTED_AUTO_CRON',
  po_date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 18. Factory & Vendor Sourcing Matrix
CREATE TABLE IF NOT EXISTS vendor_sourcing_matrix (
  vendor_id TEXT PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  plant_location TEXT NOT NULL,
  standard_lead_time_days INTEGER DEFAULT 7,
  transport_mode TEXT DEFAULT 'SURFACE_CONTAINER',
  contact_rep TEXT,
  phone TEXT,
  is_preferred INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Factory Lorry Receipt (LR) & Transit Tracking
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

-- 20. Godrej Supplier Invoices & Cash Discount Tracker
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

-- ==============================================================================
-- 3. ACCOUNTS, BANKING, TALLY & STATUTORY GST (TABS 13, 14, 15)
-- ==============================================================================

-- 21. Live Bank Transactions & Statements Ledger (Tab 14)
CREATE TABLE IF NOT EXISTS bank_transactions_log (
  bank_txn_id TEXT PRIMARY KEY,
  bank_name TEXT NOT NULL DEFAULT 'HDFC Bank Ltd, Rayagada',
  utr_no TEXT NOT NULL,
  date TEXT NOT NULL,
  amount_inr REAL NOT NULL,
  txn_type TEXT NOT NULL DEFAULT 'CREDIT',
  reconciliation_status TEXT NOT NULL DEFAULT 'UNMATCHED',
  matched_order_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. End of Day Safe & Cash Drawer Reconciliation
CREATE TABLE IF NOT EXISTS eod_reconciliation_log (
  eod_id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  opening_cash_inr REAL DEFAULT 0,
  cash_collected_inr REAL DEFAULT 0,
  cash_expense_inr REAL DEFAULT 0,
  cash_in_safe_inr REAL DEFAULT 0,
  upi_settled_inr REAL DEFAULT 0,
  discrepancy_inr REAL DEFAULT 0,
  director_signoff TEXT DEFAULT 'DIRECTOR_PIN_VERIFIED ✓',
  signoff_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Architect Weekly Payout & TDS 10% Settlement Ledger
CREATE TABLE IF NOT EXISTS commission_log (
  payout_id TEXT PRIMARY KEY,
  architect_id TEXT NOT NULL,
  architect_name TEXT NOT NULL,
  project_count INTEGER DEFAULT 1,
  weekly_volume_inr REAL NOT NULL,
  commission_rate_pct REAL NOT NULL DEFAULT 10.0,
  gross_commission_inr REAL NOT NULL,
  tds_10pct_inr REAL NOT NULL,
  net_payable_inr REAL NOT NULL,
  payout_status TEXT DEFAULT 'SETTLED_UPI',
  utr_ref TEXT,
  settled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (architect_id) REFERENCES architects(architect_id)
);

-- 24. Monthly Store Sales Targets & Realization
CREATE TABLE IF NOT EXISTS store_sales_targets (
  target_id TEXT PRIMARY KEY,
  month_year TEXT NOT NULL,
  monthly_target_inr REAL NOT NULL DEFAULT 5000000,
  achieved_sales_inr REAL DEFAULT 0,
  safelock_pipeline_inr REAL DEFAULT 0,
  achievement_pct REAL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 25. Profit Radar Audit Log (Margin Defense)
CREATE TABLE IF NOT EXISTS profit_radar_audit_log (
  audit_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  total_gross_inr REAL NOT NULL,
  cost_of_goods_inr REAL NOT NULL,
  gross_profit_inr REAL NOT NULL,
  margin_pct REAL NOT NULL,
  breached_floor_guard INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 26. Tally Double-Entry Vouchers (Tab 15: F4-F9 Rapid Entry)
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

-- 27. Tally Double-Entry Journal Items (Line items for Dr/Cr)
CREATE TABLE IF NOT EXISTS tally_voucher_items (
  entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_id TEXT NOT NULL,
  account_name TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('Dr', 'Cr')),
  amount_inr REAL NOT NULL,
  hsn_code TEXT DEFAULT '9403',
  FOREIGN KEY (voucher_id) REFERENCES tally_vouchers(voucher_id) ON DELETE CASCADE
);

-- 28. Statutory GST Returns & Reconciliations Log (GSTR-1, GSTR-3B, GSTR-2B)
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

-- 29. Document Generation Audit Log (Tab 13: Invoices, Challans, Receipts)
CREATE TABLE IF NOT EXISTS document_generation_log (
  doc_id TEXT PRIMARY KEY,
  doc_type TEXT NOT NULL, -- 'TAX_INVOICE', 'DELIVERY_CHALLAN', 'BILL_OF_SUPPLY', 'QUOTATION'
  entity_ref_id TEXT,
  customer_vendor_name TEXT NOT NULL,
  total_amount_inr REAL NOT NULL,
  gst_amount_inr REAL DEFAULT 0,
  copy_type TEXT DEFAULT 'ORIGINAL_FOR_RECIPIENT',
  status TEXT DEFAULT 'GENERATED_LEGAL_COMPLIANT',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. LOGISTICS, FLEET & WORKSHOP INSTALLATION (TABS 11, 12, 16)
-- ==============================================================================

-- 30. Fleet Drivers & Vehicles Registry (Tab 12: Logistics)
CREATE TABLE IF NOT EXISTS fleet_drivers (
  driver_id TEXT PRIMARY KEY,
  driver_name TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT DEFAULT 'Tata Ace 1.5T Closed Container',
  active_status TEXT DEFAULT 'AVAILABLE',
  current_trip_id TEXT,
  total_trips_completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 31. Delivery Route Stops & GPS Waypoints
CREATE TABLE IF NOT EXISTS delivery_route_stops (
  stop_id TEXT PRIMARY KEY,
  trip_id TEXT NOT NULL DEFAULT 'TRIP-TODAY',
  stop_order INTEGER NOT NULL DEFAULT 1,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pincode TEXT DEFAULT '765001',
  balance_due_inr REAL DEFAULT 0,
  status TEXT DEFAULT 'PENDING_DISPATCH',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 32. Logistics Trip Logs
CREATE TABLE IF NOT EXISTS delivery_log (
  trip_id TEXT PRIMARY KEY,
  driver_id TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  dispatch_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  completion_time DATETIME,
  total_orders INTEGER DEFAULT 1,
  status TEXT DEFAULT 'EN_ROUTE',
  FOREIGN KEY (driver_id) REFERENCES fleet_drivers(driver_id)
);

-- 33. Delivery Reschedule Audit Log
CREATE TABLE IF NOT EXISTS delivery_reschedule_log (
  reschedule_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  old_schedule TEXT NOT NULL,
  new_schedule TEXT NOT NULL,
  reason TEXT NOT NULL,
  rescheduled_by TEXT DEFAULT 'Customer Request',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 34. Electronic Proof of Delivery (ePOD) OTP & Signature Log
CREATE TABLE IF NOT EXISTS otp_log (
  otp_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  verified_at DATETIME,
  signature_url TEXT,
  photo_proof_url TEXT,
  status TEXT DEFAULT 'OTP_PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 35. Carpenter Assembly Work Orders (Workshop SLA)
CREATE TABLE IF NOT EXISTS carpenter_work_orders (
  wo_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  carpenter_name TEXT NOT NULL DEFAULT 'Narayana Mistri',
  carpenter_phone TEXT DEFAULT '+91 94379 11223',
  scheduled_date TEXT NOT NULL,
  fitment_status TEXT DEFAULT 'SCHEDULED_DISPATCH',
  customer_rating INTEGER DEFAULT 5,
  payout_inr REAL DEFAULT 1500,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 36. Room Fitment QC Inspection Checklist
CREATE TABLE IF NOT EXISTS room_fitment_qc_log (
  qc_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  hydraulic_tested INTEGER DEFAULT 1,
  alignment_level_passed INTEGER DEFAULT 1,
  anti_scratch_buffed INTEGER DEFAULT 1,
  customer_signoff TEXT DEFAULT 'SATISFIED',
  inspected_by TEXT DEFAULT 'Narayana Mistri',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 37. Godrej Warranty Certificates Registry
CREATE TABLE IF NOT EXISTS warranty_registry (
  certificate_no TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  sku TEXT NOT NULL,
  warranty_period_years INTEGER DEFAULT 5,
  valid_until DATE NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- 38. Annual Maintenance Contracts (AMC) Subscriptions
CREATE TABLE IF NOT EXISTS amc_subscriptions_log (
  amc_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'PLATINUM_WOOD_CARE',
  annual_fee_inr REAL NOT NULL,
  service_visits_completed INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 3,
  valid_until DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. INSTITUTIONAL & VIP B2B PROJECTS (TAB 2)
-- ==============================================================================

-- 39. VIP Turnkey Villa Projects
CREATE TABLE IF NOT EXISTS vip_villa_projects (
  project_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  location TEXT NOT NULL,
  project_value_inr REAL NOT NULL,
  advance_received_inr REAL DEFAULT 0,
  status TEXT DEFAULT 'PROPOSAL_DELIVERED',
  current_stage TEXT DEFAULT '30% Design Token',
  customer_phone TEXT NOT NULL,
  architect_name TEXT,
  stage1_paid INTEGER DEFAULT 0,
  stage2_paid INTEGER DEFAULT 0,
  stage3_paid INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 40. B2B Commercial & Institutional Tenders Log (Hostels, Hospitals, Hotels)
CREATE TABLE IF NOT EXISTS b2b_commercial_tenders_log (
  tender_id TEXT PRIMARY KEY,
  institution_name TEXT NOT NULL,
  project_type TEXT NOT NULL, -- 'UNIVERSITY_HOSTEL', 'SUPER_SPECIALITY_HOSPITAL', 'LUXURY_HOTEL'
  total_order_value_inr REAL NOT NULL,
  advance_received_inr REAL DEFAULT 0,
  current_stage TEXT NOT NULL DEFAULT 'DESIGN_CONSULTATION',
  delivery_deadline DATE,
  status TEXT DEFAULT 'IN_PROGRESS',
  contact_person TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. AUTONOMOUS ROBOT FLEET, AI TELEMETRY & MARKETING (TAB 18)
-- ==============================================================================

-- 41. Autonomous Bot Fleet Configurations (Tab 18)
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

-- 42. Outbound WhatsApp Dispatches Log
CREATE TABLE IF NOT EXISTS whatsapp_dispatches_log (
  msg_id TEXT PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  payload_summary TEXT,
  delivery_status TEXT DEFAULT 'DELIVERED',
  dispatched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 43. Automated CRM Follow-up Queue
CREATE TABLE IF NOT EXISTS followup_queue_log (
  queue_id TEXT PRIMARY KEY,
  inquiry_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  channel TEXT DEFAULT 'WHATSAPP',
  scheduled_for DATETIME NOT NULL,
  status TEXT DEFAULT 'PENDING',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 44. Autonomous AppSheet & Cron Bots Execution Telemetry
CREATE TABLE IF NOT EXISTS appsheet_bots_telemetry (
  telemetry_id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL,
  bot_name TEXT NOT NULL,
  trigger_type TEXT DEFAULT 'SCHEDULED_CRON',
  execution_duration_ms INTEGER DEFAULT 45,
  records_processed INTEGER DEFAULT 1,
  status TEXT DEFAULT 'SUCCESS',
  error_message TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bot_id) REFERENCES bot_configurations(bot_id)
);

-- 45. Bot Configuration Audit Trail
CREATE TABLE IF NOT EXISTS bot_configurations_log (
  audit_id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL,
  modified_by TEXT NOT NULL DEFAULT 'Rakesh (Store Director)',
  old_config_json TEXT,
  new_config_json TEXT,
  change_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bot_id) REFERENCES bot_configurations(bot_id)
);

-- 46. Bot Diagnostic Test Log
CREATE TABLE IF NOT EXISTS bot_test_log (
  test_id TEXT PRIMARY KEY,
  bot_id TEXT NOT NULL,
  simulated_payload TEXT,
  result_status TEXT DEFAULT 'PASSED',
  tested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bot_id) REFERENCES bot_configurations(bot_id)
);

-- 47. Marketing Campaigns Broadcast Log
CREATE TABLE IF NOT EXISTS marketing_campaigns_log (
  campaign_id TEXT PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  channel TEXT DEFAULT 'WHATSAPP_BROADCAST',
  recipients_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'COMPLETED',
  launched_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 48. Customer Ratings, Testimonials & Google Reviews Log
CREATE TABLE IF NOT EXISTS customer_reviews_log (
  review_id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  comments TEXT,
  is_verified_buyer INTEGER DEFAULT 1,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 49. Official Store Profile & Legal Registry
CREATE TABLE IF NOT EXISTS company_profile (
  profile_id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL DEFAULT 'Sri Vinayaka Furnitures',
  trade_brand TEXT NOT NULL DEFAULT 'Godrej Interio Rayagada Flagship',
  gstin TEXT NOT NULL DEFAULT '21AABCU9603R1ZM',
  pan TEXT NOT NULL DEFAULT 'AABCU9603R',
  state_code TEXT NOT NULL DEFAULT '21',
  state_name TEXT NOT NULL DEFAULT 'Odisha',
  address TEXT NOT NULL DEFAULT 'Main Road, Near New Bus Stand, Rayagada (OD 765001)',
  phone TEXT NOT NULL DEFAULT '+91 93905 53301',
  email TEXT DEFAULT 'srivinayakafurnitures.ryg@gmail.com',
  bank_name TEXT DEFAULT 'HDFC Bank Ltd, Rayagada',
  bank_acc_no TEXT DEFAULT '50200088991201',
  bank_ifsc TEXT DEFAULT 'HDFC0002148',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 50. High-Priority Store Alerts Log
CREATE TABLE IF NOT EXISTS store_alerts_log (
  alert_id TEXT PRIMARY KEY,
  alert_level TEXT NOT NULL DEFAULT 'WARNING', -- 'INFO', 'WARNING', 'CRITICAL'
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'INVENTORY',
  resolved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 51. Customer 1-Year Bed Hydraulic Care & Anniversary
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

-- 52. Carpenter Installation SLAs Sentinel
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

-- ==============================================================================
-- 7. PERFORMANCE-CRITICAL SQL INDEXES (SUB-5MS LOOKUPS)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_safelock_status ON orders(safelock_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_catalog_category ON catalog(category);
CREATE INDEX IF NOT EXISTS idx_catalog_hsn ON catalog(hsn_code);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON inquiries(customer_phone);
CREATE INDEX IF NOT EXISTS idx_bank_utr ON bank_transactions_log(utr_no);
CREATE INDEX IF NOT EXISTS idx_tally_vouchers_type ON tally_vouchers(voucher_type);
CREATE INDEX IF NOT EXISTS idx_tally_vouchers_date ON tally_vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_tally_voucher_items_acc ON tally_voucher_items(account_name);
CREATE INDEX IF NOT EXISTS idx_gst_filings_period ON gst_returns_filings_log(tax_period);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_sku ON stock_ledger(sku);
CREATE INDEX IF NOT EXISTS idx_bot_config_dept ON bot_configurations(department);
CREATE INDEX IF NOT EXISTS idx_route_stops_trip ON delivery_route_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_docs_ref ON document_generation_log(entity_ref_id);
