import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  FileText, 
  Printer, 
  Download, 
  ShieldCheck, 
  Truck, 
  Factory, 
  Award, 
  Lock,
  Sparkles,
  QrCode
} from 'lucide-react';

export function DocumentStudio() {
  const { storeMeta, orders, openModal } = useStore();
  const [selectedDocType, setSelectedDocType] = useState('tax_invoice');
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">🧾 CENTRAL DOCUMENT & PRINT STUDIO</span>
          <button className="btn-luxury-gold no-print" onClick={() => window.print()}>
            <Printer size={14} /> Print Active Legal Document (A4)
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">GST COMPLIANT (18%/28%)</span>
        </div>
      </div>

      {/* Document Switcher Ribbon */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} className="no-print">
        {[
          { id: 'tax_invoice', label: '📄 Official Tax Invoice', icon: FileText },
          { id: 'delivery_challan', label: '🚚 Delivery Challan', icon: Truck },
          { id: 'gate_pass', label: '🚪 Warehouse Gate Pass', icon: ShieldCheck },
          { id: 'warranty_card', label: '🛡️ 10-Year Warranty Card', icon: Award },
          { id: 'carpenter_voucher', label: '🪚 Carpenter Job Voucher', icon: Award },
          { id: 'eod_closing', label: '🔒 9 PM EOD Cash Lock Slip', icon: Lock }
        ].map(doc => (
          <button 
            key={doc.id}
            className={`btn-ghost-edit ${selectedDocType === doc.id ? 'badge-gold' : ''}`}
            onClick={() => setSelectedDocType(doc.id)}
            style={{ fontSize: '11.5px', padding: '7px 14px' }}
          >
            {doc.label}
          </button>
        ))}
      </div>

      {/* Main Printable Document Canvas */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Document 1: Tax Invoice */}
        {selectedDocType === 'tax_invoice' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '14px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #0F172A', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#0F172A' }}>{storeMeta.storeName}</h2>
                <div style={{ fontSize: '12px', color: '#475569' }}>{storeMeta.address}</div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                  GSTIN: <b>{storeMeta.gstin}</b> | Phone: {storeMeta.phone} | CIN: {storeMeta.cinPan}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284C7' }}>LEGAL TAX INVOICE</div>
                <div style={{ fontSize: '13px', fontWeight: '800' }}>Invoice No: INV-2026-8921</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Date: 28-Aug-2026 11:30 AM</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0', padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>BILLED TO CUSTOMER:</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{selectedOrder.Customer_Name}</div>
                <div style={{ fontSize: '11.5px', color: '#475569' }}>{selectedOrder.Project_Address}</div>
                <div style={{ fontSize: '11.5px', color: '#475569' }}>Contact: {selectedOrder.Customer_Phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>PAYMENT DETAILS:</div>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#047857' }}>50% Advance Settled (UPI) ✓</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Merchant VPA: {storeMeta.upiVpa}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: '16px 0' }}>
              <thead>
                <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item / SKU Specification</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>HSN Code</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Taxable Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #E2E8F0' }}>
                    <b>{selectedOrder.Ordered_SKU}</b>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>100% Solid CP Teak Wood • 10-Year Manufacturer Warranty</div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>9403</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>1 Set</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>₹132,622</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid #E2E8F0', fontWeight: '800' }}>₹132,622</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', maxWidth: '340px' }}>
                Terms: Goods once delivered are covered under official Godrej Interio 10-Year warranty. Free master carpenter installation included.
              </div>
              <div style={{ width: '280px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxable Value:</span>
                  <span>₹132,622</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST (9%):</span>
                  <span>₹11,936</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SGST (9%):</span>
                  <span>₹11,936</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '16px', borderTop: '2px solid #0F172A', paddingTop: '6px' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: '#047857' }}>₹{selectedOrder.Total_Amount_INR?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document 2: 10-Year Warranty Certificate */}
        {selectedDocType === 'warranty_card' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '14px', padding: '36px', border: '3px solid #D4AF37', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#B45309', letterSpacing: '1px' }}>
              OFFICIAL 10-YEAR WARRANTY CERTIFICATE
            </div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '4px' }}>
              GODREJ INTERIO RAYAGADA FLAGSHIP SHOWROOM
            </div>

            <div style={{ width: '100px', height: '3px', background: '#D4AF37', margin: '14px auto' }} />

            <div style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#1E293B', maxWidth: '540px', margin: '16px auto' }}>
              This certifies that <b>{selectedOrder.Customer_Name}</b> has purchased certified Godrej Interio furniture (<b>{selectedOrder.Ordered_SKU}</b>) with 10-Year Anti-Termite, Anti-Borer and Hydraulic mechanism coverage.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '24px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>CERTIFICATE ID</div>
                <div style={{ fontWeight: '800', fontFamily: 'JetBrains Mono' }}>WRN-2026-8921</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>COVERAGE PERIOD</div>
                <div style={{ fontWeight: '800' }}>2026 — 2036 (10 Years)</div>
              </div>
            </div>
          </div>
        )}

        {/* Document 3: Gate Pass */}
        {selectedDocType === 'gate_pass' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '14px', padding: '28px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              WAREHOUSE DISPATCH GATE PASS
            </div>
            <div style={{ margin: '12px 0', fontSize: '12px' }}>
              <div><b>Driver:</b> Tophan Gouda (Tata Ace OD-18-A-1234)</div>
              <div><b>Destination:</b> {selectedOrder.Project_Address}</div>
              <div><b>Component Boxes:</b> 5/5 Staged and Verified ✓</div>
            </div>
          </div>
        )}

        {/* Document 4: Carpenter Job Voucher */}
        {selectedDocType === 'carpenter_voucher' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '14px', padding: '28px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              MASTER CARPENTER INSTALLATION WORK ORDER & VOUCHER
            </div>
            <div style={{ margin: '12px 0', fontSize: '12px' }}>
              <div><b>Master Carpenter:</b> Narayana Mistri</div>
              <div><b>Customer Site:</b> {selectedOrder.Customer_Name} ({selectedOrder.Project_Address})</div>
              <div><b>Cash Wage Voucher:</b> ₹500 (Payable upon customer sign-off)</div>
            </div>
          </div>
        )}

        {/* Document 5: 9 PM EOD Cash Lock Slip */}
        {selectedDocType === 'eod_closing' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '14px', padding: '28px', maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: '900' }}>9 PM DAILY SHOWROOM CLOSING SLIP</div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>Date: 28-Aug-2026 21:00 IST</div>
            <div style={{ width: '100%', height: '1px', background: '#000', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
              <span>Cash Drawer:</span>
              <b>₹45,000</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '8px 0' }}>
              <span>UPI QR Settlements:</span>
              <b>₹124,000</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '900', borderTop: '2px dashed #000', paddingTop: '8px', marginTop: '8px' }}>
              <span>Total Day Gross:</span>
              <span>₹169,000</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
