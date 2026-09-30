// ==============================================================================
// 🔄 DUAL-KEY NORMALIZERS (Bridging SQLite snake_case & React PascalCase)
// ==============================================================================

export function normalizeOrder(o) {
  if (!o) return o;
  const orderId = o.order_id || o.Order_ID || '';
  const customerName = o.customer_name || o.Customer_Name || '';
  const phone = o.customer_phone || o.Customer_Phone || o.phone || '';
  const address = o.project_address || o.Project_Address || o.delivery_address || '';
  const sku = o.ordered_sku || o.Ordered_SKU || o.sku || '';
  const totalAmount = Number(o.total_amount_inr ?? o.Total_Amount_INR ?? 0);
  const advance = Number(o.advance_paid_inr ?? o.advance_token_inr ?? o.Advance_Paid_INR ?? 0);
  const balance = Number(o.balance_due_inr ?? o.Balance_Due_INR ?? (totalAmount - advance));
  const safelockStatus = o.safelock_status || o.SafeLock_Status || o.status || 'SAFELOCKED (RESERVED)';
  const driver = o.assigned_driver || o.Assigned_Driver || '';
  const deliverySchedule = o.delivery_schedule || o.Delivery_Schedule || 'Today, 04:30 PM';
  const carpenter = o.carpenter_assigned || o.Carpenter_Assigned || 'Narayana Mistri';
  const otp = o.otp_code || o.OTP_Code || '5842';
  const smartkit = o.smartkit_status || o.SmartKit_Status || '5/5 Staged';
  const createdDate = o.created_at || o.Created_Date || '';

  return {
    ...o,
    order_id: orderId, Order_ID: orderId,
    customer_name: customerName, Customer_Name: customerName,
    customer_phone: phone, Customer_Phone: phone,
    project_address: address, Project_Address: address,
    ordered_sku: sku, Ordered_SKU: sku,
    total_amount_inr: totalAmount, Total_Amount_INR: totalAmount,
    advance_paid_inr: advance, Advance_Paid_INR: advance,
    balance_due_inr: balance, Balance_Due_INR: balance,
    safelock_status: safelockStatus, SafeLock_Status: safelockStatus, status: safelockStatus,
    assigned_driver: driver, Assigned_Driver: driver,
    delivery_schedule: deliverySchedule, Delivery_Schedule: deliverySchedule,
    carpenter_assigned: carpenter, Carpenter_Assigned: carpenter,
    otp_code: otp, OTP_Code: otp,
    smartkit_status: smartkit, SmartKit_Status: smartkit,
    created_at: createdDate, Created_Date: createdDate
  };
}

export function normalizeCatalog(c) {
  if (!c) return c;
  const sku = c.sku || c.SKU || '';
  const name = c.product_name || c.Product_Name || '';
  const category = c.category || c.Main_Category || 'Bedroom';
  const mrp = Number(c.mrp_inr ?? c.MRP_INR ?? 0);
  const price = Number(c.selling_price_inr ?? c.Selling_Price_INR ?? 0);
  const whQty = Number(c.warehouse_qty ?? c.Warehouse_Qty ?? 0);
  const flQty = Number(c.floor_qty ?? c.Floor_Qty ?? 0);
  const warranty = Number(c.warranty_years ?? c.Warranty_Years ?? 5);
  const dimensions = c.dimensions || c.Dimensions || '';
  return {
    ...c,
    sku, SKU: sku, product_name: name, Product_Name: name,
    category, Main_Category: category,
    mrp_inr: mrp, MRP_INR: mrp,
    selling_price_inr: price, Selling_Price_INR: price,
    warehouse_qty: whQty, Warehouse_Qty: whQty,
    floor_qty: flQty, Floor_Qty: flQty,
    warranty_years: warranty, Warranty_Years: warranty,
    dimensions, Dimensions: dimensions
  };
}

export function normalizeInquiry(i) {
  if (!i) return i;
  const inqId = i.inquiry_id || i.Inquiry_ID || '';
  const name = i.customer_name || i.Customer_Name || '';
  const phone = i.customer_phone || i.Customer_Phone || i.phone || '';
  const category = i.category_models || i.Category_Models || i.interested_category || '';
  const budget = Number(i.budget_inr ?? i.Budget_INR ?? 0);
  const intent = i.ai_intent_score || i.AI_Intent_Score || '85%';
  const status = i.status || i.Status || 'HOT_LEAD';
  return {
    ...i,
    inquiry_id: inqId, Inquiry_ID: inqId,
    customer_name: name, Customer_Name: name,
    customer_phone: phone, Customer_Phone: phone,
    category_models: category, Category_Models: category,
    budget_inr: budget, Budget_INR: budget,
    ai_intent_score: intent, AI_Intent_Score: intent,
    status, Status: status
  };
}

