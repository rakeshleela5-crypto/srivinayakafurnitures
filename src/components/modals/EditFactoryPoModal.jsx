import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Factory, 
  X, 
  Check, 
  Trash2, 
  Plus, 
  Truck, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Layers,
  FileText
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function EditFactoryPoModal({ isOpen, onClose, po = null, onSave = null }) {
  const { catalog, showToast } = useStore();

  const [poId, setPoId] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [status, setStatus] = useState('PO_ACTIVE');
  const [transporter, setTransporter] = useState('VRL Logistics Express');
  const [lrNumber, setLrNumber] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('30_ADVANCE_70_LR');
  const [monsoonWrap, setMonsoonWrap] = useState(true);
  const [notes, setNotes] = useState('');
  
  // Multi-item lines
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (isOpen && po) {
      setPoId(po.po_id || 'PO-2026-901');
      setSupplier(po.supplier || 'Godrej Khalapur Main Plant (MH)');
      setExpectedDate(po.expected_delivery || '15-Sep-2026');
      setStatus(po.status || 'PO_ACTIVE');
      setTransporter(po.transporter || 'VRL Logistics Express');
      setLrNumber(po.lr_number || `LR-${Math.floor(100000 + Math.random() * 900000)}`);
      setPaymentTerms(po.payment_terms || '30_ADVANCE_70_LR');
      setMonsoonWrap(po.monsoon_wrap !== undefined ? po.monsoon_wrap : true);
      setNotes(po.notes || 'Handle with Care — Knockdown 5-Box Heavy Teak Kits');

      // Populate items
      if (po.items && Array.isArray(po.items) && po.items.length > 0) {
        setItems(po.items);
      } else {
        // Fallback for single-item legacy POs
        setItems([
          {
            sku: po.sku || 'BED-MOD-001',
            product_name: po.product_name || catalog.find(c => c.SKU === po.sku)?.Product_Name || 'Solid Teak Bed',
            qty: po.qty || 5,
            unit_cost: po.unit_cost || 62000,
            gst_pct: 18
          }
        ]);
      }
    }
  }, [isOpen, po, catalog]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    const defaultSku = catalog[0]?.SKU || 'BED-MOD-001';
    const defaultItem = catalog.find(c => c.SKU === defaultSku);
    setItems([
      ...items,
      {
        sku: defaultSku,
        product_name: defaultItem?.Product_Name || 'Furniture Item',
        qty: 2,
        unit_cost: defaultItem?.Price ? Math.round(defaultItem.Price * 0.65) : 35000,
        gst_pct: 18
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      showToast("⚠️ Purchase Order must contain at least 1 item line.", false);
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === 'sku') {
      const selected = catalog.find(c => c.SKU === value);
      updated[index].sku = value;
      updated[index].product_name = selected?.Product_Name || value;
      if (selected?.Price) {
        updated[index].unit_cost = Math.round(selected.Price * 0.65);
      }
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  // Calculations
  const subtotalValue = items.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.unit_cost) || 0)), 0);
  const gstValue = items.reduce((acc, it) => {
    const lineTotal = (Number(it.qty) || 0) * (Number(it.unit_cost) || 0);
    const gstRate = (Number(it.gst_pct) || 18) / 100;
    return acc + (lineTotal * gstRate);
  }, 0);
  const grandTotalValue = Math.round(subtotalValue + gstValue);

  const handleSavePo = () => {
    const updatedPo = {
      ...po,
      po_id: poId,
      supplier,
      expected_delivery: expectedDate,
      status,
      transporter,
      lr_number: lrNumber,
      payment_terms: paymentTerms,
      monsoon_wrap: monsoonWrap,
      notes,
      items,
      sku: items.map(i => i.sku).join(', '),
      qty: items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0),
      total_value: grandTotalValue,
      updated_at: new Date().toISOString()
    };

    if (onSave) {
      onSave(updatedPo);
    }

    // Dispatch 2-way Webhook to Google Sheets Purchase_Orders_Log
    dispatchWebhookAction('UPDATE_PURCHASE_ORDER', {
      po_id: poId,
      supplier,
      status,
      expected_delivery: expectedDate,
      transporter,
      lr_number: lrNumber,
      total_value: grandTotalValue,
      items_json: JSON.stringify(items),
      notes
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`✅ Factory Purchase Order #${poId} updated & synced to Google Sheets!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '820px', width: '92vw', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Modal Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)' }}>
              <Factory size={20} color="var(--accent-gold-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Edit Factory Purchase Order (#{poId})
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Modify quantities, factory plant, transporter LR Bilty, or delivery tracking
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0', maxHeight: '68vh', overflowY: 'auto', paddingRight: '4px' }}>
          
          {/* Section 1: Supplier, Status & Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            
            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-gold-light)' }}>🏭 Factory Manufacturer / Plant</label>
              <select value={supplier} onChange={e => setSupplier(e.target.value)}>
                <option value="Godrej Khalapur Main Plant (MH)">Godrej Khalapur Main Plant (MH) — GSTIN: 27AAACG0534B1Z9</option>
                <option value="Godrej Chennai Upholstery Plant (TN)">Godrej Chennai Upholstery Plant (TN) — GSTIN: 33AAACG0534B1Z5</option>
                <option value="Godrej Interio Vikhroli Plant, Mumbai (MH)">Godrej Interio Vikhroli Plant, Mumbai (MH) — GSTIN: 27AAACG0534B1Z9</option>
                <option value="Royal Teak Crafts, Saharanpur (UP)">Royal Teak Crafts, Saharanpur (UP) — GSTIN: 09AAAA0000A1Z1</option>
                <option value="CenturyPly ProModular, Cuttack (OD)">CenturyPly ProModular, Cuttack (OD) — GSTIN: 21CCCC2222C3Z3</option>
                <option value="Sheesham Wood Hub, Jodhpur (RJ)">Sheesham Wood Hub, Jodhpur (RJ) — GSTIN: 08BBBB1111B2Z2</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>🚦 Lifecycle Order Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="PO_ACTIVE">🟡 PO Placed & Active at Factory</option>
                <option value="MANUFACTURING">🟠 In Production / 5-Box Assembly</option>
                <option value="TRUCK_IN_TRANSIT">🔵 Truck In-Transit (Dispatched)</option>
                <option value="AT_DOCK">🟣 Truck Arrived at Rayagada Dock</option>
                <option value="INWARD_RECEIVED">🟢 Inward QC Passed & Stocked</option>
                <option value="CANCELLED">🔴 Cancelled / Voided</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11px', color: '#CBD5E1' }}>📅 Expected Arrival Date</label>
              <input type="text" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} placeholder="DD-MMM-YYYY" />
            </div>

          </div>

          {/* Section 2: Logistics, LR Bilty & Payment Terms */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Truck size={14} /> Indian Logistics & Transporter Details
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div className="form-field">
                <label style={{ fontSize: '10.5px' }}>Transporter Agency</label>
                <select value={transporter} onChange={e => setTransporter(e.target.value)}>
                  <option value="VRL Logistics Express">VRL Logistics Express (Hub: Rayagada)</option>
                  <option value="SafeXpress Supply Chain">SafeXpress Supply Chain (Vizag ➔ Rayagada)</option>
                  <option value="GATI-KWE Surface Express">GATI-KWE Surface Express</option>
                  <option value="ARC Roadways Heavy Freight">ARC Roadways Heavy Freight</option>
                  <option value="Direct Godrej Dedicated Truck">Direct Godrej Dedicated Truck (OD-18-E-4491)</option>
                </select>
              </div>

              <div className="form-field">
                <label style={{ fontSize: '10.5px' }}>Lorry Receipt (LR / Bilty #)</label>
                <input type="text" value={lrNumber} onChange={e => setLrNumber(e.target.value)} placeholder="LR-789123" />
              </div>

              <div className="form-field">
                <label style={{ fontSize: '10.5px' }}>Payment Terms</label>
                <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}>
                  <option value="30_ADVANCE_70_LR">30% Advance + 70% against LR Copy</option>
                  <option value="100_ADVANCE_RTGS">100% Advance via RTGS / NEFT</option>
                  <option value="30_DAYS_MSME_CREDIT">30-Day MSME Credit Cycle</option>
                  <option value="AGAINST_DELIVERY">100% Cash/UPI on Dock Unloading</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <input 
                type="checkbox" 
                id="monsoonWrapEdit" 
                checked={monsoonWrap} 
                onChange={e => setMonsoonWrap(e.target.checked)} 
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="monsoonWrapEdit" style={{ fontSize: '11px', color: '#E2E8F0', cursor: 'pointer', margin: 0 }}>
                🌧️ <b>Monsoon Moisture Barrier & Shrink-Wrap Packaging Verified</b> (Mandatory for solid teak)
              </label>
            </div>
          </div>

          {/* Section 3: Multi-SKU Items Line Table */}
          <div style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={14} /> Multi-SKU Line Items ({items.length})
              </div>
              <button className="btn-luxury-gold" onClick={handleAddItem} style={{ fontSize: '11px', padding: '4px 10px' }}>
                <Plus size={12} /> Add Item Line
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '8px' }}>Furniture SKU & Product</th>
                    <th style={{ padding: '8px', width: '80px' }}>Qty (Sets)</th>
                    <th style={{ padding: '8px', width: '110px' }}>Factory Rate (₹)</th>
                    <th style={{ padding: '8px', width: '70px' }}>GST %</th>
                    <th style={{ padding: '8px', width: '110px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '8px', width: '40px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => {
                    const lineTotal = (Number(it.qty) || 0) * (Number(it.unit_cost) || 0);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '6px 8px' }}>
                          <select 
                            value={it.sku} 
                            onChange={e => handleItemChange(idx, 'sku', e.target.value)}
                            style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                          >
                            {catalog.map(c => (
                              <option key={c.SKU} value={c.SKU}>{c.SKU} — {c.Product_Name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input 
                            type="number" 
                            min="1" 
                            value={it.qty} 
                            onChange={e => handleItemChange(idx, 'qty', Number(e.target.value))}
                            style={{ width: '100%', fontSize: '11px', padding: '5px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <input 
                            type="number" 
                            value={it.unit_cost} 
                            onChange={e => handleItemChange(idx, 'unit_cost', Number(e.target.value))}
                            style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                          />
                        </td>
                        <td style={{ padding: '6px 8px' }}>
                          <select 
                            value={it.gst_pct || 18} 
                            onChange={e => handleItemChange(idx, 'gst_pct', Number(e.target.value))}
                            style={{ width: '100%', fontSize: '11px', padding: '5px' }}
                          >
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                            <option value="12">12%</option>
                            <option value="0">0%</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                          ₹{lineTotal.toLocaleString()}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleRemoveItem(idx)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '4px' }}
                            title="Remove Line"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Strip */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal: </span>
                <strong>₹{subtotalValue.toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated GST: </span>
                <strong>₹{Math.round(gstValue).toLocaleString()}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--accent-gold-light)' }}>Grand PO Payable: </span>
                <strong style={{ fontSize: '14px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                  ₹{grandTotalValue.toLocaleString()}
                </strong>
              </div>
            </div>

          </div>

          {/* Section 4: Remarks & Delivery Instructions */}
          <div className="form-field">
            <label style={{ fontSize: '11px', color: '#94A3B8' }}>📝 Dispatch & Dock Inspection Instructions</label>
            <input 
              type="text" 
              value={notes} 
              onChange={e => setNotes(e.target.value)} 
              placeholder="e.g. Unload at Rayagada Dock 1. 100% Carton Barcode QC Required." 
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '12px' }}>
          <button className="btn-ghost-edit" onClick={onClose} style={{ padding: '8px 18px' }}>
            Cancel
          </button>
          
          <button className="btn-luxury-gold" onClick={handleSavePo} style={{ padding: '8px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> Save Changes & Sync to Google Sheets
          </button>
        </div>

      </div>
    </div>
  );
}
