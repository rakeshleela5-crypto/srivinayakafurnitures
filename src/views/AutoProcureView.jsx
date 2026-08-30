import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Factory, 
  AlertCircle, 
  Send, 
  Printer, 
  Check, 
  Plus, 
  FileText,
  DollarSign
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function AutoProcureView() {
  const { catalog, inventory, adjustStock, showToast } = useStore();

  const [supplier, setSupplier] = useState("Royal Teak Crafts, Saharanpur (UP)");
  const [poSku, setPoSku] = useState("BED-MOD-001");
  const [poQty, setPoQty] = useState(5);
  const [unitCost, setUnitCost] = useState(62000);
  const [poGenerated, setPoGenerated] = useState(false);

  // Category Reorder Threshold & Lead Time State
  const [bedLeadDays, setBedLeadDays] = useState(14);
  const [bedReorderThreshold, setBedReorderThreshold] = useState(2);
  const [sofaLeadDays, setSofaLeadDays] = useState(21);
  const [sofaReorderThreshold, setSofaReorderThreshold] = useState(1);
  const [showLeadTimeModal, setShowLeadTimeModal] = useState(false);

  const totalPoValue = poQty * unitCost;

  const lowStockItems = inventory.filter(i => i.Warehouse_Qty <= i.Buffer_Threshold);

  const handleGeneratePO = () => {
    setPoGenerated(true);
    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`🏭 Factory Purchase Order #PO-2026-881 generated for ₹${totalPoValue.toLocaleString()}!`, true);
  };

  const handleReceiveShipment = () => {
    adjustStock(poSku, poQty, 0, "Factory PO Inward Shipment Received & Verified");
    showToast(`📦 Inward Shipment Received: +${poQty} Units added to ${poSku} stock!`, true);
    setPoGenerated(false);
  };

  const handleSendWhatsAppPO = () => {
    const text = `🏭 *OFFICIAL PURCHASE ORDER — GODREJ INTERIO RAYAGADA*\n` +
      `*PO Ref:* #PO-2026-881 | Date: ${new Date().toLocaleDateString('en-IN')}\n` +
      `*Manufacturer:* ${supplier}\n` +
      `*Item:* ${poSku} (${catalog.find(c => c.SKU === poSku)?.Product_Name || 'Teak Bed'})\n` +
      `*Quantity:* ${poQty} Sets | *Rate:* ₹${unitCost.toLocaleString()}/Set\n` +
      `*Total PO Value:* ₹${totalPoValue.toLocaleString()}\n` +
      `*Delivery Hub:* Central Warehouse Dock, Main Road, Rayagada (OD 765001)\n\n` +
      `*Authorized Signatory:* Rakesh (Store Director)`;
    window.open(`https://wa.me/919390553301?text=${encodeURIComponent(text)}`, '_blank');
    showToast("📲 Factory Purchase Order sent to Manufacturer WhatsApp!", true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-amber">🏭 AUTOPROCURE™ PREDICTIVE FACTORY PO</span>
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
                <option value="Royal Teak Crafts, Saharanpur (UP)">Royal Teak Crafts, Saharanpur (UP)</option>
                <option value="Sheesham Wood Hub, Jodhpur (RJ)">Sheesham Wood Hub, Jodhpur (RJ)</option>
                <option value="CenturyPly ProModular, Cuttack (OD)">CenturyPly ProModular, Cuttack (OD)</option>
                <option value="Godrej Workspaces Partner, Vizag (AP)">Godrej Workspaces Partner, Vizag (AP)</option>
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

          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Factory PO Value:</span>
            <strong style={{ fontSize: '18px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
              ₹{totalPoValue.toLocaleString()}
            </strong>
          </div>

          <button className="btn-luxury-gold" onClick={handleGeneratePO} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            <FileText size={16} /> Generate Legal Factory PO & WhatsApp Specs
          </button>
        </div>

        {/* Generated Factory PO Preview */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>📄 Purchase Order Preview (#PO-2026-881)</h3>
            {poGenerated && <span className="badge badge-emerald">PO ACTIVE</span>}
          </div>

          <div style={{ background: '#FFFFFF', color: '#000000', borderRadius: '12px', padding: '20px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '900' }}>PURCHASE ORDER</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Godrej Interio Flagship Rayagada (GSTIN: 21AAAAA0000A1Z5)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800' }}>PO #: PO-2026-881</div>
                <div style={{ color: '#64748B' }}>Date: 28-Aug-2026</div>
              </div>
            </div>

            <div style={{ margin: '10px 0' }}>
              <div><b>Vendor:</b> {supplier}</div>
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
                  <td style={{ padding: '8px 6px', borderBottom: '1px solid #E2E8F0' }}>{poSku} (5-Box Knockdown)</td>
                  <td style={{ padding: '8px 6px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>{poQty} Units</td>
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-emerald" onClick={handleSendWhatsAppPO} style={{ flex: 1, justifyContent: 'center' }}>
              <Send size={14} /> Send WhatsApp PO to Factory
            </button>
            <button className="btn-purple" onClick={handleReceiveShipment} style={{ flex: 1, justifyContent: 'center' }}>
              <Check size={14} /> 1-Click Receive Inward Truck (+{poQty})
            </button>
          </div>
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
            <button className="btn-luxury-gold" onClick={() => { setShowLeadTimeModal(false); showToast("⚙️ Factory Lead Times and Reorder Thresholds saved!"); }} style={{ width: '100%', justifyContent: 'center' }}>
              <Check size={16} /> Save Lead Time Policies
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