export function normalizeArchitect(a) {
  if (!a) return a;
  const id = a.architect_id || a.Architect_ID || '';
  const name = a.name || a.architect_name || a.Full_Name || '';
  const firm = a.firm_name || a.Firm_Name || '';
  const phone = a.phone || a.Phone_Number || '';
  const tier = a.tier || a.Tier_Slab || 'GOLD_TIER';
  const rate = a.commission_pct || a.Commission_Rate || '10.0%';
  const volume = Number(a.total_referred_volume_inr ?? a.Total_Sales_INR ?? 0);
  const balance = Number(a.balance_due_inr ?? a.Balance_Due_INR ?? 0);
  const upi = a.upi_id || a.UPI_Bank || '';
  return {
    ...a,
    architect_id: id, Architect_ID: id, name, architect_name: name, Full_Name: name,
    firm_name: firm, Firm_Name: firm, phone, Phone_Number: phone,
    tier, Tier_Slab: tier, commission_pct: rate, Commission_Rate: rate,
    total_referred_volume_inr: volume, Total_Sales_INR: volume,
    balance_due_inr: balance, Balance_Due_INR: balance,
    upi_id: upi, UPI_Bank: upi
  };
}

export function normalizePayment(p) {
  if (!p) return p;
  const txnId = p.txn_id || p.Txn_ID || '';
  const orderId = p.order_id || p.Order_ID || '';
  const name = p.customer_name || p.Customer_Name || '';
  const amt = Number(p.amount_inr ?? p.Amount_INR ?? p.amount ?? 0);
  const mode = p.payment_mode || p.Payment_Mode || 'DYNAMIC_UPI_QR';
  const status = p.reconciliation_status || p.Status || p.status || 'SETTLED';
  return {
    ...p,
    txn_id: txnId, Txn_ID: txnId,
    order_id: orderId, Order_ID: orderId,
    customer_name: name, Customer_Name: name,
    amount_inr: amt, Amount_INR: amt,
    payment_mode: mode, Payment_Mode: mode,
    reconciliation_status: status, Status: status
  };
}

export function normalizeVipProject(v) {
  if (!v) return v;
  const id = v.project_id || v.id || '';
  const name = v.client_name || v.name || '';
  const location = v.location || v.villa_location || '';
  const val = Number(v.total_budget_inr ?? v.total_deal_value_inr ?? v.value ?? 0);
  const adv = Number(v.advance ?? (val * 0.5));
  const stg = v.current_stage || v.stage || '50% Token Pending';
  const status = v.status || 'SAFELOCKED & STAGED';
  const arch = v.architect_partner || v.architect || '';
  const phone = v.client_phone || v.phone || '';
  return {
    ...v, project_id: id, id, client_name: name, name, location,
    total_budget_inr: val, value: val, advance: adv,
    current_stage: stg, stage: stg, status,
    architect_partner: arch, architect: arch,
    client_phone: phone, phone
  };
}

export function normalizeFloorAging(fa) {
  if (!fa) return fa;
  const sku = fa.sku || '';
  const name = fa.description || fa.name || '';
  const days = Number(fa.showroom_age_days ?? fa.floorDays ?? 0);
  const mrp = Number(fa.current_mrp ?? fa.mrp ?? 0);
  const disc = Number(fa.flash_sale_discount_pct ?? fa.discountPct ?? 15);
  const clearance = fa.clearancePrice ?? Math.round(mrp * (1 - disc / 100));
  return {
    ...fa, sku, description: name, name,
    showroom_age_days: days, floorDays: days,
    current_mrp: mrp, mrp,
    flash_sale_discount_pct: disc, discountPct: disc,
    clearancePrice: clearance
  };
}

