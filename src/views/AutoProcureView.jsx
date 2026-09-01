import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Factory, 
  AlertCircle, 
  Send, 
  Check, 
  FileText,
  Clock,
  Package,
  Truck,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function AutoProcureView() {
  const { catalog, inventory, adjustStock, showToast } = useStore();

  const [supplier, setSupplier] = useState("Royal Teak Crafts, Saharanpur (UP)");
  const [poSku, setPoSku] = useState("BED-MOD-001");
  const [poQty, setPoQty] = useState(5);
  const [unitCost, setUnitCost] = useState(62000);
  const [poGenerated, setPoGenerated] = useState(false);
  const [currentPoId, setCurrentPoId] = useState("PO-2026-901");

  // Category Reorder Threshold & Lead Time State
  const [bedLeadDays, setBedLeadDays] = useState(14);
  const [bedReorderThreshold, setBedReorderThreshold] = useState(2);
  const [sofaLeadDays, setSofaLeadDays] = useState(21);
  const [sofaReorderThreshold, setSofaReorderThreshold] = useState(1);
  const [showLeadTimeModal, setShowLeadTimeModal] = useState(false);

  // Live Purchase Orders History
  const [poHistory, setPoHistory] = useState([
    {
      po_id: "PO-2026-881",
      supplier: "Royal Teak Crafts, Saharanpur (UP)",
      sku: "BED-MOD-001",
      qty: 5,
      unit_cost: 62000,
      total_value: 310000,
      lead_days: 14,
      expected_delivery: "15-Sep-2026",
      status: "PO_ACTIVE"
    },
    {
      po_id: "PO-2026-879",
      supplier: "CenturyPly ProModular, Cuttack (OD)",
      sku: "WDR-MOD-001",
      qty: 3,
      unit_cost: 45000,
      total_value: 135000,
      lead_days: 7,
      expected_delivery: "08-Sep-2026",
      status: "TRUCK_IN_TRANSIT"
    },
    {
      po_id: "PO-2026-865",
      supplier: "Godrej Workspaces Partner, Vizag (AP)",
      sku: "OFC-CH-002",
      qty: 10,
      unit_cost: 8500,
      total_value: 85000,
      lead_days: 5,
      expected_delivery: "28-Aug-2026",
      status: "INWARD_RECEIVED"
    }
  ]);

  const totalPoValue = poQty * unitCost;

  // Calculate Expected Delivery Date
  const getExpectedDateStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dayStr = String(d.getDate()).padStart(2, '0');
    return `${dayStr}-${months[d.getMonth()]}-${d.getFullYear()}`;
  };

  const lowStockItems = inventory.filter(i => i.Warehouse_Qty <= i.Buffer_Threshold);

  const handleGeneratePO = () => {
    const newPoId = `PO-2026-${Math.floor(900 + Math.random() * 99)}`;
    const leadDays = poSku.startsWith("BED") || poSku.startsWith("WDR") ? bedLeadDays : sofaLeadDays;
    const expectedArrival = getExpectedDateStr(leadDays);

    setCurrentPoId(newPoId);
    setPoGenerated(true);

    const newPoRecord = {
      po_id: newPoId,
      supplier,
      sku: poSku,
      qty: poQty,
      unit_cost: unitCost,
      total_value: totalPoValue,
      lead_days: leadDays,
      expected_delivery: expectedArrival,
      status: "PO_ACTIVE"
    };

    setPoHistory([newPoRecord, ...poHistory]);

    // Webhook dispatch to Google Sheets Purchase_Orders_Log
    dispatchWebhookAction("GENERATE_FACTORY_PO", {
      po_id: newPoId,
      supplier,
      sku: poSku,
      qty: poQty,
      unit_cost: unitCost,
      total_value: totalPoValue,
      lead_days: leadDays,
      expected_delivery: expectedArrival,
      status: "PO_ACTIVE",
      timestamp: new Date().toISOString()
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🏭 Factory PO ${newPoId} generated for ₹${totalPoValue.toLocaleString()} & synced to Google Sheets!`, true);
  };

  const handleReceiveShipment = (targetPoId = currentPoId, sku = poSku, qty = poQty) => {
    adjustStock(sku, qty, 0, `Factory PO ${targetPoId} Inward Shipment Received & Verified`);

    setPoHistory(poHistory.map(p => p.po_id === targetPoId ? { ...p, status: "INWARD_RECEIVED" } : p));

    // Webhook dispatch to Google Sheets Purchase_Orders_Log QC receiving
    dispatchWebhookAction("RECEIVE_INWARD_PO_QC", {
      po_id: targetPoId,
      factory_plant: supplier,
      truck_vehicle_no: "OD-18-E-4491",
      cartons_expected: qty,
      cartons_received: qty,
      damaged_cartons: 0,
      qc_status: "PASSED_100_PERCENT",
      inspector_remarks: "Verified at Central Warehouse Inward Dock",
      timestamp: new Date().toISOString()
    });

    showToast(`📦 Inward Truck Received: +${qty} Units added to ${sku} warehouse stock!`, true);
    setPoGenerated(false);
  };

  const handleSendWhatsAppPO = () => {
    const leadDays = poSku.startsWith("BED") || poSku.startsWith("WDR") ? bedLeadDays : sofaLeadDays;
    const expectedArrival = getExpectedDateStr(leadDays);

    const text = `🏭 *OFFICIAL PURCHASE ORDER — GODREJ INTERIO RAYAGADA*\n` +
      `*PO Ref:* #${currentPoId} | Date: ${new Date().toLocaleDateString('en-IN')}\n` +
      `*Manufacturer:* ${supplier}\n` +
      `*Item:* ${poSku} (${catalog.find(c => c.SKU === poSku)?.Product_Name || 'Teak Bed'})\n` +
      `*Quantity:* ${poQty} Sets | *Rate:* ₹${unitCost.toLocaleString()}/Set\n` +
      `*Total PO Value:* ₹${totalPoValue.toLocaleString()}\n` +
      `*Expected Transit Lead Time:* ${leadDays} Days (Arrival: ${expectedArrival})\n` +
      `*Delivery Hub:* Central Warehouse Dock, Main Road, Rayagada (OD 765001)\n\n` +
      `*Authorized Signatory:* Rakesh (Store Director)`;

    // Log WhatsApp outbound dispatch
    dispatchWebhookAction("DISPATCH_WHATSAPP_PO_DISPATCH", {
      po_id: currentPoId,
      supplier,
      phone: "+91 93905 53301",
      message: text
    });

    window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`📲 Factory PO #${currentPoId} dispatched to Manufacturer WhatsApp!`, true);
  };

  const handleSaveLeadTimePolicies = () => {
    dispatchWebhookAction("SAVE_FACTORY_LEADTIME_POLICIES", {
      bed_lead_days: bedLeadDays,
      bed_reorder_threshold: bedReorderThreshold,
      sofa_lead_days: sofaLeadDays,
      sofa_reorder_threshold: sofaReorderThreshold,
      timestamp: new Date().toISOString()
    });
    setShowLeadTimeModal(false);
    showToast("⚙️ Predictive Lead-Time & Buffer Policies saved to Google Sheets!", true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">🏭 AUTOPROCURE™ PREDICTIVE FACTORY PO ENGINE</span>
          <button className="btn-luxury-gold" onClick={() => setShowLeadTimeModal(true)}>
            ⚙️ Lead-Time & Buffer Sliders
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Automated Buffer Stock Reordering Engine</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-rose">{lowStockItems.length} SKUs Below Buffer Threshold</span>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div style={{ background: 'rgba(244,63,94,0.12)', border: '1.5px solid var(--accent-rose)', borderRadius: '14px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="var(--accent-rose)" />
            <div>
              <strong style={{ color: '#FFFFFF', fontSize: '13px' }}>Critical Stockout Defense Warning!</strong>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                {lowStockItems.map(i => `${i.SKU} (${i.Warehouse_Qty} left)`).join(', ')} require immediate factory replenishment.
              </div>
            </div>
          </div>
          <button className="btn-luxury-gold" onClick={() => { setPoSku(lowStockItems[0].SKU); setPoQty(6); handleGeneratePO(); }}>
            ⚡ 1-Click Replenish Critical Stock
          </button>
        </div>
      )}

      {/* Grid: PO Builder + Document Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        
        {/* Factory PO Builder Form */}
        <div className="glass-panel">
          <h3 style={{ fontSize: '16px', fontWeight: '800' }}>📝 Factory Purchase Order Builder</h3>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="form-field">
              <label>Select Manufacturer / Factory Supplier</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}>
                <option value="Royal Teak Crafts, Saharanpur (UP)">Royal Teak Crafts, Saharanpur (UP) — GSTIN: 09AAAA0000A1Z1</option>
                <option value="Sheesham Wood Hub, Jodhpur (RJ)">Sheesham Wood Hub, Jodhpur (RJ) — GSTIN: 08BBBB1111B2Z2</option>
                <option value="CenturyPly ProModular, Cuttack (OD)">CenturyPly ProModular, Cuttack (OD) — GSTIN: 21CCCC2222C3Z3</option>
                <option value="Godrej Workspaces Partner, Vizag (AP)">Godrej Workspaces Partner, Vizag (AP) — GSTIN: 37DDDD3333D4Z4</option>
              </select>
            </div>

            <div className="form-field">
              <label>Target Furniture SKU</label>
              <select value={poSku} onChange={e => setPoSku(e.target.value)}>
                {catalog.map(c => (
                  <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name}</option>
                ))}
              </select>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-field">
                <label>Reorder Quantity</label>
                <input type="number" value={poQty} onChange={e => setPoQty(Number(e.target.value))} />
              </div>
              <div className="form-field">
                <label>Factory Unit Cost (₹)</label>
                <input type="number" value={unitCost} onChange={e => setUnitCost(Number(e.target.value))} />
              </div>
            </div>
          </div>

          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Factory PO Value:</span>
            <strong style={{ fontSize: '18px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
              ₹{totalPoValue.toLocaleString()}
            </strong>
          </div>

          <button className="btn-luxury-gold" onClick={handleGeneratePO} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            <FileText size={16} /> Generate Legal Factory PO ({currentPoId}) & Sync Sheets
          </button>
        </div>

        {/* Generated Factory PO Preview */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>📄 Purchase Order Preview (#{currentPoId})</h3>
            {poGenerated ? <span className="badge badge-emerald">PO ACTIVE & SYNCED</span> : <span className="badge badge-purple">DRAFT PO</span>}
          </div>

          <div style={{ background: '#FFFFFF', color: '#000000', borderRadius: '12px', padding: '20px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '900' }}>PURCHASE ORDER</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Godrej Interio Flagship Rayagada (GSTIN: 21AAAAA0000A1Z5)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800' }}>PO #: {currentPoId}</div>
                <div style={{ color: '#64748B' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
              </div>
            </div>

            <div style={{ margin: '10px 0' }}>
              <div><b>Vendor:</b> {supplier}</div>
              <div><b>Transit Lead Time:</b> {poSku.startsWith("BED") || poSku.startsWith("WDR") ? bedLeadDays : sofaLeadDays} Days (Expected Arrival: <b>{getExpectedDateStr(poSku.startsWith("BED") || poSku.startsWith("WDR") ? bedLeadDays : sofaLeadDays)}</b>)</div>
              <div><b>Delivery Point:</b> Central Warehouse Dock, Main Road, Rayagada (OD 765001)</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
              <thead>
                <tr style={{ background: '#F1F5F9' }}>
                  <th style={{ padding: '6px', textAlign: 'left' }}>SKU</th>
                  <th style={{ padding: '6px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '6px', textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #E2E8F0' }}>{poSku} (Godrej Certified Knockdown)</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>{poQty} Sets</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>₹{unitCost.toLocaleString()}</td>
                  <td style={{ padding: '8px 6px', textAlign: 'right', borderBottom: '1px solid #E2E8F0', fontWeight: '800' }}>₹{totalPoValue.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: '900' }}>
              Total Amount Payable: ₹{totalPoValue.toLocaleString()}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn-emerald" onClick={handleSendWhatsAppPO} style={{ flex: 1, justifyContent: 'center' }}>
              <Send size={14} /> Send WhatsApp PO to Factory
            </button>
            <button className="btn-purple" onClick={() => handleReceiveShipment(currentPoId, poSku, poQty)} style={{ flex: 1, justifyContent: 'center' }}>
              <Check size={14} /> 1-Click Receive Inward Truck (+{poQty})
            </button>
          </div>
        </div>

      </div>

      {/* 📊 LIVE FACTORY PO TRACKING & LOGS TABLE */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} color="var(--accent-cyan)" /> Live Factory Purchase Orders & Inward Dock Log
          </h3>
          <span className="badge badge-cyan">{poHistory.length} Active Orders</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '10px' }}>PO Number</th>
                <th style={{ padding: '10px' }}>Supplier Factory</th>
                <th style={{ padding: '10px' }}>SKU</th>
                <th style={{ padding: '10px' }}>Qty</th>
                <th style={{ padding: '10px' }}>PO Value (₹)</th>
                <th style={{ padding: '10px' }}>Expected Arrival</th>
                <th style={{ padding: '10px' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {poHistory.map((po, idx) => (
                <tr key={po.po_id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-gold-light)' }}>{po.po_id}</td>
                  <td style={{ padding: '10px' }}>{po.supplier.split(',')[0]}</td>
                  <td style={{ padding: '10px' }}><span className="badge badge-purple">{po.sku}</span></td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{po.qty} Sets</td>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--accent-green)' }}>₹{po.total_value.toLocaleString()}</td>
                  <td style={{ padding: '10px', color: 'var(--accent-cyan)' }}>{po.expected_delivery}</td>
                  <td style={{ padding: '10px' }}>
                    {po.status === "PO_ACTIVE" && <span className="badge badge-emerald">PO ACTIVE</span>}
                    {po.status === "TRUCK_IN_TRANSIT" && <span className="badge badge-amber">IN TRANSIT 🚛</span>}
                    {po.status === "INWARD_RECEIVED" && <span className="badge badge-cyan">INWARD RECEIVED ✅</span>}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    {po.status !== "INWARD_RECEIVED" ? (
                      <button className="btn-emerald" onClick={() => handleReceiveShipment(po.po_id, po.sku, po.qty)} style={{ fontSize: '11px', padding: '4px 10px' }}>
                        <Check size={12} /> Receive Dock
                      </button>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold' }}>Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⚙️ REORDER THRESHOLD & LEAD TIME CONFIG MODAL */}
      {showLeadTimeModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: '500px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--accent-gold-light)' }}>⚙️ Predictive Reorder & Factory Lead Times</h3>
              <button className="btn-close-modal" onClick={() => setShowLeadTimeModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '14px 0' }}>
              <p style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Tune automatic factory buffer reorder triggers based on transport transit days from manufacturing hubs:
              </p>
              
              {/* Bedroom Category */}
              <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                  <span>🛏️ Solid Teak Beds & Wardrobes (Shirwal Hub)</span>
                  <span>Lead: {bedLeadDays} Days</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Reorder Buffer Qty</label>
                    <input type="number" value={bedReorderThreshold} onChange={e => setBedReorderThreshold(Number(e.target.value))} style={{ width: '100%', marginTop: '2px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Transit Lead Days</label>
                    <input type="number" value={bedLeadDays} onChange={e => setBedLeadDays(Number(e.target.value))} style={{ width: '100%', marginTop: '2px' }} />
                  </div>
                </div>
              </div>

              {/* Living Room Category */}
              <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                  <span>🛋️ Velvet Sofas & Recliners (Chennai Hub)</span>
                  <span>Lead: {sofaLeadDays} Days</span>
                </div>
                <div style={{ display: 'flex', gap: '14px', marginTop: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Reorder Buffer Qty</label>
                    <input type="number" value={sofaReorderThreshold} onChange={e => setSofaReorderThreshold(Number(e.target.value))} style={{ width: '100%', marginTop: '2px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Transit Lead Days</label>
                    <input type="number" value={sofaLeadDays} onChange={e => setSofaLeadDays(Number(e.target.value))} style={{ width: '100%', marginTop: '2px' }} />
                  </div>
                </div>
              </div>

            </div>
            <button className="btn-luxury-gold" onClick={handleSaveLeadTimePolicies} style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={16} /> Save Lead Time Policies to Google Sheets
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
