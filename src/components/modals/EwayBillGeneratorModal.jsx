// ==============================================================================
// OmniBuild OS™ — Official E-Way Bill NIC Payload Generator Modal (India-Compliance Benchmark)
// Section 68 CGST Compliance for High-Ticket Furniture Transport (> ₹50,000)
// ==============================================================================

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Truck, 
  FileText, 
  Copy, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShieldCheck,
  Building2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { 
  generateEWayBillJson, 
  INDIAN_STATES 
} from '../../services/enterpriseErpService';
import { playScanBeep, playSuccessChime } from '../../utils/audioUtils';

export function EwayBillGeneratorModal({ isOpen, onClose, invoiceData = {} }) {
  const { showToast } = useStore();

  const [transporterName, setTransporterName] = useState('Tophan Gouda Fleet Services');
  const [transporterId, setTransporterId] = useState('21TRP9988X1ZQ');
  const [vehicleNo, setVehicleNo] = useState('OD-18-B-4491');
  const [distanceKm, setDistanceKm] = useState(15);
  const [destinationPincode, setDestinationPincode] = useState('765001');
  const [destStateCode, setDestStateCode] = useState('21');

  const totalGross = invoiceData.totalAmount || 68000;
  const docNumber = invoiceData.docNumber || 'SVF/INV/26-27/001';
  const customerName = invoiceData.customerName || 'Dr. Subhashish Jena';
  const customerAddress = invoiceData.customerAddress || 'Gayatri Nagar Villa, Rayagada';

  const ewayResult = generateEWayBillJson({
    docNumber,
    customerName,
    customerAddress,
    destinationPincode,
    destinationStateCode: destStateCode,
    totalGross,
    transporterName,
    transporterId,
    vehicleNumber: vehicleNo,
    approxDistanceKm: distanceKm,
    items: invoiceData.items || []
  });

  if (!isOpen) return null;

  const jsonString = JSON.stringify(ewayResult.payload, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    playSuccessChime();
    showToast('📋 Official NIC E-Way Bill JSON copied to clipboard!', true);
  };

  const handleDownloadJson = () => {
    playScanBeep();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EWAY_BILL_${docNumber.replace(/[\/\\]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('📥 E-Way Bill JSON downloaded for government portal upload!', true);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel glass-card" style={{ maxWidth: '840px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.25)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🚚</span>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Official NIC E-Way Bill Payload Generator
              </h2>
              <span className="badge badge-blue" style={{ fontSize: '10px' }}>India-Compliance Benchmark</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Statutory Vehicle Tata Ace Dispatch & Government Portal Interoperability
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Threshold Alert Banner */}
        <div style={{ 
          background: ewayResult.isMandatory ? 'rgba(245,158,11,0.12)' : 'rgba(14,165,233,0.1)', 
          border: `1px solid ${ewayResult.isMandatory ? '#F59E0B' : '#0EA5E9'}`, 
          borderRadius: '10px', 
          padding: '12px 16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px' 
        }}>
          <div>
            <div style={{ fontWeight: '800', color: ewayResult.isMandatory ? '#F59E0B' : '#0EA5E9', fontSize: '12.5px' }}>
              {ewayResult.thresholdMessage}
            </div>
            <div style={{ fontSize: '11px', color: '#CBD5E1', marginTop: '2px' }}>
              Consignment Value: <strong style={{ color: '#FFFFFF' }}>₹{totalGross.toLocaleString()}</strong> • Invoice: <strong style={{ color: 'var(--accent-gold-light)' }}>{docNumber}</strong>
            </div>
          </div>
          <span className={`badge ${ewayResult.isMandatory ? 'badge-gold' : 'badge-blue'}`}>
            {ewayResult.isMandatory ? 'Mandatory (₹50k+)' : 'Standard'}
          </span>
        </div>

        {/* Vehicle & Transporter Form */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          
          <div className="glass-panel" style={{ padding: '12px' }}>
            <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Vehicle Number (Part-B)</label>
            <input 
              type="text" 
              value={vehicleNo} 
              onChange={e => setVehicleNo(e.target.value)} 
              className="luxury-input" 
              style={{ width: '100%', fontFamily: 'JetBrains Mono', fontWeight: '800' }}
            />
            <div style={{ fontSize: '9.5px', color: 'var(--accent-emerald)', marginTop: '2px' }}>
              Tophan Gouda (Tata Ace 1.5T)
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '12px' }}>
            <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Approx Distance (KM)</label>
            <input 
              type="number" 
              value={distanceKm} 
              onChange={e => setDistanceKm(Number(e.target.value))} 
              className="luxury-input" 
              style={{ width: '100%', fontFamily: 'JetBrains Mono', fontWeight: '800' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '12px' }}>
            <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Destination Pincode</label>
            <input 
              type="text" 
              value={destinationPincode} 
              onChange={e => setDestinationPincode(e.target.value)} 
              className="luxury-input" 
              style={{ width: '100%', fontFamily: 'JetBrains Mono', fontWeight: '800' }}
            />
          </div>

          <div className="glass-panel" style={{ padding: '12px' }}>
            <label style={{ fontSize: '10.5px', color: '#94A3B8' }}>Destination State</label>
            <select 
              value={destStateCode} 
              onChange={e => setDestStateCode(e.target.value)} 
              className="luxury-input" 
              style={{ width: '100%' }}
            >
              {INDIAN_STATES.map(s => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

        </div>

        {/* JSON Code Viewer */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
              Official NIC JSON Schema Payload:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleCopyJson} 
                className="btn-ghost-edit" 
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Copy size={13} /> Copy JSON
              </button>
              <button 
                type="button" 
                onClick={handleDownloadJson} 
                className="btn-ghost-edit" 
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Download size={13} /> Download .json
              </button>
            </div>
          </div>

          <pre style={{ 
            background: '#030712', 
            border: '1px solid rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            padding: '12px', 
            fontSize: '11px', 
            fontFamily: 'JetBrains Mono, monospace', 
            color: '#A5F3FC', 
            maxHeight: '260px', 
            overflowY: 'auto' 
          }}>
            {jsonString}
          </pre>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
          <a 
            href="https://ewaybillgst.gov.in" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn-ghost-edit"
            style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold-light)' }}
          >
            <ExternalLink size={13} /> Open Government E-Way Bill Portal (ewaybillgst.gov.in)
          </a>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn-ghost-edit" onClick={onClose}>
              Close
            </button>
            <button 
              type="button" 
              className="btn-luxury-gold" 
              onClick={handleCopyJson}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
            >
              <CheckCircle2 size={15} />
              <span>Copy Ready-To-Upload JSON</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
