// ==============================================================================
// OmniBuild OS™ — Enterprise Customer Khata & Account Statement Modal (Crater Benchmark)
// Manages customer credit ledgers, milestone installments, and aging balances
// ==============================================================================

import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  BookOpen, 
  User, 
  Phone, 
  Send, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  Plus, 
  X, 
  ArrowUpRight,
  TrendingDown,
  Building2,
  Share2
} from 'lucide-react';
import { 
  SAMPLE_CUSTOMER_KHATAS, 
  generateKhataPaymentReminderText 
} from '../../services/enterpriseErpService';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { EditableCell } from '../common/InlineCellRenderer';
import { useInlineCellEdit } from '../../hooks/useInlineCellEdit';

export function CustomerKhataLedgerModal({ isOpen, onClose, customerData = {} }) {
  const { showToast } = useStore();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customerData.customerId || 'CUST-001');
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayAmount, setNewPayAmount] = useState('');
  const [newPayMode, setNewPayMode] = useState('Dynamic UPI QR');
  const [newPayRef, setNewPayRef] = useState('');

  const currentKhata = SAMPLE_CUSTOMER_KHATAS.find(k => k.customerId === selectedCustomerId) || SAMPLE_CUSTOMER_KHATAS[0];
  const [khataOrders, setKhataOrders] = useState(currentKhata.orders);

  React.useEffect(() => {
    setKhataOrders(currentKhata.orders);
  }, [selectedCustomerId]);

  const cellEdit = useInlineCellEdit({
    table: 'orders',
    pkField: 'orderId',
    readOnly: ['orderId', 'date'],
    setRows: setKhataOrders,
    showToast,
    onSaved: (idx, field, val) => {
      if (currentKhata.orders[idx]) {
        currentKhata.orders[idx][field] = val;
        const tot = currentKhata.orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
        const pd = currentKhata.orders.reduce((s, o) => s + (Number(o.paid) || 0), 0);
        currentKhata.totalPaid = pd;
        currentKhata.outstandingBalance = Math.max(0, tot - pd);
      }
    }
  });

  if (!isOpen) return null;

  const handleSendReminder = () => {
    playScanBeep();
    const text = generateKhataPaymentReminderText({
      customerName: currentKhata.customerName,
      outstandingBalance: currentKhata.outstandingBalance,
      orderRef: currentKhata.orders[currentKhata.orders.length - 1]?.orderId || 'ORD-9104'
    });

    const url = `https://api.whatsapp.com/send?phone=91${currentKhata.phone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast(`📲 Statement & UPI Payment Reminder opened on WhatsApp for ${currentKhata.customerName}!`, true);
  };

  const handleRecordPayment = () => {
    const amt = Number(newPayAmount);
    if (!amt || amt <= 0) {
      showToast('⚠️ Please enter a valid payment amount', false);
      return;
    }

    playSuccessChime();
    triggerGoldenConfetti();
    currentKhata.totalPaid += amt;
    currentKhata.outstandingBalance = Math.max(0, currentKhata.outstandingBalance - amt);
    currentKhata.lastPaymentDate = new Date().toISOString().split('T')[0];

    showToast(`✅ Payment of ₹${amt.toLocaleString()} recorded via ${newPayMode}! Updated Outstanding: ₹${currentKhata.outstandingBalance.toLocaleString()}`, true);
    setShowAddPayment(false);
    setNewPayAmount('');
    setNewPayRef('');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-panel glass-card" style={{ maxWidth: '880px', width: '95%', maxHeight: '92vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.25)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🏛️</span>
              <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                Enterprise Customer Khata & Account Statement
              </h2>
              <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Crater Ledger Benchmark</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Patron Credit Lifecycle, Milestone Receivables & Statement of Account
            </div>
          </div>
          <button className="btn-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Customer Selector Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '14px' }}>
          {SAMPLE_CUSTOMER_KHATAS.map(c => (
            <button
              key={c.customerId}
              type="button"
              onClick={() => setSelectedCustomerId(c.customerId)}
              className={`btn-ghost-edit ${selectedCustomerId === c.customerId ? 'badge-gold' : ''}`}
              style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              <strong>{c.customerName}</strong> ({c.phone})
            </button>
          ))}
        </div>

        {/* 3 Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          
          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Total Billed Value</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
              ₹{currentKhata.totalBilled.toLocaleString()}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Credit Limit: ₹{currentKhata.creditLimit.toLocaleString()}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Total Settled / Paid</div>
            <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-emerald)', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
              ₹{currentKhata.totalPaid.toLocaleString()}
            </div>
            <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>
              Last Settled: {currentKhata.lastPaymentDate}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px', border: '1px solid rgba(244,63,94,0.35)', background: 'rgba(244,63,94,0.06)' }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-rose)', textTransform: 'uppercase', fontWeight: '800' }}>Current Outstanding Due</div>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', fontFamily: 'JetBrains Mono', marginTop: '4px' }}>
              ₹{currentKhata.outstandingBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '10.5px', color: currentKhata.agingBucket === 'CURRENT' ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontWeight: '700', marginTop: '2px' }}>
              Aging: {currentKhata.agingBucket.replace('_', ' ')}
            </div>
          </div>

        </div>

        {/* Milestone Installment Tracker Banner */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px 18px', marginBottom: '18px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '10px' }}>
            ⏳ High-Ticket Furniture Milestone Payment Structure:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid #10B981', padding: '8px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10.5px', color: '#10B981', fontWeight: '800' }}>MILESTONE 1: BOOKING</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', marginTop: '2px' }}>20% Token Advance</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Locks Godown Stock & Batch</div>
            </div>

            <div style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid #0EA5E9', padding: '8px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10.5px', color: '#0EA5E9', fontWeight: '800' }}>MILESTONE 2: DISPATCH</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', marginTop: '2px' }}>60% Gate Pass Clearance</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Before Tata Ace Vehicle Departs</div>
            </div>

            <div style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid #D4AF37', padding: '8px 12px', borderRadius: '8px' }}>
              <div style={{ fontSize: '10.5px', color: '#D4AF37', fontWeight: '800' }}>MILESTONE 3: HANDOVER</div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', marginTop: '2px' }}>20% Post-Assembly</div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Carpenter QC & Key Handover</div>
            </div>
          </div>
        </div>

        {/* Order History Ledger Table */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
              Ledger Transactions & Invoices ({currentKhata.orders.length})
            </div>
            <button
              type="button"
              className="btn-ghost-edit"
              onClick={() => setShowAddPayment(!showAddPayment)}
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Plus size={13} /> {showAddPayment ? 'Hide Payment Form' : 'Record Direct Payment'}
            </button>
          </div>

          {/* Quick Payment Form */}
          {showAddPayment && (
            <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
                💳 Record Customer Payment Installment:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>Amount Received (₹)</label>
                  <input
                    type="number"
                    value={newPayAmount}
                    onChange={e => setNewPayAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="luxury-input"
                    style={{ width: '100%', fontFamily: 'JetBrains Mono', fontWeight: '800' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>Payment Mode</label>
                  <select
                    value={newPayMode}
                    onChange={e => setNewPayMode(e.target.value)}
                    className="luxury-input"
                    style={{ width: '100%' }}
                  >
                    <option value="Dynamic UPI QR">Dynamic UPI QR</option>
                    <option value="Cash in Safe">Cash in Safe</option>
                    <option value="Canara Bank NEFT">Canara Bank NEFT / IMPS</option>
                    <option value="HDFC Card POS">HDFC Card Swipe</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', color: '#94A3B8' }}>UTR / Reference No.</label>
                  <input
                    type="text"
                    value={newPayRef}
                    onChange={e => setNewPayRef(e.target.value)}
                    placeholder="e.g. UTR-998812"
                    className="luxury-input"
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  type="button"
                  className="btn-luxury-gold"
                  onClick={handleRecordPayment}
                  style={{ padding: '9px 16px', fontWeight: '800' }}
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          )}

          <div className="data-table-wrapper">
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Order Ref</th>
                  <th>Date</th>
                  <th>Order Items / Description</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ textAlign: 'right' }}>Paid (₹)</th>
                  <th style={{ textAlign: 'right' }}>Balance (₹)</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {khataOrders.map((o, idx) => (
                  <tr key={o.orderId}>
                    <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-gold-light)', padding: '8px 10px' }}>
                      {o.orderId}
                    </td>
                    <td style={{ color: '#94A3B8', fontSize: '11px', padding: '8px 10px' }}>{o.date}</td>
                    {/* Description — Editable */}
                    <EditableCell
                      value={o.description}
                      field="description"
                      rowIdx={idx}
                      pkVal={o.orderId}
                      isProtected={false}
                      style={{ color: '#FFFFFF', fontWeight: '700', padding: '8px 10px' }}
                      {...cellEdit}
                    />
                    {/* Total — Editable Numeric */}
                    <EditableCell
                      value={o.total}
                      field="total"
                      rowIdx={idx}
                      pkVal={o.orderId}
                      numeric
                      style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', padding: '8px 10px' }}
                      {...cellEdit}
                    >
                      ₹{(Number(o.total) || 0).toLocaleString()}
                    </EditableCell>
                    {/* Paid — Editable Numeric */}
                    <EditableCell
                      value={o.paid}
                      field="paid"
                      rowIdx={idx}
                      pkVal={o.orderId}
                      numeric
                      style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--accent-emerald)', padding: '8px 10px' }}
                      {...cellEdit}
                    >
                      ₹{(Number(o.paid) || 0).toLocaleString()}
                    </EditableCell>
                    <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono', fontWeight: '800', color: o.total - o.paid > 0 ? 'var(--accent-rose)' : '#94A3B8', padding: '8px 10px' }}>
                      ₹{Math.max(0, (Number(o.total) || 0) - (Number(o.paid) || 0)).toLocaleString()}
                    </td>
                    {/* Status — Editable */}
                    <EditableCell
                      value={o.status}
                      field="status"
                      rowIdx={idx}
                      pkVal={o.orderId}
                      style={{ textAlign: 'center', padding: '8px 10px' }}
                      {...cellEdit}
                    >
                      <span className={`badge ${o.status === 'PAID_FULL' ? 'badge-emerald' : 'badge-gold'}`} style={{ fontSize: '9.5px' }}>
                        {String(o.status || '').replace(/_/g, ' ')}
                      </span>
                    </EditableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
          <button
            type="button"
            className="btn-ghost-edit"
            onClick={handleSendReminder}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#25D366' }}
          >
            <Send size={14} /> Send WhatsApp Statement & UPI Payment Link
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-ghost-edit"
              onClick={() => {
                playScanBeep();
                window.print();
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} /> Print Statement
            </button>
            <button type="button" className="btn-luxury-gold" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
