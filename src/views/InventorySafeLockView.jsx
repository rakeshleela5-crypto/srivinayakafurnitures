import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import CustomerOrderSearchSelector from '../components/common/CustomerOrderSearchSelector';
import { 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  Check, 
  QrCode, 
  Printer, 
  RotateCcw, 
  Plus, 
  Minus,
  Sparkles,
  Barcode,
  Truck,
  ArrowDownToLine,
  RefreshCw,
  Clock,
  Flame,
  FileSpreadsheet
} from 'lucide-react';
import { playScanBeep, playSuccessChime, playSafeLockSound, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';
import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { EditableCell } from '../components/common/InlineCellRenderer';

export function InventorySafeLockView() {
  const { 
    inventory,
    setInventory,
    orders,
    smartKitBoxes, 
    adjustStock, 
    verifySmartKitBox, 
    openModal, 
    showToast,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing
  } = useStore();

  // 📝 Inline cell edit — inventory table, saves to D1 'inventory'
  const cellEdit = useInlineCellEdit({ table: 'inventory', pkField: 'SKU', readOnly: ['SKU', 'Reorder_Status'], setRows: setInventory, showToast });

  const [selectedSku, setSelectedSku] = useState('BED-MOD-001');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [isLaserSweeping, setIsLaserSweeping] = useState(false);

  // Token Hold Expiry & Display Piece Tagging State
  const [tokenHoldHours, setTokenHoldHours] = useState(72); // 48h, 72h, 120h, 168h
  const [floorDisplaySkus, setFloorDisplaySkus] = useState(['BED-MOD-001']);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const toggleFloorDisplayTag = (sku) => {
    if (floorDisplaySkus.includes(sku)) {
      setFloorDisplaySkus(prev => prev.filter(s => s !== sku));
      showToast(`🏷️ Removed Floor Display tag from ${sku}. Marked as Fresh Godown Stock.`);
    } else {
      setFloorDisplaySkus(prev => [...prev, sku]);
      showToast(`✨ Re-tagged ${sku} as Showroom Floor Display Piece (15% Clearance Tag)!`, true);
    }
  };

  const selectedOrderObj = selectedCustomerFilter !== 'ALL' ? orders.find(o => o.Order_ID === selectedCustomerFilter) : null;

  const filteredInventory = inventory.filter(item => {
    if (selectedOrderObj) {
      const isOrderedItem = (selectedOrderObj.Ordered_SKU || '').includes(item.SKU);
      return isOrderedItem;
    }
    const itemCat = item.Category || item.Main_Category || "";
    const matchesSearch = (item.Product_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterCategory === 'ALL' || itemCat === filterCategory;
    return matchesSearch && matchesCat;
  });

  const stagedCount = smartKitBoxes.filter(b => b.Status === 'VERIFIED_STAGED').length;
  const isAllStaged = stagedCount === smartKitBoxes.length;

  const runAllBoxScan = async () => {
    setIsLaserSweeping(true);
    playScanBeep();
    showToast("🔍 Running 5-Box Laser Sweep Staging Verification...", true);

    await new Promise(r => setTimeout(r, 600));
    smartKitBoxes.forEach(box => verifySmartKitBox(box.Box_ID));
    
    const targetOrderId = selectedOrderObj?.Order_ID || 'ORD-2026-001';
    const dispatchRes = await dispatchWebhookAction('SMARTKIT_BOX_STAGED', {
      order_id: targetOrderId,
      customer_name: selectedOrderObj?.Customer_Name || 'Dr. Subhashish Jena',
      product: selectedSku,
      staged_status: '5/5_STAGED_DOCK_GATEPASS_ISSUED',
      driver: 'Tophan Gouda (Tata Ace OD-18-A-1234)'
    });

    setIsLaserSweeping(false);
    if (dispatchRes && dispatchRes.success) {
      playSuccessChime();
      playSafeLockSound();
      triggerGoldenConfetti();
      showToast("🔒 5/5 Boxes Staged & Verified! Gate-Pass Dispatch Lock Released & Synced to Cloudflare D1.", true);
    } else {
      showToast(`⚠️ Staged locally (${dispatchRes?.error || 'D1 offline'})`, false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 Top Command Ribbon */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges & Triggers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald">🔒 SAFELOCK™ REAL-TIME INVENTORY</span>
          
          <button className="btn-luxury-gold" onClick={() => openModal('aging_stock')} style={{ fontSize: '11px', padding: '5px 10px' }}>
            📉 Aging Stock Radar (90+ Days)
          </button>
          
          <button className="btn-cyan" onClick={() => setShowConfigModal(true)} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <Clock size={13} /> Token Hold: {tokenHoldHours / 24} Days
          </button>

          <button className="btn-ghost-edit" onClick={() => openModal('csv_import')} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <FileSpreadsheet size={13} /> 📥 Import Excel
          </button>

          <button className="btn-ghost-edit" onClick={() => openModal('stock_override', { sku: selectedSku })} style={{ fontSize: '11px', padding: '5px 10px' }}>
            ✏️ Stock Override
          </button>
        </div>

        {/* Right Cross-Tab Quick Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-amber" 
            onClick={() => {
              setActiveTab('autoprocure');
              showToast("🚚 Switched to AutoProcure to raise Factory Purchase Orders!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Truck size={12} /> <span>Factory POs (Tab 5)</span>
          </button>

          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('inward_scanner');
              showToast("📥 Switched to Dock 1 Inward Scanner!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ArrowDownToLine size={12} /> <span>Dock Inward (Tab 14)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => openModal('warehouse_wall_poster')}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Printer size={12} /> <span>Wall QR Poster</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>
        </div>

      </div>

      {/* 📦 SmartKit™ 5-Box Staging Bay */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-purple">KNOCK-DOWN COMPONENT DEFENSE</span>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>SmartKit™ 5-Box Staging Bay ({selectedSku})</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Prevents partial delivery disasters. All 5 component cartons must be verified before vehicle gatepass is issued.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className={`badge ${isAllStaged ? 'badge-emerald' : 'badge-amber'}`} style={{ padding: '6px 12px', fontSize: '12px' }}>
              {stagedCount}/5 BOXES STAGED {isAllStaged ? '✓' : '⚠️'}
            </span>
            <button className="btn-emerald" onClick={runAllBoxScan}>
              <Sparkles size={14} /> ⚡ 1-Click 5-Box Scan Sweep
            </button>
          </div>
        </div>

        {/* 5-Box Component Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '14px' }}>
          {smartKitBoxes.map((box) => (
            <div 
              key={box.Box_ID} 
              style={{
                background: '#030712',
                border: box.Status === 'VERIFIED_STAGED' ? '1.5px solid var(--accent-emerald)' : '1.5px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)', fontWeight: '700' }}>{box.Box_ID}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{box.Weight_KG}</span>
                </div>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>{box.Component_Name}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>Barcode: <b>{box.Barcode}</b></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                <span className={`badge ${box.Status === 'VERIFIED_STAGED' ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '9.5px' }}>
                  {box.Status === 'VERIFIED_STAGED' ? 'STAGED ✓' : 'MISSING ✕'}
                </span>
                {box.Status !== 'VERIFIED_STAGED' && (
                  <button className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '3px 8px' }} onClick={() => verifySmartKitBox(box.Box_ID)}>
                    Verify Box
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🏷️ 115-SKU SafeLock Stock Matrix */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>115-SKU SafeLock Inventory Defense Matrix</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Atomic warehouse reservation preventing double-selling</span>
          </div>

          {/* Customer Spotlight & Search & Category Filter */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <CustomerOrderSearchSelector
              selectedOrderId={selectedCustomerFilter === 'ALL' ? '' : selectedCustomerFilter}
              onSelectOrder={(orderId) => setSelectedCustomerFilter(orderId || 'ALL')}
              placeholder="🔍 Spotlight Customer / Order..."
              allLabel="All Inventory (115 Models)"
              compact={true}
            />

            <input 
              placeholder="🔍 Search SKU or Model..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 12px', color: '#FFFFFF', fontSize: '11.5px', outline: 'none' }}
            />
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 10px', color: '#FFFFFF', fontSize: '11.5px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Living Room">Living Room</option>
              <option value="Dining & Study">Dining & Study</option>
              <option value="Office">Office & Commercial</option>
            </select>
          </div>
        </div>

        {/* Inventory Table with Live Dial Steppers */}
        <div className="data-table-wrapper">
          <table className="luxury-table sheets-grid">
            <thead>
              <tr>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th>SKU Code</th>
                <th>Furniture Model</th>
                <th>Category</th>
                <th>Warehouse Bay</th>
                <th style={{ textAlign: 'right' }}>Unit Cost (₹)</th>
                <th style={{ textAlign: 'center' }}>Warehouse Avail</th>
                <th style={{ textAlign: 'center' }}>Reserved SafeLock</th>
                <th style={{ textAlign: 'center' }}>Reorder Status</th>
                <th style={{ textAlign: 'center' }}>Rapid Adjust Stepper</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, idx) => (
                <tr key={item.SKU}>
                  <td className="row-num" style={{ textAlign: 'center', color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: '10.5px' }}>
                    {idx + 1}
                  </td>
                  {/* SKU Code — Protected PK */}
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)' }}>{item.SKU}</td>
                  {/* Product Name — Editable */}
                  <EditableCell
                    value={item.Product_Name} field="Product_Name" rowIdx={idx}
                    pkVal={item.SKU} isProtected={false}
                    style={{ padding: '8px 10px' }}
                    {...cellEdit}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '800', color: '#FFFFFF' }}>{item.Product_Name}</span>
                      {floorDisplaySkus.includes(item.SKU) && (
                        <span className="badge badge-gold" style={{ fontSize: '9px', padding: '2px 6px' }}>
                          🏷️ FLOOR DISPLAY (-15%)
                        </span>
                      )}
                    </div>
                  </EditableCell>
                  {/* Category — Editable */}
                  <EditableCell
                    value={item.Category} field="Category" rowIdx={idx}
                    pkVal={item.SKU} isProtected={false}
                    style={{ padding: '8px 10px', color: '#FFFFFF' }}
                    {...cellEdit}
                  />
                  {/* Bay — Editable */}
                  <EditableCell
                    value={item.Bay} field="Bay" rowIdx={idx}
                    pkVal={item.SKU} isProtected={false}
                    style={{ padding: '8px 10px', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}
                    {...cellEdit}
                  />
                  {/* Unit Cost — Editable Numeric */}
                  <EditableCell
                    value={item.Unit_Cost_INR} field="Unit_Cost_INR" rowIdx={idx}
                    pkVal={item.SKU} isProtected={false} numeric
                    style={{ padding: '8px 10px', textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}
                    {...cellEdit}
                  >
                    ₹{(Number(item.Unit_Cost_INR) || 0).toLocaleString()}
                  </EditableCell>
                  {/* Warehouse Qty — Editable */}
                  <EditableCell
                    value={item.Warehouse_Qty} field="Warehouse_Qty" rowIdx={idx}
                    pkVal={item.SKU} isProtected={false} numeric
                    style={{ textAlign: 'center', padding: '8px 10px' }}
                    {...cellEdit}
                  >
                    <strong style={{ fontSize: '15px', color: item.Warehouse_Qty > 1 ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontFamily: 'JetBrains Mono' }}>
                      {item.Warehouse_Qty} Units
                    </strong>
                  </EditableCell>

                  {/* Reserved SafeLock — Editable */}
                  <EditableCell
                    value={item.Reserved_SafeLock} field="Reserved_SafeLock" rowIdx={idx}
                    pkVal={item.SKU} isProtected={false} numeric
                    style={{ textAlign: 'center', padding: '8px 10px' }}
                    {...cellEdit}
                  >
                    <strong style={{ fontSize: '15px', color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>
                      {item.Reserved_SafeLock} Reserved
                    </strong>
                  </EditableCell>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${item.Reorder_Status === 'HEALTHY' ? 'badge-emerald' : 'badge-rose'}`}>
                      {item.Reorder_Status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button className="btn-ghost-edit" style={{ padding: '3px 8px' }} onClick={() => adjustStock(item.SKU, -1, 0, "Floor sale decrement")}>
                        <Minus size={12} />
                      </button>
                      <button className="btn-ghost-edit" style={{ padding: '3px 8px' }} onClick={() => adjustStock(item.SKU, 1, 0, "Warehouse receipt increment")}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button className="btn-luxury-gold" style={{ fontSize: '10.5px', padding: '3px 6px' }} onClick={() => openModal('tier_pricing', { sku: item.SKU })}>
                        🏷️ 3-Tier
                      </button>
                      <button className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '3px 6px' }} onClick={() => toggleFloorDisplayTag(item.SKU)}>
                        {floorDisplaySkus.includes(item.SKU) ? 'Clear Tag' : 'Floor Tag'}
                      </button>
                      <button className="btn-ghost-edit" style={{ fontSize: '10.5px', padding: '3px 6px' }} onClick={() => openModal('stock_override', { sku: item.SKU })}>
                        Override ➔
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ⏳ TOKEN HOLD EXPIRY & POLICY CONFIG MODAL */}
      {showConfigModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: '440px', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--accent-gold-light)' }}>⏳ Token Hold Expiry Policy</h3>
              <button className="btn-close-modal" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
              <p style={{ fontSize: '12.5px', color: '#CBD5E1' }}>
                Set automatic stock release timeframe if customer fails to pay remaining 50% doorstep balance:
              </p>
              <div className="form-field">
                <label>Select Holding Period</label>
                <select value={tokenHoldHours} onChange={e => setTokenHoldHours(Number(e.target.value))}>
                  <option value={48}>48 Hours (2 Days) - Strict Festive Policy</option>
                  <option value={72}>72 Hours (3 Days) - Standard Showroom Policy</option>
                  <option value={120}>120 Hours (5 Days) - VIP Architect Referral</option>
                  <option value={168}>168 Hours (7 Days) - Maximum Wedding Suite Lock</option>
                </select>
              </div>
            </div>
            <button 
              className="btn-luxury-gold" 
              onClick={async () => { 
                setShowConfigModal(false); 
                const res = await dispatchWebhookAction('UPDATE_TOKEN_HOLD_POLICY', { token_hold_hours: tokenHoldHours });
                if (res && res.success) {
                  showToast(`⏳ Token Hold Expiry updated to ${tokenHoldHours} hours (${tokenHoldHours / 24} days) in Cloudflare D1!`, true);
                } else {
                  showToast(`⏳ Token Policy saved locally (${tokenHoldHours}h)`, false);
                }
              }} 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Check size={16} /> Save Token Policy & Sync
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