export function normalizeSmartKitBox(b) {
  if (!b) return b;
  const barcode = b.box_barcode || b.Barcode || b.Box_ID || 'SK-BED-01-A';
  const name = b.product_name || b.Component_Name || `Box ${b.box_number || 1}/${b.total_boxes || 5}`;
  const status = b.box_status || b.Status || 'VERIFIED_STAGED';
  return {
    ...b,
    Box_ID: barcode, box_barcode: barcode, Barcode: barcode,
    Component_Name: name, product_name: name,
    Status: status, box_status: status,
    Weight_KG: b.Weight_KG || '25.0 kg',
    Staged_By: b.Staged_By || 'Staff Rakesh'
  };
}

export function normalizeBankTxn(t) {
  if (!t) return t;
  const id = t.bank_txn_id || t.id || `TXN-BNK-${Date.now()}`;
  const amount = Number(t.amount_inr ?? t.amount ?? 0);
  const utr = t.utr_no || t.utrNumber || '';
  const recon = t.reconciliation_status || t.reconciliationStatus || 'RECONCILED';
  const type = t.txn_type || t.flowType || (amount < 0 ? 'OUTWARD_DEBIT' : 'INWARD_CREDIT');
  return {
    ...t, id, bank_txn_id: id,
    amount: Math.abs(amount), amount_inr: amount,
    utrNumber: utr, utr_no: utr,
    reconciliationStatus: recon, reconciliation_status: recon,
    flowType: type, txn_type: type,
    bankAccountId: t.bankAccountId || 'CANARA_CURRENT',
    bankAccountName: t.bank_name || t.bankAccountName || 'Canara Bank Current A/c (***9201)',
    paymentMode: t.paymentMode || 'NEFT_RTGS_UPI',
    partyName: t.partyName || t.customer_name || 'Customer / Vendor',
    dateTime: t.date || t.dateTime || new Date().toISOString().slice(0, 10)
  };
}

export function normalizeDocLog(d) {
  if (!d) return d;
  const docId = d.doc_id || d.Doc_ID || `DOC-${Date.now()}`;
  const refId = d.reference_no || d.ref_id || d.Entity_Ref_ID || '';
  const recipient = d.recipient_name || d.Customer_Vendor_Name || 'Customer';
  const total = Number(d.total_amount_inr ?? d.amount_inr ?? d.Total_Amount_INR ?? 0);
  const type = d.doc_type || d.Doc_Type || 'INVOICE';
  const status = d.status || d.Status || 'GENERATED_LEGAL_COMPLIANT';
  return {
    ...d,
    Doc_ID: docId, doc_id: docId, Doc_Type: type, doc_type: type,
    Entity_Ref_ID: refId, ref_id: refId, reference_no: refId,
    Customer_Vendor_Name: recipient, recipient_name: recipient,
    Total_Amount_INR: total, total_amount_inr: total, amount_inr: total,
    Status: status, status,
    Generated_Date_Time: d.timestamp || d.created_at || d.Generated_Date_Time || new Date().toISOString()
  };
}

export function normalizeDriver(dr) {
  if (!dr) return dr;
  const id = dr.driver_id || dr.Driver_ID || 'DRV-01';
  const name = dr.driver_name || dr.Name || 'Tophan Gouda';
  const phone = dr.phone || dr.Phone || '9437155667';
  const vehicle = dr.vehicle_no || dr.Vehicle || 'Tata Ace (OD-18-A-1234)';
  const status = dr.active_status || dr.Status || 'AVAILABLE';
  return {
    ...dr, Driver_ID: id, driver_id: id, Name: name, driver_name: name,
    Phone: phone, phone, Vehicle: vehicle, vehicle_no: vehicle,
    Status: status, active_status: status,
    Route: dr.Route || 'Rayagada Town & Gayatri Nagar',
    Capacity_KG: dr.Capacity_KG || '1000 kg',
    CSAT: dr.CSAT || '4.9 ⭐'
  };
}

export function normalizeRouteStop(rs) {
  if (!rs) return rs;
  const stopNo = Number(rs.stop_order ?? rs.Stop_No ?? 1);
  const orderId = rs.order_id || rs.Order_ID || 'ORD-8921';
  const customerName = rs.customer_name || rs.Customer_Name || 'Customer';
  const address = rs.destination_area || rs.Address || 'Rayagada';
  const timeSlot = rs.estimated_delivery_time || rs.Time_Slot || '04:00 PM';
  const status = rs.status || rs.Status || 'PENDING';
  return {
    ...rs,
    Stop_No: stopNo, stop_order: stopNo,
    Order_ID: orderId, order_id: orderId,
    Customer_Name: customerName, customer_name: customerName,
    Address: address, destination_area: address,
    Time_Slot: timeSlot, estimated_delivery_time: timeSlot,
    Status: status, status,
    Items: rs.Items || 'Furniture Package',
    Amount_Due: Number(rs.Amount_Due ?? rs.balance_due_inr ?? 0),
    Payment_Mode: rs.Payment_Mode || 'DYNAMIC_UPI_QR'
  };
}

