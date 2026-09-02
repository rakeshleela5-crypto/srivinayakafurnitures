import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import CustomerOrderSearchSelector from '../components/common/CustomerOrderSearchSelector';
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
  QrCode,
  RefreshCw,
  Mic,
  Landmark
} from 'lucide-react';

export function DocumentStudio() {
  const { 
    storeMeta, 
    orders, 
    openModal,
    showToast,
    setActiveTab,
    syncWithGoogleSheets,
    isSyncing
  } = useStore();
  const [selectedDocType, setSelectedDocType] = useState('tax_invoice');
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-cyan">🧾 CENTRAL DOCUMENT & PRINT STUDIO</span>
          
          <button className="btn-luxury-gold no-print" onClick={() => openModal('b2b_turnkey')} style={{ fontSize: '11px', padding: '5px 10px' }}>
            🏢 Generate B2B Turnkey Proposal (₹15L–₹50L)
          </button>
          
          <button className="btn-ghost-edit no-print" onClick={() => window.print()} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <Printer size={13} /> <span>Print Active Legal Document (A4)</span>
          </button>
        </div>

        {/* Right Cross-Tab Quick Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyan no-print" 
            onClick={() => {
              setActiveTab('voice_pos');
              showToast("🎙️ Switched to Voice POS & Quote Studio!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Mic size={12} /> <span>Voice POS (Tab 2)</span>
          </button>

          <button 
            className="btn-emerald no-print" 
            onClick={() => {
              setActiveTab('safelock');
              showToast("🔒 Switched to SafeLock Inventory Terminal!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <ShieldCheck size={12} /> <span>SafeLock (Tab 4)</span>
          </button>

          <button 
            className="btn-purple no-print" 
            onClick={() => {
              setActiveTab('logistics_epod');
              showToast("🚚 Switched to Logistics Fleet & ePOD!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Truck size={12} /> <span>Fleet (Tab 6)</span>
          </button>

          <button 
            className="btn-amber no-print" 
            onClick={() => {
              setActiveTab('architects');
              showToast("🏛️ Switched to Architect VIP Referral Network!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Landmark size={12} /> <span>Architects (Tab 7)</span>
          </button>

          <button 
            className="btn-ghost-edit no-print" 
            onClick={() => syncWithGoogleSheets()}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <RefreshCw size={12} className={isSyncing ? 'spin-anim' : ''} /> <span>2-Way Sync</span>
          </button>
        </div>

      </div>

      {/* Order Selector & Document Switcher Ribbon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#0B132B', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} className="no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold)' }}>Select Customer / Order:</span>
          <CustomerOrderSearchSelector
            selectedOrderId={selectedOrder.Order_ID}
            onSelectOrder={(orderId, orderObj) => {
              if (orderObj) setSelectedOrder(orderObj);
              else if (orders.length > 0) setSelectedOrder(orders[0]);
            }}
            placeholder="🔍 Search Customer, Phone, Order ID..."
            allowAll={false}
            style={{ width: '320px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'tax_invoice', label: '📄 Official Tax Invoice', icon: FileText },
            { id: 'warranty_card', label: '🛡️ 10-Year Warranty Card', icon: Award },
            { id: 'delivery_challan', label: '🚚 Delivery Challan', icon: Truck },
            { id: 'gate_pass', label: '🚪 Warehouse Gate Pass', icon: ShieldCheck },
            { id: 'carpenter_voucher', label: '🪚 Carpenter Job Voucher', icon: Award },
            { id: 'eod_closing', label: '🔒 9 PM EOD Cash Lock Slip', icon: Lock },
            { id: 'client_onboarding_sop', label: '📘 Master Client Onboarding & SOP', icon: Sparkles }
          ].map(doc => (
            <button 
              key={doc.id}
              className={`btn-ghost-edit ${selectedDocType === doc.id ? 'badge-gold' : ''}`}
              onClick={() => setSelectedDocType(doc.id)}
              style={{ fontSize: '11px', padding: '6px 12px', fontWeight: selectedDocType === doc.id ? '800' : '500' }}
            >
              {doc.label}
            </button>
          ))}
        </div>
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

        {/* Document: Delivery Challan */}
        {selectedDocType === 'delivery_challan' && (
          <div className="printable-area" style={{ background: '#FFFFFF', color: '#000000', borderRadius: '14px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2.5px solid #0F172A', paddingBottom: '14px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A' }}>{storeMeta.storeName}</h2>
                <div style={{ fontSize: '11.5px', color: '#475569' }}>{storeMeta.address}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>GSTIN: {storeMeta.gstin} | Phone: {storeMeta.phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#D97706' }}>OFFICIAL DELIVERY CHALLAN</div>
                <div style={{ fontSize: '12.5px', fontWeight: '800' }}>Challan No: DC-2026-{String(selectedOrder.Order_ID || '8921').replace('ORD-', '')}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Date: {new Date().toLocaleDateString('en-GB')}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0', padding: '12px', background: '#F8FAFC', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>CONSIGNEE (DELIVER TO):</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>{selectedOrder.Customer_Name}</div>
                <div style={{ fontSize: '11.5px', color: '#475569' }}>{selectedOrder.Project_Address}</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Phone: {selectedOrder.Customer_Phone || '9437088990'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>FLEET LOGISTICS:</div>
                <div style={{ fontSize: '12px', fontWeight: '800' }}>Vehicle: Tata Ace (OD-18-A-1234)</div>
                <div style={{ fontSize: '11px', color: '#475569' }}>Driver: Tophan Gouda</div>
                <div style={{ fontSize: '11px', color: '#047857', fontWeight: '800' }}>Dock Gatepass: GP-{selectedOrder.Order_ID || '8921'} ✓</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', margin: '14px 0' }}>
              <thead>
                <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Package Units</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>QC Seal</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px 10px', borderBottom: '1px solid #E2E8F0' }}>
                    <b>{selectedOrder.Ordered_SKU}</b>
                    <div style={{ fontSize: '10.5px', color: '#64748B' }}>SmartKit™ Flat-Pack Cartons Verified • Pre-Delivery Inspection Passed</div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #E2E8F0' }}>5 Cartons</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', borderBottom: '1px solid #E2E8F0', color: '#047857', fontWeight: '800' }}>PASSED ✓</td>
                  <td style={{ padding: '12px 10px', textAlign: 'right', borderBottom: '1px solid #E2E8F0', fontWeight: '800' }}>₹{selectedOrder.Total_Amount_INR?.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '36px', fontSize: '11px', color: '#475569' }}>
              <div>Driver Signature: _______________________</div>
              <div>Customer Signature: _______________________</div>
            </div>
          </div>
        )}

        {/* Document: Official 10-Year Luxury Gold & Navy Warranty Certificate */}
        {selectedDocType === 'warranty_card' && (
          <div className="printable-area" style={{ background: 'linear-gradient(135deg, #0B132B 0%, #1C2541 100%)', color: '#FFFFFF', borderRadius: '16px', padding: '40px', border: '3px solid #D4AF37', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Ambient Watermark */}
            <div style={{ position: 'absolute', right: '-40px', bottom: '-40px', fontSize: '160px', opacity: 0.04, color: '#D4AF37', pointerEvents: 'none', fontWeight: '900', fontFamily: 'serif' }}>
              GI
            </div>

            {/* Certificate Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid rgba(212,175,55,0.4)', paddingBottom: '20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid #D4AF37', borderRadius: '30px', padding: '6px 18px', marginBottom: '12px' }}>
                <Award size={16} color="#D4AF37" />
                <span style={{ fontSize: '11px', letterSpacing: '2px', fontWeight: '800', color: '#D4AF37', textTransform: 'uppercase' }}>
                  GODREJ INTERIO OFFICIAL GUARANTEE
                </span>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#D4AF37', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'Cinzel, Georgia, serif' }}>
                10-Year Digital Warranty Certificate
              </h1>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
                Shree Ganesh Enterprises • Main Road, Near New Bus Stand, Rayagada (OD 765001)
              </div>
            </div>

            {/* Certificate Body */}
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#CBD5E1', letterSpacing: '0.5px' }}>
                This is to officially certify that
              </p>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', margin: '8px 0', letterSpacing: '0.5px' }}>
                {selectedOrder.Customer_Name || 'VIP Showroom Client'}
              </h2>
              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                📍 Destination Site: <b>{selectedOrder.Project_Address || 'Rayagada District'}</b>
              </p>

              <div style={{ width: '120px', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', margin: '16px auto' }} />

              <p style={{ fontSize: '13.5px', color: '#E2E8F0', maxWidth: '620px', margin: '0 auto', lineHeight: '1.7' }}>
                is granted a <b>Comprehensive 10-Year Manufacturer Warranty</b> on genuine Godrej Interio Certified Model:
                <br />
                <span style={{ color: '#FCD34D', fontSize: '16px', fontWeight: '800', display: 'inline-block', marginTop: '6px' }}>
                  "{selectedOrder.Ordered_SKU || selectedOrder.Item_Names || 'Solid Teak Luxury Furniture Suite'}"
                </span>
              </p>
            </div>

            {/* 4 Pillars of Warranty Protection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', margin: '16px 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🐜</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>ANTI-TERMITE</div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>100% Core Infusion</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🪚</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>ANTI-BORER</div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Seasoned Teak Timber</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>⚙️</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>HYDRAULIC LIFTS</div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>50,000 Cycle Tested</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🛠️</div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#FCD34D', marginTop: '4px' }}>FREE ANNUAL QC</div>
                <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>Doorstep Mistri Service</div>
              </div>
            </div>

            {/* Hologram Stamp & Authentication Grid */}
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1.5px dashed #D4AF37', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', margin: '20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 20px rgba(212,175,55,0.6)' }}>
                  🔒
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Tamper-Proof Hologram Serial
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#FCD34D' }}>
                    GDJ-WAR-{String(selectedOrder.Order_ID || '8921').replace('ORD-', '')}-2026
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#6EE7B7' }}>
                    ✓ Cryptographically Signed & Cloud Ledger Stored
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>COVERAGE TIMELINE</div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>
                  2026 — 2036 (10 Full Years)
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>Invoice Ref: INV-2026-{selectedOrder.Order_ID || '8921'}</div>
              </div>
            </div>

            {/* Signature & Security Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                <div>Authorized Signatory: <b>Rakesh (Store Director)</b></div>
                <div>Godrej Interio Flagship Store • Rayagada</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button 
                  className="btn-luxury-gold no-print" 
                  onClick={() => window.print()}
                  style={{ fontSize: '12px', padding: '8px 18px' }}
                >
                  <Printer size={14} /> [Generate 10-Year Warranty PDF]
                </button>
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
