import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Factory, 
  X, 
  Check, 
  DollarSign, 
  Landmark, 
  CreditCard, 
  FileText, 
  Printer, 
  Building2, 
  Truck, 
  Send,
  ShieldCheck,
  Percent,
  Clock,
  Phone
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

/**
 * 💸 1. FACTORY ADVANCE PAYMENT VOUCHER MODAL
 */
export function FactoryPaymentVoucherModal({ isOpen, onClose, po = null }) {
  const { showToast } = useStore();

  const [paymentType, setPaymentType] = useState('30_ADVANCE_TOKEN');
  const [paymentMode, setPaymentMode] = useState('RTGS_BANK_TRANSFER');
  const [amount, setAmount] = useState(po ? Math.round((po.total_value || 100000) * 0.3) : 50000);
  const [utrRef, setUtrRef] = useState(`UTR-SBI-${Math.floor(100000000 + Math.random() * 900000000)}`);
  const [bankAccount, setBankAccount] = useState('HDFC Bank — Current A/c 50200012345678 (IFSC: HDFC0001234)');
  const [authorizedBy, setAuthorizedBy] = useState('Naresh & Naren (Store Directors)');
  const [remarks, setRemarks] = useState('30% Advance Token against Official PO');

  if (!isOpen || !po) return null;

  const handleRecordPayment = () => {
    const voucherId = `VOUCH-EXP-${Math.floor(1000 + Math.random() * 9000)}`;

    // Webhook dispatch to Google Sheets Payments_Log & Bank_Transactions_Log
    dispatchWebhookAction("RECORD_FACTORY_PAYMENT_VOUCHER", {
      voucher_id: voucherId,
      payment_type: "FACTORY_EXPENSE_DEBIT",
      supplier: po.supplier,
      po_id: po.po_id,
      amount: Number(amount),
      payment_mode: paymentMode,
      utr_ref: utrRef,
      authorized_by: authorizedBy,
      remarks: remarks,
      timestamp: new Date().toISOString()
    });

    dispatchWebhookAction("LOG_BANK_TRANSACTION", {
      transaction_id: `TXN-BNK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      flow_type: "OUTWARD_DEBIT",
      bank_account: "SBI Current A/c (***9182)",
      payment_mode: paymentMode === "RTGS_BANK_TRANSFER" ? "RTGS" : paymentMode,
      utr_number: utrRef,
      party_name: po.supplier,
      amount: Number(amount),
      linked_entity_type: "FACTORY_PO",
      linked_id: po.po_id,
      reconciliation_status: "VERIFIED_AND_MATCHED",
      notes: `${remarks} for Factory PO #${po.po_id}`,
      logged_by: authorizedBy
    });

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`💸 Vendor Advance Voucher #${voucherId} (₹${Number(amount).toLocaleString()}) recorded & synced to Payments_Log!`, true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '580px', background: '#0B132B', border: '2px solid var(--accent-emerald)' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-emerald)' }}>
              <Landmark size={20} color="var(--accent-emerald)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Record Factory Payment Voucher
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Debit voucher for #{po.po_id} — {po.supplier.split(',')[0]}
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
          
          <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total PO Value</div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>₹{Number(po.total_value).toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Beneficiary Vendor</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>{po.supplier.split('—')[0]}</div>
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>Payment Stage</label>
              <select value={paymentType} onChange={e => {
                setPaymentType(e.target.value);
                if (e.target.value === '30_ADVANCE_TOKEN') setAmount(Math.round(po.total_value * 0.3));
                else if (e.target.value === '70_LR_DISPATCH') setAmount(Math.round(po.total_value * 0.7));
                else if (e.target.value === '100_FULL_SETTLEMENT') setAmount(po.total_value);
              }}>
                <option value="30_ADVANCE_TOKEN">30% Advance Booking Token</option>
                <option value="70_LR_DISPATCH">70% Balance against LR Bilty</option>
                <option value="100_FULL_SETTLEMENT">100% Full RTGS Advance</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Payment Amount (₹)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field">
              <label style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>Payment Mode</label>
              <select value={paymentMode} onChange={e => setPaymentMode(e.target.value)}>
                <option value="RTGS_BANK_TRANSFER">RTGS / NEFT Bank Transfer</option>
                <option value="SHOWROOM_MERCHANT_UPI">Showroom Merchant UPI (Auto-VPA)</option>
                <option value="DIRECT_COMPANY_CHEQUE">Godrej Showroom Account Cheque</option>
              </select>
            </div>

            <div className="form-field">
              <label style={{ fontSize: '11px', color: '#CBD5E1' }}>Bank UTR / Transaction Ref</label>
              <input type="text" value={utrRef} onChange={e => setUtrRef(e.target.value)} />
            </div>
          </div>

          <div className="form-field">
            <label style={{ fontSize: '11px', color: '#94A3B8' }}>Authorized Signatory</label>
            <input type="text" value={authorizedBy} onChange={e => setAuthorizedBy(e.target.value)} />
          </div>

        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(16,185,129,0.2)', paddingTop: '12px' }}>
          <button className="btn-ghost-edit" onClick={onClose}>Cancel</button>
          <button className="btn-emerald" onClick={handleRecordPayment} style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> Confirm & Log Voucher to Sheets
          </button>
        </div>

      </div>
    </div>
  );
}

