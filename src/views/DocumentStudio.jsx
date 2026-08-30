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
          <button className="btn-luxury-gold no-print" onClick={() => openModal('b2b_turnkey')}>
            🏢 Generate B2B Turnkey Proposal (₹15L–₹50L)
          </button>
          <button className="btn-ghost-edit no-print" onClick={() => window.print()}>
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
          { id: 'client_onboarding_sop', label: '📘 Master Client Onboarding & SOP (Printable PDF)', icon: Sparkles },
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

        {/* Document: Master Client Onboarding & SOP Blueprint */}
        {selectedDocType === 'client_onboarding_sop' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#0F172A', borderRadius: '14px', padding: '36px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* Header */}
            <div style={{ borderBottom: '3px solid #0F172A', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#B45309', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  OMNIBUILD OS™ — ENTERPRISE ARCHITECTURE & CLIENT ONBOARDING BLUEPRINT
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0F172A', margin: '4px 0' }}>
                  Godrej Interio Rayagada Flagship Showroom
                </h1>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Client: Shree Ganesh Enterprises | Main Road, Rayagada, Odisha 765001 | Director: Mr. Rakesh (+91 93905 53301)
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ background: '#0F172A', color: '#FFFFFF', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                  CONFIDENTIAL SOP
                </span>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Version 2.4 (August 2026)</div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <div style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '6px', marginBottom: '10px' }}>
                1. EXECUTIVE ARCHITECTURE OVERVIEW
              </h2>
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#334155', margin: '0 0 10px 0' }}>
                OmniBuild OS™ is a multi-tier autonomous retail operating system unifying 16 core business modules, 20 automated cloud bots, and a 21-table Master Google Sheets backend. It eliminates double-selling, missing knockdown carton shortages, and after-hours customer drop-offs through 24/7 AI automation.
              </p>
            </div>

            {/* Section 2: 5-Act Demo Strategy */}
            <div style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '6px', marginBottom: '10px' }}>
                2. THE 5-ACT LIVE DEMO MASTERCLASS SEQUENCE
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', margin: '10px 0' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', color: '#0F172A', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', border: '1px solid #CBD5E1' }}>Act #</th>
                    <th style={{ padding: '8px 10px', border: '1px solid #CBD5E1' }}>Feature & Tab</th>
                    <th style={{ padding: '8px 10px', border: '1px solid #CBD5E1' }}>Live Proof Action</th>
                    <th style={{ padding: '8px 10px', border: '1px solid #CBD5E1' }}>Core Business Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: '800' }}>Act 1</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>🎙️ AI Voice POS (Tab 3)</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Natural speech to cart parsing + 1-click GST invoice</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Reduces billing time from 15m to 3s</td>
                  </tr>
                  <tr style={{ background: '#F8FAFC' }}>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: '800' }}>Act 2</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>🛋️ Spatial Room Matcher (Tab 13)</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>38" Doorway LiDAR scan + 3-piece combo bundle</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Eliminates hesitation, raises order size 2.5X</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: '800' }}>Act 3</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>📱 Dual-Brain WhatsApp Hub (Tab 4 & #chat)</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Customer QR scan + AI Cost Shield vs Director VIP (8899)</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>24/7 lead capture while protecting profit margins</td>
                  </tr>
                  <tr style={{ background: '#F8FAFC' }}>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: '800' }}>Act 4</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>🔫 Knockdown Barcode QC (Tab 8 & 9)</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>5-Box (A to E) verification + 2400Hz laser sound profile</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>100% defense against missing hardware cartons</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0', fontWeight: '800' }}>Act 5</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>🏭 AutoProcure™ & 21-Table Telemetry (Tab 7,11,16)</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Buffer reorder PO + GPS stylus signature + Sheets audit</td>
                    <td style={{ padding: '8px 10px', border: '1px solid #E2E8F0' }}>Autonomous replenishment & audit proof</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Section 3: 20-Minute Onboarding Workflow */}
            <div style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '6px', marginBottom: '10px' }}>
                3. POST-DEMO 20-MINUTE CLIENT ONBOARDING & META WHATSAPP GO-LIVE
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', background: '#F8FAFC' }}>
                  <div style={{ fontWeight: '800', fontSize: '12px', color: '#0F172A', marginBottom: '4px' }}>
                    Step 1: Office Desktop Registration
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                    Open <b>developers.facebook.com</b> directly from the client's showroom PC. Use store GST certificate (Shree Ganesh Enterprises) to bypass personal device checks.
                  </div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', background: '#F8FAFC' }}>
                  <div style={{ fontWeight: '800', fontSize: '12px', color: '#0F172A', marginBottom: '4px' }}>
                    Step 2: Showroom SIM OTP Verification
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                    Register +91 93905 53301. Enter the 6-digit Meta SMS code. WhatsApp Business Cloud approves the number in 2 minutes.
                  </div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', background: '#F8FAFC' }}>
                  <div style={{ fontWeight: '800', fontSize: '12px', color: '#0F172A', marginBottom: '4px' }}>
                    Step 3: Webhook Binding
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                    Paste Google Apps Script Webhook URL into Meta Webhook configuration. Subscribe to <code>messages</code> callback.
                  </div>
                </div>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', background: '#F8FAFC' }}>
                  <div style={{ fontWeight: '800', fontSize: '12px', color: '#0F172A', marginBottom: '4px' }}>
                    Step 4: Physical Standee Placement
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                    Print 4"×6" Acrylic Standees from Tab 14. Place on display beds and sofas for instant walk-in QR scanning.
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: 20 Bots Summary */}
            <div style={{ margin: '20px 0' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '6px', marginBottom: '10px' }}>
                4. 20 AUTONOMOUS CLOUD BOTS DIRECTORY
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', fontSize: '10.5px' }}>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-01:</b> SafeLock Order Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-02:</b> Stock Decrement Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-03:</b> 5-Box Staging Guard</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-04:</b> Driver OTP Dispatcher</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-05:</b> Digital ePOD GPS Lock</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-06:</b> Doorstep Dynamic UPI</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-07:</b> Architect 8.5% Ledger</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-08:</b> AutoProcure Factory PO</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-09:</b> ₹500 Carpenter Card</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-10:</b> Buyback Valuation Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-11:</b> VIP Festive Broadcast</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-12:</b> 9 PM Daily Cash Lock</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-13:</b> 38" Room Fitment Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-14:</b> 0% No-Cost EMI Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-15:</b> 10-Yr Warranty PDF Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-16:</b> Walk-in Lead AI Scorer</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-17:</b> Cloud Deduplicator</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-18:</b> Supplier Inward QC</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-19:</b> ₹45L Sales Pacer Bot</div>
                <div style={{ padding: '6px 8px', background: '#F1F5F9', borderRadius: '6px' }}><b>BOT-20:</b> Master Webhook Sync</div>
              </div>
            </div>

            {/* Section 5: Commercial Terms */}
            <div style={{ margin: '20px 0', borderTop: '2px solid #0F172A', paddingTop: '14px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '10px' }}>
                5. RECOMMENDED AGENCY COMMERCIAL TERMS
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A' }}>One-Time Implementation & Full 16-Tab Setup:</div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>Includes catalog, WhatsApp API, standees & sheets sync</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#B45309' }}>₹45,000 – ₹75,000</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', marginTop: '8px' }}>
                <div>
                  <div style={{ fontWeight: '800', color: '#0F172A' }}>Monthly AI Retainer & Support Agreement:</div>
                  <div style={{ color: '#64748B', fontSize: '11px' }}>24/7 AI uptime, webhook health, 9 PM EOD cash reports</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#047857' }}>₹5,000 – ₹10,000 / Mo</div>
              </div>
            </div>

            {/* Signature Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #CBD5E1', paddingTop: '16px', fontSize: '11px', color: '#64748B' }}>
              <div>Prepared By: AI Automation Engineering Lead</div>
              <div>Client Sign-off: _______________________________ (Director Rakesh)</div>
            </div>

          </div>
        )}

        {/* Document 1: Tax Invoice */}
        {selectedDocType === 'tax_invoice' && (
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
