import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Truck, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Layers, 
  Send,
  X
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti, playSafeLockSound } from '../../utils/audioUtils';
import { generateSmartKitBoxesForProduct } from '../../utils/smartKitDecomposer';
import { dispatchWebhookAction } from '../../services/webhookService';

export function SmartKitStagingModal({ isOpen, onClose, order }) {
  const { updateOrderStatus, showToast, drivers } = useStore();
  const [boxes, setBoxes] = useState([]);
  const [isLaserSweeping, setIsLaserSweeping] = useState(false);
  const [assignedDriver, setAssignedDriver] = useState('DRV-01');
  const [isGatepassIssued, setIsGatepassIssued] = useState(false);

  useEffect(() => {
    if (order) {
      const generated = generateSmartKitBoxesForProduct(order.Ordered_SKU || order.Item_Names || order.Product_Name, order.Order_ID);
      const isAlreadyStaged = (order.SafeLock_Status || '').includes('STAGED') || (order.SafeLock_Status || '').includes('TRANSIT') || (order.SafeLock_Status || '').includes('DELIVERED');
      
      if (isAlreadyStaged) {
        setBoxes(generated.map(b => ({ ...b, Status: 'VERIFIED_STAGED' })));
        setIsGatepassIssued(true);
      } else {
        setBoxes(generated.map((b, idx) => idx === 0 ? { ...b, Status: 'VERIFIED_STAGED' } : { ...b, Status: 'PENDING' }));
        setIsGatepassIssued(false);
      }
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const stagedCount = boxes.filter(b => b.Status === 'VERIFIED_STAGED').length;
  const isAllStaged = boxes.length > 0 && stagedCount === boxes.length;

  const handleVerifySingleBox = (boxId) => {
    playScanBeep();
    setBoxes(prev => prev.map(b => b.Box_ID === boxId ? { ...b, Status: 'VERIFIED_STAGED', Staged_By: 'Dock Staff' } : b));
    showToast(`📦 Box ${boxId} Verified & Staged at Loading Bay!`);
  };

  const handleVerifyAllAndIssueGatepass = () => {
    setIsLaserSweeping(true);
    playScanBeep();
    showToast(`🔍 Running Laser Sweep Staging Verification on ${boxes.length} Cartons...`, true);

    setTimeout(() => {
      setBoxes(prev => prev.map(b => ({ ...b, Status: 'VERIFIED_STAGED', Staged_By: 'Dock Staff' })));
      setIsGatepassIssued(true);
      setIsLaserSweeping(false);
      playSuccessChime();
      playSafeLockSound();
      triggerGoldenConfetti();

      const newStatus = `${boxes.length}/${boxes.length} STAGED (DOCK GATEPASS ISSUED ✓)`;
      updateOrderStatus(order.Order_ID, newStatus);

      // Dispatch Webhook to Google Sheets & AppSheet
      dispatchWebhookAction('SMARTKIT_BOX_STAGED', {
        bot_id: 'BOT-03',
        order_id: order.Order_ID,
        customer_name: order.Customer_Name,
        product: order.Ordered_SKU,
        total_boxes: boxes.length,
        staged_count: boxes.length,
        driver_assigned: drivers.find(d => d.Driver_ID === assignedDriver)?.Name || 'Tophan Gouda',
        gatepass_status: 'ISSUED_CLEAR_FOR_LOADING'
      });

      showToast(`🔒 Gatepass Issued for Order #${order.Order_ID}! Ready for Delivery Loading at Dock 1.`, true);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content glass-panel" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '820px', 
          width: '94%', 
          maxHeight: '90vh', 
          overflowY: 'auto',
          border: '1.5px solid var(--accent-purple)',
          boxShadow: '0 20px 60px rgba(168, 85, 247, 0.25)',
          padding: '24px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              📦
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-purple" style={{ fontSize: '10px' }}>KNOCK-DOWN COMPONENT DEFENSE</span>
                <span className="badge badge-cyan" style={{ fontSize: '10px' }}>ORDER #{order.Order_ID}</span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
                SmartKit™ Staging Bay & Dock Gatepass
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Item: <b style={{ color: 'var(--accent-gold-light)' }}>{order.Ordered_SKU || order.Item_Names}</b> • Client: <b style={{ color: '#FFFFFF' }}>{order.Customer_Name}</b>
              </p>
            </div>
          </div>
          <button className="btn-ghost-edit" onClick={onClose} style={{ padding: '6px 10px', fontSize: '14px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Order & Gatepass Status Banner */}
        <div style={{ background: '#030712', border: isAllStaged ? '1.5px solid var(--accent-emerald)' : '1.5px solid var(--accent-amber)', borderRadius: '12px', padding: '14px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '800' }}>
              Dock Staging Security Status
            </div>
            <div style={{ fontSize: '15px', fontWeight: '900', color: isAllStaged ? 'var(--accent-emerald)' : 'var(--accent-amber)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isAllStaged ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{isAllStaged ? `ALL ${boxes.length}/${boxes.length} CARTONS VERIFIED — GATEPASS UNLOCKED` : `${stagedCount}/${boxes.length} CARTONS STAGED — GATEPASS LOCKED`}</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              📍 Delivery Destination: {order.Project_Address || 'Rayagada District'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={isAllStaged ? "btn-emerald" : "btn-luxury-gold"}
              onClick={handleVerifyAllAndIssueGatepass}
              style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800' }}
            >
              <Sparkles size={14} /> {isAllStaged ? "⚡ Re-Issue Dock Gatepass" : `⚡ [Verify All & Issue Dock Gatepass]`}
            </button>
          </div>
        </div>

        {/* Dynamic Component Cartons Grid */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>FACTORY FLAT-PACK CARTONS ({boxes.length} UNITS REQUIRED)</span>
            <span style={{ color: 'var(--accent-cyan)' }}>Total Weight: ~{boxes.reduce((s, b) => s + (parseFloat(b.Weight_KG) || 0), 0).toFixed(1)} KG</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
            {boxes.map((box, idx) => {
              const isStaged = box.Status === 'VERIFIED_STAGED';
              return (
                <div 
                  key={box.Box_ID} 
                  style={{
                    background: '#0B132B',
                    border: isStaged ? '1.5px solid var(--accent-emerald)' : '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '8px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10.5px', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)', fontWeight: '800' }}>
                        {box.Box_ID}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        ⚖️ {box.Weight_KG}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>
                      {box.Component_Name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Barcode: <b style={{ color: 'var(--accent-gold)' }}>{box.Barcode}</b>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <span className={`badge ${isStaged ? 'badge-emerald' : 'badge-amber'}`} style={{ fontSize: '9px' }}>
                      {isStaged ? 'STAGED ✓' : 'PENDING ⚠️'}
                    </span>
                    {!isStaged ? (
                      <button 
                        className="btn-ghost-edit" 
                        style={{ fontSize: '10px', padding: '3px 8px', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }} 
                        onClick={() => handleVerifySingleBox(box.Box_ID)}
                      >
                        ✓ Verify
                      </button>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                        Verified by Staff
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Driver Assignment & Gatepass Dispatch Footer */}
        <div style={{ background: '#030712', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={20} color="var(--accent-cyan)" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF' }}>
                Assign Delivery Vehicle & Driver:
              </div>
              <select 
                value={assignedDriver}
                onChange={e => setAssignedDriver(e.target.value)}
                style={{
                  background: '#0B132B',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: '700',
                  marginTop: '4px'
                }}
              >
                {drivers.map(d => (
                  <option key={d.Driver_ID} value={d.Driver_ID}>
                    {d.Name} — {d.Vehicle} ({d.Capacity_KG})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-ghost-edit" 
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={() => {
                window.print();
              }}
            >
              <Printer size={13} /> Print Gatepass Slip
            </button>
            <button 
              className="btn-luxury-gold" 
              style={{ fontSize: '11.5px', padding: '6px 14px' }}
              onClick={() => {
                if (!isAllStaged) {
                  handleVerifyAllAndIssueGatepass();
                }
                onClose();
              }}
            >
              <span>Done & Close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
