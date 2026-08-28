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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-amber">🏭 AUTOPROCURE™ PREDICTIVE FACTORY PO</span>
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
            <button className="btn-emerald" onClick={() => showToast(`💬 PO dispatched to ${supplier} via WhatsApp!`, true)} style={{ flex: 1, justifyContent: 'center' }}>
              <Send size={14} /> Send WhatsApp to Factory
            </button>
            <button className="btn-purple" onClick={handleReceiveShipment} style={{ flex: 1, justifyContent: 'center' }}>
              <Check size={14} /> 1-Click Receive Inward Truck (+{poQty})
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
