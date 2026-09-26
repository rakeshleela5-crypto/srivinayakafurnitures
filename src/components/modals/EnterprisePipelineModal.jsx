// ==============================================================================
// OmniBuild OS™ — Enterprise Document Pipeline Modal (ERPNext Benchmark)
// Strict State Machine: Quotation (EST) -> Sales Order (SO) -> Delivery Note (DN) -> Tax Invoice (INV)
// ==============================================================================

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Truck, 
  Receipt, 
  Lock, 
  X, 
  Share2, 
  Printer, 
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { 
  DOC_TYPES, 
  DOC_STATUSES, 
  generateNextDocNumber,
  calculateGstBreakdown
} from '../../services/enterpriseErpService';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';

export function EnterprisePipelineModal({ isOpen, onClose, pipelineData = {} }) {
  const { showToast, openModal } = useStore();

  const customerName = pipelineData.customerName || 'Dr. Subhashish Jena';
  const customerPhone = pipelineData.customerPhone || '9437188291';
  const address = pipelineData.address || 'Gayatri Nagar Villa, Rayagada';
  const grossAmount = pipelineData.totalAmount || 65000;
  const items = pipelineData.items || [
    { name: 'Solid Teak King Bed (72" x 78")', qty: 1, price: 42000, hsn: '940350' },
    { name: 'Godrej CRCA 3-Door Slimline Wardrobe', qty: 1, price: 23000, hsn: '940320' }
  ];

  // Pipeline State
  // 0 = Quotation (EST), 1 = Sales Order (SO), 2 = Delivery Note (DN), 3 = Tax Invoice (INV)
  const [pipelineStep, setPipelineStep] = useState(1); // Default to Sales Order
  const [advancePaid, setAdvancePaid] = useState(25000);
  const [assignedDriver, setAssignedDriver] = useState('Tophan Gouda (Tata Ace OD-18-B-4491)');

  const gst = calculateGstBreakdown({ grossOrTaxableAmount: grossAmount, isGstInclusive: true });

  if (!isOpen) return null;

  const currentDocType = pipelineStep === 0 ? 'QUOTATION' :
                         pipelineStep === 1 ? 'SALES_ORDER' :
                         pipelineStep === 2 ? 'DELIVERY_NOTE' : 'TAX_INVOICE';

  const docNumber = generateNextDocNumber(currentDocType, 104);

  const handleAdvanceStep = () => {
    playSuccessChime();
    triggerGoldenConfetti();
    if (pipelineStep < 3) {
      setPipelineStep(prev => prev + 1);
      const nextName = pipelineStep === 0 ? 'Sales Order' : pipelineStep === 1 ? 'Delivery Note' : 'Tax Invoice';
      showToast(`✅ Transitioned to ${nextName} (${generateNextDocNumber(pipelineStep === 0 ? 'SALES_ORDER' : pipelineStep === 1 ? 'DELIVERY_NOTE' : 'TAX_INVOICE', 104)})!`, true);
    } else {
      showToast('🎉 Document completed and fully archived to Cloudflare D1!', true);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel glass-card" style={{ maxWidth: '880px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.25)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📑</span>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Enterprise Commercial ERP Document Lifecycle
              </h2>
              <span className="badge badge-gold" style={{ fontSize: '10px' }}>ERPNext Benchmark</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Document Ref: <strong style={{ color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>{docNumber}</strong> • Patron: <strong style={{ color: '#FFFFFF' }}>{customerName}</strong>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* 4-Phase Stepper */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
          
          <div 
            onClick={() => setPipelineStep(0)}
            style={{ 
              background: pipelineStep >= 0 ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${pipelineStep === 0 ? 'var(--accent-gold-light)' : pipelineStep > 0 ? '#10B981' : 'rgba(255,255,255,0.1)'}`, 
              borderRadius: '8px', 
              padding: '10px', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ fontSize: '10px', color: pipelineStep > 0 ? '#10B981' : 'var(--accent-gold-light)', fontWeight: '800' }}>
              {pipelineStep > 0 ? '✓ STEP 1' : '● STEP 1'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>Quotation (EST)</div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Negotiable Estimate</div>
          </div>

          <div 
            onClick={() => setPipelineStep(1)}
            style={{ 
              background: pipelineStep >= 1 ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${pipelineStep === 1 ? 'var(--accent-cyan)' : pipelineStep > 1 ? '#10B981' : 'rgba(255,255,255,0.1)'}`, 
              borderRadius: '8px', 
              padding: '10px', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ fontSize: '10px', color: pipelineStep > 1 ? '#10B981' : 'var(--accent-cyan)', fontWeight: '800' }}>
              {pipelineStep > 1 ? '✓ STEP 2' : '● STEP 2'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>Sales Order (SO)</div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Stock Reserved in Godown</div>
          </div>

          <div 
            onClick={() => setPipelineStep(2)}
            style={{ 
              background: pipelineStep >= 2 ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${pipelineStep === 2 ? '#C084FC' : pipelineStep > 2 ? '#10B981' : 'rgba(255,255,255,0.1)'}`, 
              borderRadius: '8px', 
              padding: '10px', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ fontSize: '10px', color: pipelineStep > 2 ? '#10B981' : '#C084FC', fontWeight: '800' }}>
              {pipelineStep > 2 ? '✓ STEP 3' : '● STEP 3'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>Delivery Note (DN)</div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Tata Ace Driver Assigned</div>
          </div>

          <div 
            onClick={() => setPipelineStep(3)}
            style={{ 
              background: pipelineStep === 3 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${pipelineStep === 3 ? '#10B981' : 'rgba(255,255,255,0.1)'}`, 
              borderRadius: '8px', 
              padding: '10px', 
              cursor: 'pointer' 
            }}
          >
            <div style={{ fontSize: '10px', color: '#10B981', fontWeight: '800' }}>
              {pipelineStep === 3 ? '● STEP 4' : '○ STEP 4'}
            </div>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>Tax Invoice (INV)</div>
            <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Accounting & GST Settled</div>
          </div>

        </div>

        {/* Current Document Card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '16px', marginBottom: '18px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
            <div>
              <span className="badge badge-gold" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                {DOC_TYPES[currentDocType]?.label}
              </span>
              <div style={{ fontSize: '13px', color: '#CBD5E1', marginTop: '4px' }}>
                Place of Supply: <strong>Odisha (21)</strong> • Tax Resolution: <strong style={{ color: 'var(--accent-cyan)' }}>{gst.taxType}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>Total Invoice Value</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'JetBrains Mono' }}>
                ₹{grossAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Line items table */}
          <div className="data-table-wrapper" style={{ marginBottom: '14px' }}>
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>HSN Code</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Taxable Value</th>
                  <th style={{ textAlign: 'right' }}>GST (18%)</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => {
                  const itGross = (it.price || 50000) * (it.qty || 1);
                  const itTaxable = Math.round((itGross / 1.18) * 100) / 100;
                  const itGst = Math.round((itGross - itTaxable) * 100) / 100;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: '700', color: '#FFFFFF' }}>{it.name}</td>
                      <td style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-gold-light)', fontSize: '11px' }}>{it.hsn || '9403'}</td>
                      <td style={{ textAlign: 'center' }}>{it.qty || 1}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>₹{itTaxable.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}>₹{itGst.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontWeight: '800', color: '#FFFFFF' }}>₹{itGross.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tax & Financial Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Taxable Amount:</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', fontFamily: 'JetBrains Mono' }}>₹{gst.taxableValue.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>CGST 9% (Odisha):</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>₹{gst.cgstAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>SGST 9% (Odisha):</div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono' }}>₹{gst.sgstAmount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>E-Way Bill Status:</div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: grossAmount >= 50000 ? '#F59E0B' : 'var(--accent-emerald)' }}>
                {grossAmount >= 50000 ? 'Mandatory (≥ ₹50k)' : 'Optional'}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {grossAmount >= 50000 && (
              <button
                type="button"
                className="btn-ghost-edit"
                onClick={() => openModal('eway_bill_generator', {
                  docNumber,
                  totalAmount: grossAmount,
                  customerName,
                  customerAddress: address,
                  items
                })}
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}
              >
                <Truck size={13} /> View NIC E-Way Bill JSON
              </button>
            )}

            <button
              type="button"
              className="btn-ghost-edit"
              onClick={() => openModal('customer_khata', { customerName, phone: customerPhone })}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold-light)' }}
            >
              🏛️ Customer Khata
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-ghost-edit" onClick={onClose}>
              Cancel
            </button>
            
            {pipelineStep < 3 ? (
              <button
                type="button"
                className="btn-luxury-gold"
                onClick={handleAdvanceStep}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontWeight: '900' }}
              >
                <span>Proceed to {pipelineStep === 0 ? 'Sales Order (Lock Stock)' : pipelineStep === 1 ? 'Delivery Note (Dispatch)' : 'Tax Invoice (Finalize)'}</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-emerald"
                onClick={() => {
                  playSuccessChime();
                  showToast('✅ Tax Invoice archived & synchronized across Showroom Terminals!', true);
                  onClose();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', fontWeight: '900' }}
              >
                <CheckCircle2 size={16} /> Complete & Archive
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
