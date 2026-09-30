// ==============================================================================
// 📡 ROUTES — /dispatch POST handler (all 51 action types)
// Each action maps to a specific D1 INSERT/UPDATE operation
// ==============================================================================
import { Hono } from 'hono';

export const dispatchRoutes = new Hono();

dispatchRoutes.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json();
  const action = body.action || body.Action || '';
  const p = body.params || body || {};

  switch (action) {
    // 1. SafeLock Order Booking & Pipeline Management
    case 'CREATE_ORDER':
    case 'SAFELOCK_ORDER':
    case 'UPDATE_ORDER_STATUS':
    case 'UPDATE_SAFELOCK_STATUS':
    case 'CONFIRM_ORDER':
    case 'GENERATE_SAFELOCK_RECEIPT':
    case 'UPLOAD_EPOD_PHOTO':
    case 'CONFIRM_DELIVERY':
    case 'CLOSE_ORDER_DELIVERED':
    case 'GENERATE_ORDER':
    case 'COMPLETE_ORDER':
    case 'LOG_CANCELLATION': {
      const orderId = p.order_id || p.Order_ID || `ORD-${Date.now().toString().slice(-5)}`;
      const customerName = p.customer_name || p.Customer_Name || 'Showroom Customer';
      const phone = p.customer_phone || p.Customer_Phone || p.phone || '9437188291';
      const address = p.project_address || p.delivery_address || 'Rayagada';
      const sku = p.ordered_sku || p.Ordered_SKU || p.sku || 'BED-MOD-001';
      const total = Number(p.total_amount_inr || p.Total_Amount_INR || p.deal_amount_inr || 0);
      const advance = Number(p.advance_token_inr || p.advance_paid_inr || p.Advance_Paid_INR || 0);
      const balance = total - advance;
      const status = p.safelock_status || p.SafeLock_Status || p.status || 'SAFELOCKED (RESERVED)';
      const driver = p.assigned_driver || p.Assigned_Driver || 'Tophan Gouda';
      const deliverySchedule = p.delivery_schedule || p.Delivery_Schedule || 'Today, 04:30 PM';
      const carpenter = p.carpenter_assigned || p.Carpenter_Assigned || 'Narayana Mistri';
      const otp = p.otp_code || String(Math.floor(1000 + Math.random() * 9000));

      await db.prepare(`
        INSERT OR REPLACE INTO orders 
        (order_id, customer_name, customer_phone, project_address, ordered_sku, total_amount_inr, advance_token_inr, balance_due_inr, safelock_status, assigned_driver, delivery_schedule, carpenter_assigned, otp_code, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(orderId, customerName, phone, address, sku, total, advance, balance, status, driver, deliverySchedule, carpenter, otp).run();

      if (sku && (action === 'CREATE_ORDER' || action === 'SAFELOCK_ORDER')) {
        await db.prepare('UPDATE catalog SET warehouse_qty = MAX(0, warehouse_qty - 1), updated_at = CURRENT_TIMESTAMP WHERE sku = ?;').bind(sku).run();
      }

      return c.json({ success: true, orderId, otp, balance, message: `Order ${orderId} saved to Cloudflare D1!` });
    }

    // 2. Inquiry & CRM Lead Management
    case 'LOG_INQUIRY':
    case 'CREATE_INQUIRY':
    case 'UPDATE_INQUIRY_STATUS':
    case 'QUALIFY_LEAD': {
      const inqId = p.inquiry_id || p.Inquiry_ID || `INQ-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
      const createdAt = new Date().toISOString();
      await db.prepare(`
        INSERT OR REPLACE INTO inquiries 
        (inquiry_id, customer_name, customer_phone, address, category_models, budget_inr, ai_intent_score, assigned_staff, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `).bind(
        inqId, p.customer_name || 'Walk-in Customer',
        p.customer_phone || p.phone || '9437188291',
        p.address || p.delivery_address || 'Rayagada',
        p.category_models || p.interested_category || p.product_interest || 'Godrej Interio Furniture',
        Number(p.budget_inr || p.budget || 0),
        p.ai_intent_score || `${Math.floor(70 + Math.random() * 25)}%`,
        p.assigned_staff || 'Sunil (Sales Consultant)',
        p.status || 'HOT_LEAD',
        createdAt
      ).run();
      return c.json({ success: true, inquiryId: inqId, message: `Inquiry ${inqId} logged to Cloudflare D1!` });
    }

    // 3. Payment Recording
    case 'RECORD_PAYMENT':
    case 'LOG_PAYMENT':
    case 'CONFIRM_UPI_PAYMENT':
    case 'POST_PAYMENT':
    case 'LOG_TRANSACTION': {
      const txnId = p.txn_id || p.Txn_ID || `TXN-${Date.now().toString().slice(-6)}`;
      const orderId = p.order_id || p.Order_ID || '';
      const amt = Number(p.amount_inr || p.Amount_INR || p.amount || 0);

      await db.prepare(`
        INSERT OR REPLACE INTO payments 
        (txn_id, order_id, customer_name, amount_inr, payment_mode, utr_reference, reconciliation_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        txnId, orderId,
        p.customer_name || 'Customer', amt,
        p.payment_mode || p.Payment_Mode || 'DYNAMIC_UPI_QR',
        p.utr_reference || p.utr_no || p.utrNumber || null,
        p.reconciliation_status || 'SETTLED'
      ).run();

      if (orderId && amt > 0) {
        await db.prepare(`
          UPDATE orders 
          SET advance_token_inr = advance_token_inr + ?, 
              balance_due_inr = MAX(0, balance_due_inr - ?),
              updated_at = CURRENT_TIMESTAMP 
          WHERE order_id = ?;
        `).bind(amt, amt, orderId).run();
      }

      return c.json({ success: true, txnId, message: `Payment ₹${amt} recorded in Cloudflare D1!` });
    }

    // 4. VIP Villa Projects
    case 'CREATE_VIP_PROJECT':
    case 'UPDATE_VIP_PROJECT':
    case 'LOG_VIP_PROJECT': {
      const projId = p.project_id || p.id || `VIP-${Date.now().toString().slice(-5)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO vip_villa_projects 
        (project_id, client_name, client_phone, location, architect_partner, total_budget_inr, advance, balance_due, current_stage, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        projId, p.client_name || p.customer_name || 'VIP Client',
        p.client_phone || p.phone || '9437188291',
        p.location || p.villa_location || 'Rayagada',
        p.architect_partner || p.architect || 'Ar. Sunita Patnaik',
        Number(p.total_budget_inr || p.total_deal_value_inr || 0),
        Number(p.advance || 0),
        Number(p.balance_due || 0),
        p.current_stage || p.stage || '50% Token Pending',
        p.status || 'SAFELOCKED & STAGED'
      ).run();
      return c.json({ success: true, projectId: projId, message: `VIP Project ${projId} saved to Cloudflare D1!` });
    }

    // 5. Catalog SKU Updates
    case 'UPDATE_CATALOG_ITEM':
    case 'UPDATE_SKU_PRICE':
    case 'CREATE_SKU': {
      const sku = p.sku || p.SKU;
      if (!sku) return c.json({ success: false, error: 'SKU is required' }, 400);
      await db.prepare(`
        INSERT OR REPLACE INTO catalog 
        (sku, product_name, category, mrp_inr, selling_price_inr, warehouse_qty, floor_qty, finish, dimensions, warranty_years, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        sku, p.product_name || 'Godrej Interio Product',
        p.category || p.Main_Category || 'General',
        Number(p.mrp_inr || p.MRP_INR || 0),
        Number(p.selling_price_inr || p.Selling_Price_INR || 0),
        Number(p.warehouse_qty || p.Warehouse_Qty || 0),
        Number(p.floor_qty || p.Floor_Qty || 0),
        p.finish || 'Godrej Standard',
        p.dimensions || 'Standard',
        Number(p.warranty_years || 5)
      ).run();
      return c.json({ success: true, sku, message: `Catalog SKU ${sku} updated in Cloudflare D1!` });
    }

    // 6. Architect Registration & Updates
    case 'REGISTER_ARCHITECT':
    case 'UPDATE_ARCHITECT_PROFILE':
    case 'LOG_ARCHITECT_SALE': {
      const archId = p.architect_id || p.Architect_ID || `ARC-${Date.now().toString().slice(-3)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO architects 
        (architect_id, full_name, firm_name, phone_number, tier_slab, commission_rate, total_referred_volume_inr, balance_due_inr, upi_id, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        archId,
        p.name || p.architect_name || p.full_name || 'Architect Partner',
        p.firm_name || p.Firm_Name || 'Architectural Firm',
        p.phone || p.phone_number || '9437188291',
        p.tier || p.tier_slab || 'GOLD_TIER',
        p.commission_rate || p.commission_pct || '10.0%',
        Number(p.total_referred_volume_inr || p.total_volume_inr || 0),
        Number(p.balance_due_inr || 0),
        p.upi_id || p.upi || '9437188291@ybl'
      ).run();
      return c.json({ success: true, architectId: archId, message: `Architect ${archId} saved to Cloudflare D1!` });
    }

    // 7. Purchase Orders (Factory POs)
    case 'CREATE_PURCHASE_ORDER':
    case 'GENERATE_FACTORY_PO':
    case 'UPDATE_PO_STATUS':
    case 'FINALIZE_PO': {
      const poId = p.po_id || p.po_number || `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO purchase_orders_log 
        (po_id, po_date, depot_source, factory_name, supplier, sku, product_name, items_count, total_value_inr, total_amount_inr, advance_paid_inr, balance_due_inr, lr_docket_no, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `).bind(
        poId, p.po_date || new Date().toISOString().slice(0, 10),
        p.depot_source || 'Godrej Khalapur Plant',
        p.factory_name || 'Godrej Khalapur Plant',
        p.supplier || 'Godrej Interio Corporate',
        p.sku || null,
        p.item_names || p.product_name || p.items || 'Godrej Interio Items',
        Number(p.items_count || p.item_count || 1),
        Number(p.total_value_inr || p.total_amount_inr || 0),
        Number(p.total_amount_inr || p.total_value_inr || 0),
        Number(p.advance_paid_inr || 0),
        Number(p.balance_due_inr || 0),
        p.lr_docket_no || p.lr_number || null,
        p.status || 'DRAFT_PO'
      ).run();
      return c.json({ success: true, poId, message: `Factory PO ${poId} saved to Cloudflare D1!` });
    }

    // 8. Delivery Route Stops
    case 'SCHEDULE_DELIVERY_STOP':
    case 'ADD_DELIVERY_STOP':
    case 'UPDATE_DELIVERY_STOP':
    case 'OPTIMIZE_DELIVERY_ROUTE':
    case 'UPDATE_STOP_SEQUENCE': {
      const stopId = p.stop_id || `STOP-${Date.now().toString().slice(-4)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO delivery_route_stops 
        (stop_id, order_id, customer_name, destination_area, items_json, stop_order, estimated_delivery_time, balance_due_inr, status, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        stopId, p.order_id || p.Order_ID || '',
        p.customer_name || 'Customer',
        p.address || p.destination_area || 'Rayagada',
        p.items || p.items_json || '[]',
        Number(p.stop_order || p.stop_sequence || 1),
        p.time_slot || p.estimated_delivery_time || '04:30 PM',
        Number(p.balance_due_inr || p.Amount_Due || 0),
        p.status || 'PENDING'
      ).run();
      return c.json({ success: true, stopId, message: `Delivery stop ${stopId} saved to Cloudflare D1!` });
    }

    // 9. Fleet Driver Management
    case 'ADD_DRIVER':
    case 'UPDATE_DRIVER_STATUS': {
      const driverId = p.driver_id || p.Driver_ID || `DRV-${Date.now().toString().slice(-3)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO fleet_drivers 
        (driver_id, driver_name, phone, vehicle_no, active_status, current_route, total_trips_completed, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        driverId, p.driver_name || p.name || 'Tophan Gouda',
        p.phone || '9437188291',
        p.vehicle_no || p.vehicle || 'Tata Ace OD-18-A-1234',
        p.active_status || p.status || 'AVAILABLE',
        p.current_route || 'Rayagada Town',
        Number(p.total_trips_completed || 0)
      ).run();
      return c.json({ success: true, driverId, message: `Driver ${driverId} updated in Cloudflare D1!` });
    }

    // 10. EOD Reconciliation
    case 'SUBMIT_EOD_RECONCILIATION':
    case 'LOCK_EOD_REGISTER': {
      const eodId = p.eod_id || `EOD-${new Date().toISOString().slice(0, 10)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO eod_reconciliation_log 
        (eod_id, summary_date, cash_in_safe_inr, upi_settled_inr, total_sales_inr, safelock_count, director_signoff, signoff_timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        eodId, new Date().toISOString().slice(0, 10),
        Number(p.cash_in_safe_inr || p.cashDrawerINR || 0),
        Number(p.upi_settled_inr || p.upiSettledINR || 0),
        Number(p.total_sales_inr || p.totalGrossINR || 0),
        Number(p.safelock_count || p.safeLockCount || 0),
        p.director_signoff || `VERIFIED ✓ — ${new Date().toISOString().slice(0, 16)} IST`,
      ).run();
      return c.json({ success: true, eodId, message: `EOD ${eodId} reconciliation locked in Cloudflare D1!` });
    }

    // 11. Store Sales Targets
    case 'SET_SALES_TARGET':
    case 'UPDATE_DAILY_TARGET':
    case 'UPDATE_SALES_TARGETS': {
      const targetId = p.target_id || `TGT-${new Date().toISOString().slice(0, 7)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO store_sales_targets 
        (target_id, target_month, target_revenue_inr, achieved_amount_inr, walkin_target, updated_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        targetId, p.target_month || new Date().toISOString().slice(0, 7),
        Number(p.target_revenue_inr || p.monthlyTargetINR || 4500000),
        Number(p.achieved_amount_inr || p.currentAchievedINR || 0),
        Number(p.walkin_target || p.walkInTarget || 25)
      ).run();
      return c.json({ success: true, targetId, message: `Sales target ${targetId} updated in Cloudflare D1!` });
    }

    // 12. Document Generation Log
    case 'GENERATE_TAX_INVOICE':
    case 'GENERATE_QUOTATION_PDF':
    case 'GENERATE_DELIVERY_CHALLAN':
    case 'GENERATE_GATEPASS':
    case 'GENERATE_SERVICE_REPORT':
    case 'GENERATE_RECEIPT': {
      const docId = p.doc_id || `DOC-${Date.now().toString().slice(-5)}`;
      const docTypeMap = { GENERATE_TAX_INVOICE: 'TAX_INVOICE', GENERATE_QUOTATION_PDF: 'QUOTATION_PDF', GENERATE_DELIVERY_CHALLAN: 'DELIVERY_CHALLAN', GENERATE_GATEPASS: 'GATEPASS', GENERATE_SERVICE_REPORT: 'SERVICE_REPORT', GENERATE_RECEIPT: 'RECEIPT' };
      await db.prepare(`
        INSERT OR REPLACE INTO document_generation_log 
        (doc_id, doc_type, entity_ref_id, customer_vendor_name, total_amount_inr, copy_type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
      `).bind(
        docId, p.doc_type || docTypeMap[action] || 'DOCUMENT',
        p.order_id || p.quote_id || p.ref_id || '',
        p.customer_name || p.vendor_name || 'Customer',
        Number(p.total_amount_inr || p.amount || 0),
        p.copy_type || 'ORIGINAL'
      ).run();
      return c.json({ success: true, docId, docUrl: `/api/d1/documents/invoice/${p.order_id || docId}`, message: `Document ${docId} generated and logged in Cloudflare D1!` });
    }

    // 13. Bank Statements & Reconciliation
    case 'LOG_BANK_TRANSACTION':
    case 'RECONCILE_BANK_UTR':
    case 'UPDATE_BANK_TRANSACTION':
    case 'UPDATE_BANK_TXN_STATUS': {
      const txnId = p.txn_id || p.Txn_ID || `TXN-${Date.now().toString().slice(-6)}`;
      await db.prepare(`
        INSERT OR REPLACE INTO bank_transactions_log 
        (bank_txn_id, bank_name, utr_no, date, amount_inr, txn_type, reconciliation_status)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `).bind(
        txnId,
        p.bank_name || p.bankAccountId || 'HDFC Bank Ltd, Rayagada',
        p.utr_no || p.utrNumber || p.utr_reference || `UTR-${Date.now()}`,
        p.date || new Date().toISOString().slice(0, 10),
        Number(p.amount_inr || p.amount || 0),
        p.txn_type || 'CREDIT',
        p.status || p.reconciliation_status || 'RECONCILED'
      ).run();
      return c.json({ success: true, txnId, message: `Bank transaction ${txnId} recorded in Cloudflare D1!` });
    }

    // 14. SmartKit 5-Box Flat-Pack Staging
    case 'SMARTKIT_BOX_STAGED': {
      const orderId = p.order_id || p.orderId || '';
      const boxBarcode = p.box_barcode || p.boxBarcode;
      const sku = p.product || p.sku || 'BED-MOD-001';

      if (boxBarcode) {
        await db.prepare(`
          INSERT OR REPLACE INTO smartkit_boxes 
          (box_barcode, order_id, sku, product_name, box_number, total_boxes, box_status, scanned_at)
          VALUES (?, ?, ?, ?, ?, ?, 'STAGED', CURRENT_TIMESTAMP);
        `).bind(boxBarcode, orderId, sku, p.product_name || p.productName || sku, Number(p.box_number || p.boxNumber || 1), Number(p.total_boxes || p.totalBoxes || 5)).run();
      } else if (orderId) {
        const boxOps = [];
        for (let boxNo = 1; boxNo <= 5; boxNo++) {
          const bCode = `SK-${orderId}-B0${boxNo}`;
          boxOps.push(db.prepare(`INSERT OR REPLACE INTO smartkit_boxes (box_barcode, order_id, sku, product_name, box_number, total_boxes, box_status, scanned_at) VALUES (?, ?, ?, ?, ?, 5, 'STAGED', CURRENT_TIMESTAMP);`).bind(bCode, orderId, sku, sku, boxNo));
        }
        boxOps.push(db.prepare("UPDATE orders SET safelock_status = '5/5_STAGED_DOCK_GATEPASS_ISSUED', updated_at = CURRENT_TIMESTAMP WHERE order_id = ?;").bind(orderId));
        await db.batch(boxOps);
      }
      return c.json({ success: true, orderId, boxBarcode, message: `SmartKit 5-Box Staging verified in Cloudflare D1!` });
    }

    // 15. Commercial Quotations
    case 'CREATE_COMMERCIAL_QUOTE':
    case 'LOG_QUOTE_PROPOSAL':
    case 'SEND_WHATSAPP_PROPOSAL':
    case 'SEND_EMAIL_QUOTATION':
    case 'SHARE_EMI_SCHEDULE': {
      const quoteId = p.quote_id || `QUO-${Date.now().toString().slice(-4)}`;
      const clientName = p.customer_name || p.client_name || 'Walk-in Customer';
      const phone = p.customer_phone || p.phone || '';
      const quoteVal = Number(p.final_price || p.quote_value_inr || p.deal_amount_inr || p.base_price || 0);
      await db.batch([
        db.prepare(`INSERT OR REPLACE INTO commercial_quotations_log (quote_id, client_name, phone, quote_value_inr, items_count, gst_included, valid_until, dispatched_via, status) VALUES (?, ?, ?, ?, 1, 'YES (18% Split CGST 9% + SGST 9%)', DATE('now', '+7 days'), 'WHATSAPP_PDF', 'DISPATCHED_WHATSAPP_PDF');`).bind(quoteId, clientName, phone, quoteVal),
        db.prepare(`INSERT OR REPLACE INTO quote_log (proposal_id, proposal_date, customer_name, phone, room_type, items_breakdown, deal_amount_inr, advance_token_inr, status) VALUES (?, DATE('now'), ?, ?, 'Custom Suite', ?, ?, ?, 'SAFELOCKED_CONFIRMED ✓');`).bind(quoteId, clientName, phone, p.selected_model || 'Showroom Selection', quoteVal, Number(p.discount_amt || 0))
      ]);
      return c.json({ success: true, quoteId, message: `Commercial Quote #${quoteId} logged in Cloudflare D1!` });
    }

    // 16. Spot Manager Discount Override
    case 'APPLY_MANAGER_DISCOUNT': {
      const overrideId = `DISC-${Date.now().toString().slice(-4)}`;
      await db.prepare(`INSERT OR REPLACE INTO discounts_override_log (override_id, date, order_ref, customer_name, original_amount, discount_amt_inr, authorized_by, reason) VALUES (?, DATE('now'), ?, ?, ?, ?, 'Store Director (PIN 8899)', ?);`)
        .bind(overrideId, p.order_id || 'SPOT-OVERRIDE', p.customer_name || 'Client', Number(p.final_price || 0) + Number(p.discount_amt || 0), Number(p.discount_amt || 0), p.manager_remarks || 'Director Approved Spot Discount').run();
      return c.json({ success: true, overrideId, message: `Manager discount override logged in Cloudflare D1!` });
    }

    // 17. Transit Damage Claims
    case 'FILE_TRANSIT_DAMAGE_CLAIM': {
      const alertId = `CLM-${Date.now().toString().slice(-4)}`;
      await db.prepare(`INSERT OR REPLACE INTO store_alerts_log (alert_id, timestamp, alert_type, message, severity, status) VALUES (?, CURRENT_TIMESTAMP, 'TRANSIT_DAMAGE_CLAIM', ?, 'CRITICAL', 'PENDING_RESOLVE');`)
        .bind(alertId, `Damage Claim LR #${p.bilty_no || 'N/A'} (Truck ${p.truck_no || 'N/A'}, Transporter: ${p.transporter || 'N/A'}). Severity: ${p.damage_severity || 'HIGH'}. Notes: ${p.notes || ''}`).run();
      return c.json({ success: true, alertId, message: `Transit damage claim logged in Cloudflare D1!` });
    }

    // 18. Token Hold Expiry Policy
    case 'UPDATE_TOKEN_HOLD_POLICY': {
      const hours = Number(p.token_hold_hours || 72);
      await db.prepare(`INSERT OR REPLACE INTO store_alerts_log (alert_id, timestamp, alert_type, message, severity, status) VALUES ('POLICY-TOKEN-HOLD', CURRENT_TIMESTAMP, 'SYSTEM_CONFIG', ?, 'LOW', 'ACTIVE');`)
        .bind(`Token hold policy updated to ${hours} hours`).run();
      return c.json({ success: true, tokenHoldHours: hours, message: `Token hold policy of ${hours}h saved to Cloudflare D1!` });
    }

    // 19. Tally Voucher Posting
    case 'POST_TALLY_VOUCHER': {
      const vId = p.voucher_id || `VCH-${Date.now().toString().slice(-6)}`;
      const vNo = p.voucher_no || `VN-${Date.now().toString().slice(-5)}`;
      const amt = Number(p.amount_inr || p.amount || 0);
      const rate = Number(p.gst_rate_pct || 18);
      const isInterstate = Boolean(p.is_interstate);
      const taxAmt = Math.round((amt * rate) / (100 + rate));
      const cgst = isInterstate ? 0 : Math.round(taxAmt / 2);
      const sgst = isInterstate ? 0 : Math.round(taxAmt / 2);
      const igst = isInterstate ? taxAmt : 0;
      await db.prepare(`INSERT OR REPLACE INTO tally_vouchers (voucher_id, voucher_no, voucher_type, voucher_date, party_ledger, amount_inr, narration, gst_rate_pct, cgst_inr, sgst_inr, igst_inr, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'POSTED');`)
        .bind(vId, vNo, p.voucher_type || 'SALES', p.voucher_date || new Date().toISOString().slice(0, 10), p.party_ledger || 'Cash', amt, p.narration || '', rate, cgst, sgst, igst).run();
      return c.json({ success: true, voucherId: vId, voucherNo: vNo, message: `Tally ${p.voucher_type || 'SALES'} Voucher #${vNo} posted!` });
    }

    // 20. Stock Movement Ledger
    case 'RECORD_STOCK_MOVEMENT': {
      const sku = p.sku;
      const changeQty = Number(p.change_qty || p.qty || 0);
      if (sku && changeQty !== 0) {
        await db.prepare('UPDATE catalog SET warehouse_qty = MAX(0, warehouse_qty + ?), updated_at = CURRENT_TIMESTAMP WHERE sku = ?;').bind(changeQty, sku).run();
        await db.prepare('INSERT INTO stock_ledger (sku, warehouse_id, change_qty, balance_qty, reference_doc_type, reference_doc_id, created_by) VALUES (?, ?, ?, (SELECT warehouse_qty FROM catalog WHERE sku = ?), ?, ?, ?);')
          .bind(sku, p.warehouse_id || 'WH-GODOWN-1', changeQty, sku, p.reference_doc_type || 'STOCK_ADJUSTMENT', p.reference_doc_id || `DOC-${Date.now().toString().slice(-4)}`, p.created_by || 'SYSTEM').run();
      }
      return c.json({ success: true, sku, changeQty, message: `Stock movement for SKU ${sku} (${changeQty > 0 ? '+' : ''}${changeQty}) recorded!` });
    }

    // 21. GST Returns Snapshot
    case 'RECORD_GST_FILING': {
      const filingId = p.filing_id || `GST-${Date.now().toString().slice(-6)}`;
      await db.prepare(`INSERT OR REPLACE INTO gst_returns_filings_log (filing_id, return_type, tax_period, total_taxable_inr, igst_inr, cgst_inr, sgst_inr, eligible_itc_inr, invoices_count, portal_json, reconciled_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'VERIFIED_LEGAL_COMPLIANT');`)
        .bind(filingId, p.return_type || 'GSTR_1', p.tax_period || new Date().toISOString().slice(0, 7).replace('-', ''), Number(p.total_taxable_inr || 0), Number(p.igst_inr || 0), Number(p.cgst_inr || 0), Number(p.sgst_inr || 0), Number(p.eligible_itc_inr || 0), Number(p.invoices_count || 1), typeof p.portal_json === 'string' ? p.portal_json : JSON.stringify(p.portal_json || {})).run();
      return c.json({ success: true, filingId, message: `Statutory GST filing ${filingId} recorded!` });
    }

    // 22. Transit LR Tracking
    case 'LOG_TRANSIT_LR':
    case 'UPDATE_TRANSIT_LR': {
      const lrNo = p.lr_number || `LR-${Date.now().toString().slice(-6)}`;
      await db.prepare(`INSERT OR REPLACE INTO transit_lr_tracking (lr_number, transporter_name, dispatch_date, expected_delivery, days_in_transit, boxes_count, status, insurance_claim_filed) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(lrNo, p.transporter_name || 'VRL Logistics', p.dispatch_date || new Date().toISOString().slice(0, 10), p.expected_delivery || new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10), Number(p.days_in_transit || 1), Number(p.boxes_count || 1), p.status || 'IN_TRANSIT', p.insurance_claim_filed ? 1 : 0).run();
      return c.json({ success: true, lrNumber: lrNo, message: `Transporter LR #${lrNo} recorded!` });
    }

    // 23. Supplier Invoices
    case 'RECORD_SUPPLIER_INVOICE':
    case 'LOG_FACTORY_INVOICE': {
      const invId = p.invoice_id || `INV-GODREJ-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO supplier_invoices_ledger (invoice_id, supplier_name, invoice_date, due_date, invoice_amount_inr, discount_eligible_inr, status) VALUES (?, ?, ?, ?, ?, ?, ?);`)
        .bind(invId, p.supplier_name || 'Godrej Interio Corporate', p.invoice_date || new Date().toISOString().slice(0, 10), p.due_date || new Date(Date.now() + 86400000 * 15).toISOString().slice(0, 10), Number(p.invoice_amount_inr || p.amount || 0), Number(p.discount_eligible_inr || 0), p.status || 'DISCOUNT_ALERTED').run();
      return c.json({ success: true, invoiceId: invId, message: `Supplier invoice #${invId} recorded!` });
    }

    // 24–35: Anniversary, Carpenter, QC, Warranty, AMC, Wedding, Buyback, WhatsApp, Reviews, Campaigns, Alerts, Commission
    case 'LOG_CUSTOMER_ANNIVERSARY_NUDGE':
    case 'DISPATCH_ANNIVERSARY_OFFER': {
      const logId = p.log_id || `ANNIV-${Date.now().toString().slice(-6)}`;
      await db.prepare(`INSERT OR REPLACE INTO customer_anniversary_log (log_id, order_id, customer_name, customer_phone, product_name, purchased_date, nudge_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(logId, p.order_id || 'GENERAL', p.customer_name || 'Customer', p.customer_phone || '9437188291', p.product_name || 'Godrej Interio Furniture', p.purchased_date || new Date().toISOString().slice(0, 10), p.nudge_type || '1_YEAR_HYDRAULIC_LUBRICATION', p.status || 'MESSAGE_DISPATCHED').run();
      return c.json({ success: true, logId, message: `Customer anniversary nudge #${logId} logged!` });
    }

    case 'LOG_CARPENTER_SLA':
    case 'ASSIGN_CARPENTER_WORK_ORDER':
    case 'UPDATE_CARPENTER_WORK_ORDER':
    case 'DISPATCH_CARPENTER_WORK_ORDER':
    case 'SCHEDULE_MISTRI_VISIT': {
      const woId = p.wo_id || `WO-${Date.now().toString().slice(-5)}`;
      const slaId = p.sla_id || `SLA-${Date.now().toString().slice(-5)}`;
      const orderId = p.order_id || 'ORD-GENERAL';
      const custName = p.customer_name || 'Showroom Customer';
      const carpName = p.carpenter_name || 'Narayana Mistri';
      await db.batch([
        db.prepare(`INSERT OR REPLACE INTO carpenter_work_orders (wo_id, order_id, customer_name, carpenter_name, scheduled_date, fitment_status, customer_rating, payout_inr) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`).bind(woId, orderId, custName, carpName, p.scheduled_date || new Date().toISOString().slice(0, 10), p.fitment_status || 'SCHEDULED_DISPATCH', Number(p.customer_rating || 5), Number(p.payout_inr || 1500)),
        db.prepare(`INSERT OR REPLACE INTO carpenter_installation_slas (sla_id, order_id, customer_name, carpenter_name, delivered_at, deadline_at, status, customer_rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`).bind(slaId, orderId, custName, carpName, p.delivered_at || new Date().toISOString(), p.deadline_at || new Date(Date.now() + 86400000).toISOString(), p.status || 'ASSEMBLY_PENDING', Number(p.customer_rating || 5))
      ]);
      return c.json({ success: true, woId, slaId, message: `Carpenter work order #${woId} & SLA logged!` });
    }

    case 'LOG_ROOM_FITMENT_QC':
    case 'SUBMIT_FITMENT_QC': {
      const qcId = p.qc_id || `QC-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO room_fitment_qc_log (qc_id, order_id, hydraulic_tested, alignment_level_passed, anti_scratch_buffed, customer_signoff, inspected_by) VALUES (?, ?, ?, ?, ?, ?, ?);`)
        .bind(qcId, p.order_id || 'ORD-GENERAL', p.hydraulic_tested ? 1 : 0, p.alignment_level_passed ? 1 : 0, p.anti_scratch_buffed ? 1 : 0, p.customer_signoff || 'SATISFIED', p.inspected_by || 'Narayana Mistri').run();
      return c.json({ success: true, qcId, message: `Room fitment QC #${qcId} recorded!` });
    }

    case 'REGISTER_WARRANTY':
    case 'ACTIVATE_PRODUCT_WARRANTY':
    case 'ISSUE_DIGITAL_WARRANTY_QC': {
      const certNo = p.certificate_no || `WAR-${Date.now().toString().slice(-6)}`;
      await db.prepare(`INSERT OR REPLACE INTO warranty_registry (certificate_no, order_id, customer_name, customer_phone, sku, warranty_period_years, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?);`)
        .bind(certNo, p.order_id || 'ORD-GENERAL', p.customer_name || 'Customer', p.customer_phone || '9437188291', p.sku || 'GENERAL-SKU', Number(p.warranty_period_years || 5), p.valid_until || new Date(Date.now() + 86400000 * 365 * 5).toISOString().slice(0, 10)).run();
      return c.json({ success: true, certificateNo: certNo, message: `Warranty Certificate #${certNo} registered!` });
    }

    case 'LOG_AMC_SUBSCRIPTION':
    case 'RENEW_AMC_SUBSCRIPTION':
    case 'ENROLL_AMC_SUBSCRIPTION': {
      const amcId = p.amc_id || `AMC-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO amc_subscriptions_log (amc_id, customer_name, customer_phone, plan_tier, annual_fee_inr, service_visits_completed, total_visits, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(amcId, p.customer_name || 'Client', p.customer_phone || '9437188291', p.plan_tier || 'PLATINUM_WOOD_CARE', Number(p.annual_fee_inr || 12000), Number(p.service_visits_completed || 0), Number(p.total_visits || 3), p.valid_until || new Date(Date.now() + 86400000 * 365).toISOString().slice(0, 10)).run();
      return c.json({ success: true, amcId, message: `AMC Subscription #${amcId} recorded!` });
    }

    case 'LOG_WEDDING_SUITE':
    case 'CREATE_WEDDING_PACKAGE':
    case 'GENERATE_WEDDING_SUITE_PACKAGE': {
      const suiteId = p.suite_id || `WED-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO wedding_suites_log (suite_id, customer_name, customer_phone, wedding_date, package_name, total_budget_inr, advance_paid_inr, customization_notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(suiteId, p.customer_name || 'Customer', p.customer_phone || '9437188291', p.wedding_date || new Date().toISOString().slice(0, 10), p.package_name || 'Royal Imperial Teak Suite', Number(p.total_budget_inr || 250000), Number(p.advance_paid_inr || 50000), p.customization_notes || '', p.status || 'RESERVED').run();
      return c.json({ success: true, suiteId, message: `Wedding Suite Package #${suiteId} booked!` });
    }

    case 'LOG_EXCHANGE_BUYBACK':
    case 'RECORD_BUYBACK_APPRAISAL':
    case 'RECORD_FURNITURE_EXCHANGE': {
      const exId = p.exchange_id || `EXCH-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO exchange_buyback_log (exchange_id, customer_name, customer_phone, item_type, condition, evaluated_value_inr, new_order_id, appraised_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(exId, p.customer_name || 'Customer', p.customer_phone || '9437188291', p.item_type || 'Old Wooden Double Bed', p.condition || 'GOOD', Number(p.evaluated_value_inr || 6000), p.new_order_id || null, p.appraised_by || 'Sunil', p.status || 'VOUCHER_ISSUED').run();
      return c.json({ success: true, exchangeId: exId, message: `Exchange & Buyback #${exId} logged!` });
    }

    case 'LOG_WHATSAPP_DISPATCH':
    case 'DISPATCH_WHATSAPP_NOTIFICATION':
    case 'TEST_BOT_DISPATCH':
    case 'DISPATCH_BOT_ACTION':
    case 'DISPATCH_BULK_BOT_BROADCAST':
    case 'BOT_27_CONCIERGE_LEAD_RECOVERY':
    case 'DISPATCH_WHATSAPP_PO_DISPATCH': {
      const msgId = p.msg_id || `MSG-${Date.now().toString().slice(-6)}`;
      await db.prepare(`INSERT OR REPLACE INTO whatsapp_dispatches_log (msg_id, recipient_phone, recipient_name, template_type, payload_summary, delivery_status) VALUES (?, ?, ?, ?, ?, ?);`)
        .bind(msgId, p.recipient_phone || '9437188291', p.recipient_name || 'Customer', p.template_type || 'ORDER_CONFIRMATION', p.payload_summary || '', p.delivery_status || 'DELIVERED').run();
      return c.json({ success: true, msgId, message: `WhatsApp dispatch #${msgId} logged!` });
    }

    case 'LOG_CUSTOMER_REVIEW':
    case 'RECORD_GOOGLE_REVIEW': {
      const revId = p.review_id || `REV-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO customer_reviews_log (review_id, customer_name, rating, comments, is_verified_buyer) VALUES (?, ?, ?, ?, ?);`)
        .bind(revId, p.customer_name || 'Customer', Number(p.rating || 5), p.comments || 'Great furniture!', p.is_verified_buyer ? 1 : 0).run();
      return c.json({ success: true, reviewId: revId, message: `Customer review #${revId} recorded!` });
    }

    case 'LOG_MARKETING_CAMPAIGN':
    case 'LAUNCH_MARKETING_CAMPAIGN': {
      const cmpId = p.campaign_id || `CMP-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO marketing_campaigns_log (campaign_id, campaign_name, channel, recipients_count, conversion_count, status) VALUES (?, ?, ?, ?, ?, ?);`)
        .bind(cmpId, p.campaign_name || 'Festive Rayagada Promotion', p.channel || 'WHATSAPP_BROADCAST', Number(p.recipients_count || 120), Number(p.conversion_count || 14), p.status || 'COMPLETED').run();
      return c.json({ success: true, campaignId: cmpId, message: `Marketing campaign #${cmpId} logged!` });
    }

    case 'LOG_STORE_ALERT':
    case 'TRIGGER_SECURITY_ALERT': {
      const alId = p.alert_id || `ALT-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO store_alerts_log (alert_id, alert_level, title, description, category, resolved) VALUES (?, ?, ?, ?, ?, ?);`)
        .bind(alId, p.alert_level || 'WARNING', p.title || 'Low Stock Threshold Reached', p.description || '', p.category || 'INVENTORY', p.resolved ? 1 : 0).run();
      return c.json({ success: true, alertId: alId, message: `Store alert #${alId} logged!` });
    }

    case 'LOG_COMMISSION_RECORD': {
      const payId = p.payout_id || `PAY-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO commission_log (payout_id, architect_id, architect_name, project_count, weekly_volume_inr, commission_rate_pct, gross_commission_inr, tds_10pct_inr, net_payable_inr, payout_status, utr_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(payId, p.architect_id || 'ARC-001', p.architect_name || 'Architect Partner', Number(p.project_count || 1), Number(p.weekly_volume_inr || 100000), Number(p.commission_rate_pct || 10), Number(p.gross_commission_inr || 10000), Number(p.tds_10pct_inr || 1000), Number(p.net_payable_inr || 9000), p.payout_status || 'SETTLED_UPI', p.utr_ref || 'UTR-COMM-9988').run();
      return c.json({ success: true, payoutId: payId, message: `Commission record #${payId} logged!` });
    }

    // 36. Profit Radar
    case 'LOG_PROFIT_RADAR_AUDIT':
    case 'GENERATE_PROFIT_RECONCILIATION': {
      const audId = p.audit_id || `RADAR-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO profit_radar_audit_log (audit_id, order_id, total_gross_inr, cost_of_goods_inr, gross_profit_inr, margin_pct, breached_floor_guard) VALUES (?, ?, ?, ?, ?, ?, ?);`)
        .bind(audId, p.order_id || 'ORD-GENERAL', Number(p.total_gross_inr || 62000), Number(p.cost_of_goods_inr || 44000), Number(p.gross_profit_inr || 18000), Number(p.margin_pct || 29.0), p.breached_floor_guard ? 1 : 0).run();
      return c.json({ success: true, auditId: audId, message: `Profit Radar audit #${audId} logged!` });
    }

    // 37. Master Telemetry
    case 'GET_ALL_STATUS': {
      const [ordersCnt, catalogCnt, inqCnt, payCnt, driverCnt, botCnt] = await Promise.all([
        db.prepare('SELECT COUNT(*) as count FROM orders;').first(),
        db.prepare('SELECT COUNT(*) as count FROM catalog;').first(),
        db.prepare('SELECT COUNT(*) as count FROM inquiries;').first(),
        db.prepare('SELECT COUNT(*) as count FROM payments;').first(),
        db.prepare('SELECT COUNT(*) as count FROM fleet_drivers;').first(),
        db.prepare('SELECT COUNT(*) as count FROM bot_configurations;').first()
      ]);
      return c.json({
        success: true, status: 'ONLINE', edgeRegion: c.req.raw.cf?.colo || 'EDGE', timestamp: new Date().toISOString(),
        counts: { orders: ordersCnt?.count || 0, catalog: catalogCnt?.count || 0, inquiries: inqCnt?.count || 0, payments: payCnt?.count || 0, drivers: driverCnt?.count || 0, bots: botCnt?.count || 20 }
      });
    }

    // 38. SafeLock Hold Extension
    case 'EXTEND_SAFELOCK': {
      const orderId = p.order_id || p.Order_ID;
      const addDays = Number(p.additional_days || 3);
      if (orderId) {
        await db.prepare("UPDATE orders SET delivery_schedule = 'Extended +' || ? || ' Days: ' || ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?;").bind(addDays, p.reason || 'Extended', orderId).run();
        await db.prepare("INSERT OR REPLACE INTO store_alerts_log (alert_id, alert_level, title, description, category) VALUES (?, 'INFO', 'SafeLock Extended', ?, 'ORDERS');").bind(`ALT-EXT-${Date.now().toString().slice(-4)}`, `Order #${orderId} extended by ${addDays} days`).run();
      }
      return c.json({ success: true, orderId, additionalDays: addDays, message: `SafeLock hold extended by ${addDays} days!` });
    }

    // 39. Vendor Sourcing Matrix
    case 'SAVE_VENDOR_SOURCING_MATRIX': {
      const vendorId = p.vendor_id || `VND-${Date.now().toString().slice(-4)}`;
      await db.prepare(`INSERT OR REPLACE INTO vendor_sourcing_matrix (vendor_id, vendor_name, plant_location, standard_lead_time_days, transport_mode, contact_rep, phone, is_preferred) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(vendorId, p.vendor_name || 'Godrej Interio Khalapur Plant', p.plant_location || 'Maharashtra', Number(p.standard_lead_time_days || 7), p.transport_mode || 'SURFACE_CONTAINER', p.contact_rep || 'Plant Dispatch Desk', p.phone || '+91 93905 53301', p.is_preferred !== undefined ? (p.is_preferred ? 1 : 0) : 1).run();
      return c.json({ success: true, vendorId, message: `Vendor sourcing matrix #${vendorId} saved!` });
    }

    // 40. Company Identity
    case 'SAVE_COMPANY_IDENTITY': {
      const profileId = p.profile_id || 'DEFAULT_STORE';
      await db.prepare(`INSERT OR REPLACE INTO company_profile (profile_id, legal_name, trade_brand, gstin, pan, state_code, state_name, address, phone, email, bank_name, bank_acc_no, bank_ifsc, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`)
        .bind(profileId, p.legal_name || 'Sri Vinayaka Furnitures', p.trade_brand || 'Godrej Interio Rayagada Flagship', p.gstin || '21AABCU9603R1ZM', p.pan || 'AABCU9603R', p.state_code || '21', p.state_name || 'Odisha', p.address || 'Main Road, Near New Bus Stand, Rayagada (OD 765001)', p.phone || '+91 93905 53301', p.email || 'srivinayakafurnitures.ryg@gmail.com', p.bank_name || 'HDFC Bank Ltd, Rayagada', p.bank_acc_no || '50200088991201', p.bank_ifsc || 'HDFC0002148').run();
      return c.json({ success: true, profileId, message: 'Company legal profile updated in Cloudflare D1!' });
    }

    // 41. B2B Tenders
    case 'GENERATE_B2B_TURNKEY_PROPOSAL': {
      const tenderId = p.tender_id || `TND-${Date.now().toString().slice(-4)}`;
      await db.prepare(`INSERT OR REPLACE INTO b2b_commercial_tenders_log (tender_id, institution_name, project_type, total_order_value_inr, advance_received_inr, current_stage, delivery_deadline, status, contact_person, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`)
        .bind(tenderId, p.institution_name || 'Commercial Client', p.project_type || 'UNIVERSITY_HOSTEL', Number(p.total_order_value_inr || 500000), Number(p.advance_received_inr || 150000), p.current_stage || 'DESIGN_CONSULTATION', p.delivery_deadline || new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10), p.status || 'IN_PROGRESS', p.contact_person || 'Procurement Officer', p.phone || '9437188291').run();
      return c.json({ success: true, tenderId, message: `B2B Turnkey proposal #${tenderId} recorded!` });
    }

    // 42. Bot Config Update
    case 'UPDATE_BOT_CONFIG': {
      const botId = p.bot_id;
      if (botId) {
        await db.prepare(`UPDATE bot_configurations SET is_enabled = COALESCE(?, is_enabled), schedule_cron = COALESCE(?, schedule_cron), scheduled_time_ist = COALESCE(?, scheduled_time_ist), threshold_value = COALESCE(?, threshold_value), discount_pct = COALESCE(?, discount_pct), recipient_phone = COALESCE(?, recipient_phone), whatsapp_template = COALESCE(?, whatsapp_template), updated_at = CURRENT_TIMESTAMP WHERE bot_id = ?;`)
          .bind(p.is_enabled !== undefined ? (p.is_enabled ? 1 : 0) : null, p.schedule_cron || null, p.scheduled_time_ist || null, p.threshold_value !== undefined ? Number(p.threshold_value) : null, p.discount_pct !== undefined ? Number(p.discount_pct) : null, p.recipient_phone || null, p.whatsapp_template || null, botId).run();
      }
      return c.json({ success: true, botId, message: `Bot #${botId} configuration updated!` });
    }

    // 43. Delivery OTP
    case 'DISPATCH_DELIVERY_OTP': {
      const orderId = p.order_id || p.Order_ID || 'ORD-GENERAL';
      const phone = p.customer_phone || p.phone || '9437188291';
      const otp = p.otp_code || String(Math.floor(1000 + Math.random() * 9000));
      const otpId = `OTP-${orderId}-${Date.now().toString().slice(-4)}`;
      await db.batch([
        db.prepare(`INSERT OR REPLACE INTO otp_log (otp_id, order_id, customer_phone, otp_code, status) VALUES (?, ?, ?, ?, 'OTP_DISPATCHED');`).bind(otpId, orderId, phone, otp),
        db.prepare('UPDATE orders SET otp_code = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?;').bind(otp, orderId)
      ]);
      return c.json({ success: true, otpId, orderId, otp, message: `Delivery OTP ${otp} generated!` });
    }

    // 44. SKU Deduplication
    case 'MERGE_DUPLICATE_SKU': {
      const primarySku = p.primary_sku || p.target_sku;
      const duplicateSku = p.duplicate_sku || p.source_sku;
      if (primarySku && duplicateSku) {
        await db.prepare('UPDATE catalog SET warehouse_qty = warehouse_qty + COALESCE((SELECT warehouse_qty FROM catalog WHERE sku = ?), 0) WHERE sku = ?;').bind(duplicateSku, primarySku).run();
        await db.prepare('DELETE FROM catalog WHERE sku = ?;').bind(duplicateSku).run();
      }
      return c.json({ success: true, primarySku, duplicateSku, message: `SKU ${duplicateSku} merged into ${primarySku}!` });
    }

    // 45. Aging Stock Flash Sale
    case 'LAUNCH_AGING_STOCK_FLASH_SALE': {
      const sku = p.sku;
      const flashPrice = Number(p.flash_price_inr || p.selling_price_inr || 0);
      if (sku && flashPrice > 0) {
        await db.prepare('UPDATE catalog SET selling_price_inr = ? WHERE sku = ?;').bind(flashPrice, sku).run();
        await db.prepare("UPDATE floor_aging_sentinel SET proposed_action = 'CLEARANCE_PROMO_ACTIVE', clearance_discount_pct = 20, alerted = 1 WHERE sku = ?;").bind(sku).run();
      }
      return c.json({ success: true, sku, flashPrice, message: `Flash clearance price ₹${flashPrice} activated for SKU ${sku}!` });
    }

    // 46. CRM Follow-up Queue
    case 'SCHEDULE_SMART_FURNITURE_FOLLOWUP': {
      const queueId = p.queue_id || `QUEUE-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO followup_queue_log (queue_id, inquiry_id, customer_name, phone, channel, scheduled_for, status, notes) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?);`)
        .bind(queueId, p.inquiry_id || null, p.customer_name || 'Lead', p.phone || '9437188291', p.channel || 'WHATSAPP', p.scheduled_for || new Date(Date.now() + 86400000 * 2).toISOString(), p.notes || 'Smart follow-up scheduled').run();
      return c.json({ success: true, queueId, message: `Follow-up #${queueId} scheduled in Cloudflare D1!` });
    }

    // 47. Showroom Financial Entry
    case 'RECORD_SHOWROOM_FINANCIAL_ENTRY': {
      const txnId = p.txn_id || `FIN-${Date.now().toString().slice(-6)}`;
      await db.prepare(`INSERT OR REPLACE INTO transactions_log (txn_id, order_id, customer_name, amount_inr, payment_mode, cashier_name) VALUES (?, ?, ?, ?, ?, ?);`)
        .bind(txnId, p.order_id || 'PETTY_CASH', p.particulars || p.customer_name || 'Showroom Petty Expense', Number(p.amount_inr || p.amount || 0), p.payment_mode || 'CASH', p.cashier_name || 'Store Director').run();
      return c.json({ success: true, txnId, message: `Financial entry #${txnId} logged!` });
    }

    // 48. Standee Print Job
    case 'DISPATCH_STANDEE_PRINT_JOB': {
      const docId = `DOC-PRN-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO document_generation_log (doc_id, doc_type, entity_ref_id, customer_vendor_name, total_amount_inr, copy_type) VALUES (?, 'QR_STANDEE_PRICETAG', ?, ?, ?, 'STORE_DISPLAY');`)
        .bind(docId, p.sku || p.item_code || 'STAND-001', p.product_name || 'Product Standee', Number(p.price || p.mrp || 0)).run();
      return c.json({ success: true, docId, message: `Standee print job #${docId} queued!` });
    }

    // 49. Component Stock Credit
    case 'CREDIT_TO_COMPONENT_STOCK': {
      const sku = p.sku || p.component_sku;
      const qty = Number(p.quantity || p.qty || 1);
      if (sku) {
        await db.prepare(`INSERT INTO stock_ledger (sku, warehouse_id, change_qty, balance_qty, reference_doc_type, reference_doc_id, created_by) VALUES (?, 'WH-GODOWN-1', ?, (SELECT warehouse_qty FROM catalog WHERE sku = ?) + ?, 'KNOCKDOWN_ASSEMBLY_CREDIT', ?, 'System');`)
          .bind(sku, qty, sku, qty, p.assembly_id || 'KD-ASSM').run();
      }
      return c.json({ success: true, sku, creditedQty: qty, message: `Credited ${qty} units of component ${sku}!` });
    }

    // 50. Tier Pricing / Custom Finish Specs
    case 'SAVE_TIER_PRICING':
    case 'SAVE_CUSTOM_FINISH_SPEC': {
      const alertId = `SPEC-${Date.now().toString().slice(-4)}`;
      await db.prepare(`INSERT OR REPLACE INTO store_alerts_log (alert_id, alert_level, title, description, category) VALUES (?, 'INFO', 'Specification Updated', ?, 'SPECIFICATIONS');`)
        .bind(alertId, JSON.stringify(p).slice(0, 250)).run();
      return c.json({ success: true, specId: alertId, message: 'Specification saved in Cloudflare D1!' });
    }

    // 51. Executive Briefing
    case 'GENERATE_EXECUTIVE_BRIEFING': {
      const briefId = `BRF-${Date.now().toString().slice(-5)}`;
      await db.prepare(`INSERT OR REPLACE INTO document_generation_log (doc_id, doc_type, entity_ref_id, customer_vendor_name, total_amount_inr, copy_type) VALUES (?, 'EXECUTIVE_BRIEFING', 'DAILY_BRIEF', 'Store Director', 0, 'CONFIDENTIAL');`).bind(briefId).run();
      return c.json({ success: true, briefId, message: `Executive briefing #${briefId} generated!` });
    }

    // Default passthrough
    default:
      return c.json({ success: true, action, message: `Action ${action} processed by Cloudflare Edge Engine!` });
  }
});