export function normalizeTargets(row) {
  if (!row) return null;
  const monthly = Number(row.target_revenue_inr ?? row.monthly_target_inr ?? row.monthlyTargetINR ?? 4500000);
  const achieved = Number(row.achieved_amount_inr ?? row.currentAchievedINR ?? 3845000);
  return {
    ...row,
    monthlyTargetINR: monthly, target_revenue_inr: monthly,
    currentAchievedINR: achieved, achieved_amount_inr: achieved,
    todayTargetINR: Number(row.todayTargetINR ?? 150000),
    todayAchievedINR: Number(row.todayAchievedINR ?? 169000),
    walkin_target: Number(row.walkin_target ?? row.walkInTarget ?? 25),
    walkInTarget: Number(row.walkin_target ?? row.walkInTarget ?? 25),
    activeSafeLocksCount: Number(row.activeSafeLocksCount ?? 8),
    pendingDeliveriesCount: Number(row.pendingDeliveriesCount ?? 4),
    hotInquiriesCount: Number(row.hotInquiriesCount ?? 6),
    architectPayoutDueINR: Number(row.architectPayoutDueINR ?? 37225)
  };
}

export function normalizeEod(row) {
  if (!row) return null;
  const cash = Number(row.cash_in_safe_inr ?? row.cashDrawerINR ?? 45000);
  const upi = Number(row.upi_settled_inr ?? row.upiSettledINR ?? 124000);
  const total = Number(row.total_sales_inr ?? row.totalGrossINR ?? (cash + upi));
  return {
    ...row,
    cashDrawerINR: cash, cash_in_safe_inr: cash,
    upiSettledINR: upi, upi_settled_inr: upi,
    totalGrossINR: total, total_sales_inr: total,
    safeLockCount: Number(row.safeLockCount ?? 4),
    closedBy: row.director_signoff || row.closedBy || 'Rakesh (Store Manager)',
    status: row.status || (row.director_signoff?.includes('VERIFIED') ? 'LOCKED_REGISTER_CLOSED' : 'OPEN_REGISTER')
  };
}

export function normalizeBotConfig(b) {
  if (!b) return b;
  const id = b.bot_id || b.botId || 'BOT-01';
  const isEnabled = b.is_enabled === 1 || b.is_enabled === true || b.status === 'ACTIVE';
  return {
    ...b, bot_id: id, botId: id,
    name: b.bot_name || b.name || 'Bot',
    bot_name: b.bot_name || b.name || 'Bot',
    is_enabled: isEnabled,
    status: isEnabled ? 'ACTIVE' : 'DISABLED'
  };
}

export function normalizeTallyVoucher(v) {
  if (!v) return v;
  return {
    ...v,
    voucher_id: v.voucher_id || v.Voucher_ID || '',
    voucher_no: v.voucher_no || v.Voucher_No || '',
    voucher_type: v.voucher_type || v.Voucher_Type || 'SALES',
    voucher_date: v.voucher_date || v.Voucher_Date || '',
    party_ledger: v.party_ledger || v.Party_Ledger || '',
    amount_inr: Number(v.amount_inr ?? v.Amount_INR ?? 0),
    narration: v.narration || v.Narration || '',
    status: v.status || v.Status || 'POSTED'
  };
}

export function normalizeStockLedger(s) {
  if (!s) return s;
  return {
    ...s,
    ledger_id: s.ledger_id || s.Ledger_ID,
    sku: s.sku || s.SKU || '',
    warehouse_id: s.warehouse_id || s.Warehouse_ID || 'WH-GODOWN-1',
    change_qty: Number(s.change_qty ?? s.Change_Qty ?? 0),
    balance_qty: Number(s.balance_qty ?? s.Balance_Qty ?? 0),
    reference_doc_type: s.reference_doc_type || s.Reference_Doc_Type || 'PO',
    reference_doc_id: s.reference_doc_id || s.Reference_Doc_ID || '',
    created_at: s.created_at || s.Created_At || ''
  };
}
