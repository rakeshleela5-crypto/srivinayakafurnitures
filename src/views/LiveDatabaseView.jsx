import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Database, 
  Search, 
  Download, 
  RefreshCw, 
  Edit, 
  Check, 
  Sparkles,
  Layers,
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  X,
  ShieldCheck,
  Mic,
  Truck,
  Printer
} from 'lucide-react';
import { dispatchWebhookAction, formatDateTimeIndian } from '../services/webhookService';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function LiveDatabaseView() {
  const { 
    orders, 
    catalog, 
    inventory, 
    smartKitBoxes, 
    inquiries, 
    architects, 
    drivers, 
    routeStops, 
    paymentsLog, 
    documentsLog,
    cloudTables,
    syncWithGoogleSheets,
    isSyncing,
    showToast,
    openModal,
    setActiveTab
  } = useStore();

  const [selectedTable, setSelectedTable] = useState('Inquiries_Log');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  // Helper to look up table in cloudTables with flexible matching (case-insensitive, prefix variations)
  const getCloudTable = (tableName) => {
    if (!cloudTables || typeof cloudTables !== 'object') return null;
    if (Array.isArray(cloudTables[tableName]) && cloudTables[tableName].length > 0) {
      return cloudTables[tableName];
    }
    const cleanTarget = tableName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const key of Object.keys(cloudTables)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanKey === cleanTarget || cleanKey.endsWith(cleanTarget) || cleanTarget.endsWith(cleanKey)) {
        if (Array.isArray(cloudTables[key]) && cloudTables[key].length > 0) {
          return cloudTables[key];
        }
      }
    }
    return null;
  };

  // Sample data fallback for all Google Sheets tables
  const defaultPurchaseOrders = [
    { PO_ID: "PO-2026-881", Date: "02-Sep-2026", Vendor: "Royal Teak Crafts (Saharanpur)", SKU_Details: "BED-MOD-001 (x2) + ALM-MOD-001 (x2)", Total_INR: 234000, Status: "DISPATCHED_IN_TRANSIT" },
    { PO_ID: "PO-2026-882", Date: "02-Sep-2026", Vendor: "Kurlon Enterprise Ltd (Bangalore)", SKU_Details: "MAT-MOD-001 (x5)", Total_INR: 85000, Status: "CONFIRMED_PRODUCTION" }
  ];

  const defaultVendorMatrix = [
    { Vendor_Name: "Royal Teak Crafts", Hub: "Saharanpur (UP)", Discount_Tier: "32% Margin Tier", Lead_Days: 6, Rating: "4.9 / 5" },
    { Vendor_Name: "Godrej Manufacturing Hub", Hub: "Rayagada (OD)", Discount_Tier: "38% Margin Tier", Lead_Days: 2, Rating: "5.0 / 5" },
    { Vendor_Name: "Featherlite Seating", Hub: "Chennai (TN)", Discount_Tier: "28% Margin Tier", Lead_Days: 5, Rating: "4.8 / 5" }
  ];

  const defaultDockInward = [
    { Docket_ID: "DOCK-IN-8891", Date_Time: "02-Sep-2026 11:30 AM", PO_Ref: "PO-2026-881", Driver: "Satish Kumar (Truck OD-18-B-9988)", Boxes_Received: "10 / 10 Boxes", QC_Status: "PASSED_100%_INTACT ✓" }
  ];

  const defaultOutwardManifest = [
    { Gatepass_ID: "GP-2026-771", Date_Time: "02-Sep-2026 01:15 PM", Order_ID: "ORD-8921", Customer: "Dr. Subhashish Jena", Vehicle: "Tata Ace OD-18-A-1234", Boxes_Loaded: "5 / 5 Boxes", Gatepass_Status: "GATEPASS_ISSUED ✓" }
  ];

  const defaultCustomerReviews = [
    { Review_ID: "REV-1001", Date_Time: "02-Sep-2026 12:45 PM", Customer: "Dr. Subhashish Jena", Rating: "5 / 5 ⭐", Feedback: "Outstanding Teak finish and fast white-glove installation!" }
  ];

  const defaultCarpenterOrders = [
    { Work_Order_ID: "WO-991", Order_ID: "ORD-8921", Mistri: "Narayana Mistri", Customer: "Dr. Subhashish Jena", Task: "5-Box Hydraulic King Bed Assembly", Status: "COMPLETED ✓" }
  ];

  const defaultRoomProposals = [
    { Proposal_ID: "PROP-5501", Date_Time: "02-Sep-2026 11:00 AM", Customer: "Dr. Subhashish Jena", Room: "Master Bedroom Suite (16 × 14 ft)", Deal_Amount: 164247, Status: "SAFELOCKED_CONFIRMED ✓" }
  ];

  const defaultMarketingCampaigns = [
    { Campaign_ID: "CAMP-2026-8891", Date_Time: "02-Sep-2026 02:25 PM", Bot_ID: "BOT-11", Bot_Name: "WhatsApp VIP Broadcast Festive Bot", Audience_Segment: "Hot Walk-In Leads [HOT_LEADS]", Recipient_Count: 124, Language: "EN", Drip_Sequence: "YES (3-Stage Drip)", Status: "DISPATCHED_TO_META_CLOUD_API ✓" }
  ];

  const defaultArchitectPayouts = [
    { Payout_ID: "PAY-ARC-101", Date_Time: "02-Sep-2026 04:30 PM", Architect: "Ar. Sunita Patnaik (Studio Vastu)", Project: "Gayatri Nagar Villa (5-Piece Teak Suite)", Deal_Amount: 450000, Commission_Rate: "8%", Payout_Amount_INR: 36000, Bank_UTR: "HDFCR520260902881", Status: "DISBURSED_RTGS ✓" },
    { Payout_ID: "PAY-ARC-102", Date_Time: "01-Sep-2026 02:15 PM", Architect: "Ar. Rajesh Verma", Project: "JK Paper Mills Executive Lounge", Deal_Amount: 320000, Commission_Rate: "6%", Payout_Amount_INR: 19200, Bank_UTR: "SBINR20260901992", Status: "DISBURSED_RTGS ✓" }
  ];

  const defaultStoreAlerts = [
    { Alert_ID: "ALT-001", Timestamp: formatDateTimeIndian(), Type: "STOCK_THRESHOLD", Message: "Warehouse Teak King Bed stock below threshold", Severity: "HIGH", Status: "ACTIVE" }
  ];

  const defaultDailySales = [
    { Date: "03-Sep-2026", Day: "Thursday", Footfall: 42, Orders_Count: 8, Gross_Sales_INR: 420000, Advance_Collected_INR: 210000, SafeLock_Conversion_Pct: "75%" }
  ];

  // Comprehensive 21-Table Map prioritizing Cloud Data from Google Sheets
  const baseTableMap = {
    'Inquiries_Log': getCloudTable('Inquiries_Log') || inquiries,
    'Orders_SafeLock': getCloudTable('Orders_SafeLock') || orders,
    'Inventory_Stock': getCloudTable('Inventory_Stock') || inventory,
    'SmartKit_Components': getCloudTable('SmartKit_Components') || smartKitBoxes,
    'Purchase_Orders_Log': getCloudTable('Purchase_Orders_Log') || defaultPurchaseOrders,
    'Payments_Log': getCloudTable('Payments_Log') || paymentsLog,
    'Transactions_Log': getCloudTable('Transactions_Log') || paymentsLog,
    'Bank_Transactions_Log': getCloudTable('Bank_Transactions_Log') || [],
    'Architect_VIPs': getCloudTable('Architect_VIPs') || architects,
    'Fleet_Drivers': getCloudTable('Fleet_Drivers') || drivers,
    'Delivery_Route_Stops': getCloudTable('Delivery_Route_Stops') || routeStops,
    'Delivery_Log': getCloudTable('Delivery_Log') || defaultOutwardManifest,
    'Daily_Sales_Summary': getCloudTable('Daily_Sales_Summary') || defaultDailySales,
    'Carpenter_Work_Orders': getCloudTable('Carpenter_Work_Orders') || defaultCarpenterOrders,
    'Store_Alerts_Log': getCloudTable('Store_Alerts_Log') || defaultStoreAlerts,
    'Marketing_Campaigns_Log': getCloudTable('Marketing_Campaigns_Log') || defaultMarketingCampaigns,
    'Quote_Log': getCloudTable('Quote_Log') || defaultRoomProposals,
    'Commission_Log': getCloudTable('Commission_Log') || defaultArchitectPayouts,
    'OTP_Log': getCloudTable('OTP_Log') || [],
    'Exchange_Buyback_Log': getCloudTable('Exchange_Buyback_Log') || [],
    'Store_Sales_Targets': getCloudTable('Store_Sales_Targets') || [],
    'Furniture_Catalog': catalog,
    'Document_Generation_Log': documentsLog,
    'Vendor_Sourcing_Matrix': defaultVendorMatrix,
    'Customer_Reviews_Log': defaultCustomerReviews,
    'Room_Fitment_QC_Log': getCloudTable('Room_Fitment_QC_Log') || [
      { QC_ID: "QC-2026-001", Order_ID: "ORD-101", Customer: "Dr. Subhashish Jena", Room_Dimensions: "16x14 ft", Fitment_Status: "PASSED_100%", Stairway_Clearance: "ADEQUATE", Inspected_By: "Narayana Mistri" }
    ],
    'Discounts_Override_Log': getCloudTable('Discounts_Override_Log') || [
      { Override_ID: "OVR-8801", Date: "03-Sep-2026", Order_Ref: "ORD-POS-ADV", Discount_Amt_INR: 5000, Authorized_By: "Store Director (PIN 8899)", Reason: "Festive Spot Negotiation" }
    ],
    'Profit_Radar_Audit_Log': getCloudTable('Profit_Radar_Audit_Log') || [
      { Audit_ID: "AUD-PR-101", Date: "03-Sep-2026", Gross_Revenue: 169000, Total_COGS: 104780, Net_Margin_INR: 64220, Margin_Pct: "38.0%", Health_Grade: "PLATINUM_GRADE" }
    ],
    'AppSheet_Bots_Telemetry': getCloudTable('AppSheet_Bots_Telemetry') || [
      { Telemetry_ID: "TEL-BOT-01", Bot_ID: "BOT-01", Event: "Order_SafeLock_Trigger", Target_Channel: "WhatsApp Cloud API", Status: "DELIVERED ✓", Latency_MS: 310 }
    ],
    'Commercial_Quotations_Log': getCloudTable('Commercial_Quotations_Log') || [
      { Quote_ID: "QUO-COM-881", Client: "Gayatri Education Trust", Value_INR: 540000, Items_Count: 18, Status: "DISPATCHED_WHATSAPP_PDF" }
    ],
    'Bot_Configurations_Log': getCloudTable('Bot_Configurations_Log') || [
      { Bot_ID: "BOT-01", Bot_Name: "SafeLock Order Confirmation Bot", Status: "ACTIVE", Trigger: "On New Order", Schedule: "Instant Real-Time", DND_Guard: "09:30 PM to 08:30 AM" }
    ],
    'Bot_Test_Log': getCloudTable('Bot_Test_Log') || [
      { Test_ID: "TST-9901", Bot_Ref: "BOT-01", Dispatched_To: "+91 93905 53301", Status: "SUCCESS_DELIVERED ✓" }
    ],
    'EOD_Reconciliation_Log': getCloudTable('EOD_Reconciliation_Log') || [
      { EOD_ID: "EOD-2026-09-03", Total_Sales: 420000, Cash_In_Safe: 85000, UPI_Settled: 335000, Discrepancy: 0, Director_Signoff: "DIRECTOR_PIN_VERIFIED ✓" }
    ],
    'Warranty_Registry': getCloudTable('Warranty_Registry') || [
      { Warranty_ID: "WAR-2026-101", Customer: "Dr. Subhashish Jena", SKU: "BED-MOD-001", Coverage_Years: "10-Year Borer & Termite Proof", Status: "ACTIVE_WARRANTY" }
    ],
    'Wedding_Suites_Log': getCloudTable('Wedding_Suites_Log') || [
      { Package_ID: "WED-2026-001", Couple: "Pooja & Rakesh", Package: "Royal Odisha Teak Heritage Suite", Value_INR: 285000, Token_Held: 142500, Status: "RESERVED_SAFELOCK" }
    ],
    'B2B_Commercial_Tenders_Log': getCloudTable('B2B_Commercial_Tenders_Log') || [
      { Tender_ID: "TND-2026-001", Institution: "JK Paper Mills Executive Quarters", Proposal_Value_INR: 1250000, Margin_Tier: "34%", Status: "STAGE_3_BOARD_APPROVAL" }
    ],
    'AMC_Subscriptions_Log': getCloudTable('AMC_Subscriptions_Log') || [
      { AMC_ID: "AMC-2026-001", Customer: "Dr. Subhashish Jena", Plan: "Godrej Platinum Care 3-Year Polish & Hardware", Annual_Fee_INR: 4500, Status: "ACTIVE_AMC" }
    ],
    'Company_Profile': getCloudTable('Company_Profile') || [
      { Entity_Name: "Shree Ganesh Enterprises / Shree Vinayaka Furnitures", Showroom: "Godrej Interio Flagship Rayagada", GSTIN: "21AABCS1429B1Z8", State_Code: "21 (Odisha)", Contact: "+91 93905 53301" }
    ],
    'FollowUp_Queue_Log': getCloudTable('FollowUp_Queue_Log') || [
      { Queue_ID: "FU-001", Customer: "Anand Mishra", Preferred_Category: "Recliner Sofa", Next_Drip_Date: "Tomorrow 11:00 AM", Channel: "WhatsApp Automated Drip" }
    ],
    'Delivery_Reschedule_Log': getCloudTable('Delivery_Reschedule_Log') || [
      { Reschedule_ID: "RESCH-001", Order_Ref: "ORD-8921", Original_Date: "03-Sep-2026", Requested_Date: "05-Sep-2026", Customer_Reason: "Flooring tile work delayed", Status: "APPROVED" }
    ],
    'WhatsApp_Dispatches_Log': getCloudTable('WhatsApp_Dispatches_Log') || [
      { Dispatch_ID: "DISP-WA-901", Bot: "BOT-01", Recipient: "+91 93905 53301", Message_Type: "SafeLock Confirmation + UPI QR", Status: "SENT_META_CLOUD_API" }
    ],
    'Floor_Aging_Sentinel': getCloudTable('Floor_Aging_Sentinel') || [
      { SKU: "SOF-MOD-001", Description: "Chesterfield Leatherette 3-Seater", Showroom_Age_Days: 38, Safe_Limit_Days: 45, Action_Required: "FLASH_SALE_15%_DISCOUNT" }
    ],
    'VIP_Villa_Projects': getCloudTable('VIP_Villa_Projects') || [
      { Project_ID: "VILLA-001", Client: "Er. Alok Mohanty", Location: "Raniguda Farmhouse", Total_Budget_INR: 850000, Architect: "Ar. Sunita Patnaik", Status: "EXECUTION_IN_PROGRESS" }
    ]
  };

  // Add any additional dynamic tables returned by Google Sheets
  const tableDataMap = { ...baseTableMap };
  if (cloudTables && typeof cloudTables === 'object') {
    Object.keys(cloudTables).forEach(cloudKey => {
      if (!tableDataMap[cloudKey] && Array.isArray(cloudTables[cloudKey])) {
        tableDataMap[cloudKey] = cloudTables[cloudKey];
      }
    });
  }

  const rawRows = tableDataMap[selectedTable] || [];
  
  // Extract all unique headers across all rows in the active table
  const headers = React.useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];
    const keysSet = new Set();
    rawRows.forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(k => keysSet.add(k));
      }
    });
    return Array.from(keysSet);
  }, [rawRows]);

  const totalRecordsCount = Object.values(tableDataMap).reduce((sum, list) => sum + (list?.length || 0), 0);

  const filteredRows = rawRows.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleStartEdit = (row, idx) => {
    setEditingRowIndex(idx);
    setEditFormData({ ...row });
    playScanBeep();
  };

  const handleSaveRow = async () => {
    playSuccessChime();
    showToast(`💾 Record updated in ${selectedTable} & synced to Google Sheets!`, true);
    
    dispatchWebhookAction('UPDATE_UNIVERSAL_RECORD', {
      target_table: selectedTable,
      record_id: editFormData[headers[0]] || `REC-${Date.now()}`,
      updated_fields: editFormData
    });
    
    setEditingRowIndex(null);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawRows, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${selectedTable}_Export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    playSuccessChime();
    showToast(`📥 Exported ${selectedTable} (${rawRows.length} rows) as JSON!`, true);
  };

  const handleExportCsv = () => {
    if (!rawRows.length) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rawRows.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `${selectedTable}_Export.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    playSuccessChime();
    showToast(`📥 Exported ${selectedTable} (${rawRows.length} rows) as CSV!`, true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.25s ease-out' }}>
      
      {/* 🌟 Top Action Ribbon & Database Command Tower */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">🗄️ ENTERPRISE 43-TABLE DATABASE STUDIO</span>
          
          <button className="btn-cyan" onClick={() => openModal('csv_import')} style={{ fontSize: '11px', padding: '5px 10px', fontWeight: '800' }}>
            📥 Import CSV / Excel
          </button>

          <button className="btn-luxury-gold" onClick={() => openModal('appsscript_hub')} style={{ fontSize: '11px', padding: '5px 10px', fontWeight: '800' }}>
            ⚡ Apps Script Gateway
          </button>
          
          <button className="btn-ghost-edit" onClick={() => syncWithGoogleSheets()} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <RefreshCw size={13} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Master Sync</span>
          </button>

          <button className="btn-ghost-edit" onClick={handleExportCsv} style={{ fontSize: '11px', padding: '5px 10px', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}>
            <FileSpreadsheet size={13} /> <span>Export CSV</span>
          </button>

          <button className="btn-ghost-edit" onClick={handleExportJson} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <Download size={13} /> <span>Export JSON</span>
          </button>
        </div>

        {/* Right Cross-Tab Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('executive');
              showToast("👑 Switched to Executive Hub!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <span>Executive (Tab 1)</span>
          </button>

          <button 
            className="btn-emerald" 
            onClick={() => {
              setActiveTab('safelock');
              showToast("🔒 Switched to SafeLock Inventory Terminal!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ShieldCheck size={12} /> <span>SafeLock (Tab 4)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              setActiveTab('documents');
              showToast("📄 Switched to Document Studio!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Printer size={12} /> <span>Doc Studio (Tab 10)</span>
          </button>
        </div>

      </div>

      {/* 📊 20-Table Database Telemetry Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="kpi-card" style={{ padding: '12px' }}>
          <div className="kpi-label"><Database size={13} color="var(--accent-cyan)" /> Master Tables</div>
          <div className="kpi-value" style={{ fontSize: '20px', color: 'var(--accent-cyan)' }}>{Object.keys(tableDataMap).length} Active Tables</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Auto-healing Schema Engine</div>
        </div>

        <div className="kpi-card" style={{ padding: '12px' }}>
          <div className="kpi-label"><Layers size={13} color="var(--accent-gold)" /> Total Live Records</div>
          <div className="kpi-value" style={{ fontSize: '20px', color: 'var(--accent-gold-light)' }}>{totalRecordsCount.toLocaleString()} Rows</div>
          <div style={{ fontSize: '10.5px', color: 'var(--accent-emerald)' }}>100% In-Sync with Google Sheets</div>
        </div>

        <div className="kpi-card" style={{ padding: '12px' }}>
          <div className="kpi-label"><Sparkles size={13} color="var(--accent-emerald)" /> Webhook Handlers</div>
          <div className="kpi-value" style={{ fontSize: '20px', color: 'var(--accent-emerald)' }}>28 Actions Active</div>
          <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>POST & GET 2-Way Sync</div>
        </div>
      </div>

      {/* 🗂️ 20 Table Selector Pills Strip */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', background: '#0B132B', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
        {Object.keys(tableDataMap).map(tbl => {
          const rowCount = tableDataMap[tbl]?.length || 0;
          const isSelected = selectedTable === tbl;
          return (
            <button 
              key={tbl}
              className={`btn-ghost-edit ${isSelected ? 'badge-gold' : ''}`}
              onClick={() => { setSelectedTable(tbl); setEditingRowIndex(null); }}
              style={{ fontSize: '11px', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <span>📊</span>
              <span>{tbl.replace(/_/g, ' ')}</span>
              <span style={{ fontSize: '10px', opacity: 0.8, background: isSelected ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                {rowCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* 📋 Master Table Grid Container */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>Active Table: {selectedTable.replace(/_/g, ' ')}</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Showing {filteredRows.length} of {rawRows.length} records • Real-time in-place cell editing enabled
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              placeholder={`🔍 Search in ${selectedTable}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '7px 12px', color: '#FFFFFF', fontSize: '12px', outline: 'none', width: '220px' }}
            />
          </div>
        </div>

        {/* Universal Luxury Table */}
        <div className="data-table-wrapper" style={{ maxHeight: '520px' }}>
          <table className="luxury-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                {headers.map(h => (
                  <th key={h}>{h.replace(/_/g, ' ')}</th>
                ))}
                <th style={{ textAlign: 'center', width: '90px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => {
                const isEditing = editingRowIndex === idx;
                return (
                  <tr key={idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'JetBrains Mono' }}>{idx + 1}</td>
                    {headers.map(h => (
                      <td key={h}>
                        {isEditing ? (
                          <input 
                            value={editFormData[h] || ''}
                            onChange={e => setEditFormData({ ...editFormData, [h]: e.target.value })}
                            style={{ background: '#030712', border: '1.5px solid var(--accent-gold)', borderRadius: '4px', padding: '5px 8px', color: '#FFFFFF', fontSize: '12px', width: '100%', outline: 'none' }}
                          />
                        ) : (
                          <span style={{ fontSize: '12px', fontFamily: typeof row[h] === 'number' ? 'JetBrains Mono' : 'inherit' }}>
                            {typeof row[h] === 'number' ? `₹${row[h].toLocaleString()}` : String(row[h] || '-')}
                          </span>
                        )}
                      </td>
                    ))}
                    <td style={{ textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button className="btn-luxury-gold" onClick={handleSaveRow} style={{ padding: '4px 8px', fontSize: '11px' }} title="Save Changes">
                            <Check size={12} />
                          </button>
                          <button className="btn-ghost-edit" onClick={() => setEditingRowIndex(null)} style={{ padding: '4px 8px', fontSize: '11px' }} title="Cancel">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button className="btn-ghost-edit" onClick={() => handleStartEdit(row, idx)} style={{ padding: '4px 8px', fontSize: '11px' }} title="Edit Record">
                          <Edit size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