/**
 * ⚙️ 2. VENDOR SOURCING & PRICE MATRIX MODAL
 */
export function VendorSourcingModal({ isOpen, onClose }) {
  const { showToast } = useStore();

  const [vendors, setVendors] = useState([
    {
      id: "VEND-001",
      name: "Godrej Khalapur Main Plant (MH)",
      location: "Khalapur, Maharashtra",
      gstin: "27AAACG0534B1Z9",
      phone: "+91 93905 53301",
      specialty: "Solid Teak Beds & Modular Wardrobes",
      discount: 35,
      leadDays: 14,
      hub: "VRL Logistics Express"
    },
    {
      id: "VEND-002",
      name: "Godrej Chennai Upholstery Plant (TN)",
      location: "Ambattur, Chennai",
      gstin: "33AAACG0534B1Z5",
      phone: "+91 94440 12345",
      specialty: "Ergonomic Sofas, Recliners & Loungers",
      discount: 38,
      leadDays: 10,
      hub: "SafeXpress Supply Chain"
    },
    {
      id: "VEND-003",
      name: "CenturyPly ProModular Hub, Cuttack (OD)",
      location: "Choudwar, Cuttack",
      gstin: "21CCCC2222C3Z3",
      phone: "+91 94370 67890",
      specialty: "High-Gloss Modular Kitchens & Tables",
      discount: 30,
      leadDays: 5,
      hub: "ARC Roadways Heavy Freight"
    }
  ]);

  if (!isOpen) return null;

  const handleSaveVendorMatrix = () => {
    dispatchWebhookAction("SAVE_VENDOR_SOURCING_MATRIX", {
      vendors_count: vendors.length,
      vendors_json: JSON.stringify(vendors),
      timestamp: new Date().toISOString()
    });

    playSuccessChime();
    showToast("⚙️ Vendor Sourcing Matrix & Wholesale Discounts synced to Google Sheets!", true);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '780px', width: '90vw', background: '#0B132B', border: '2px solid var(--accent-gold)' }}>
        
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)' }}>
              <Building2 size={20} color="var(--accent-gold-light)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Factory Sourcing & Vendor Master Matrix
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Manage wholesale discount tiers, transit lead days, and preferred transporters
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0', maxHeight: '65vh', overflowY: 'auto' }}>
          {vendors.map((vend, idx) => (
            <div key={vend.id} style={{ background: '#030712', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontSize: '13px' }}>
                  {vend.name}
                </div>
                <span className="badge badge-emerald">GSTIN: {vend.gstin}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '11.5px' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>Specialty Category</label>
                  <div style={{ color: '#FFFFFF', fontWeight: '600' }}>{vend.specialty}</div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>Wholesale Margin</label>
                  <div style={{ color: 'var(--accent-green)', fontWeight: '800' }}>{vend.discount}% Off MRP</div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>Avg Transit Lead Time</label>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: '700' }}>{vend.leadDays} Days Transit</div>
                </div>

                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>Transporter Hub</label>
                  <div style={{ color: '#E2E8F0' }}>{vend.hub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '12px' }}>
          <button className="btn-ghost-edit" onClick={onClose}>Close</button>
          <button className="btn-luxury-gold" onClick={handleSaveVendorMatrix} style={{ padding: '8px 22px' }}>
            <Check size={16} /> Save Sourcing Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
