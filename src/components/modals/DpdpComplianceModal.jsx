import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Scale, 
  Printer, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck, 
  Globe, 
  Phone, 
  Mail,
  Building,
  Key
} from 'lucide-react';
import { playSuccessChime } from '../../utils/audioUtils';

export function DpdpComplianceModal() {
  const { closeModal, storeMeta, showToast } = useStore();
  const [activeLegalTab, setActiveLegalTab] = useState('privacy_policy'); // 'privacy_policy' | 'anti_hacking' | 'certificate'

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-content glass-panel" 
        style={{ 
          maxWidth: '850px', 
          width: '95%', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          border: '2px solid var(--accent-gold)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
          padding: '24px'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(212,175,55,0.15)', border: '1.5px solid var(--accent-gold)', borderRadius: '12px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={28} style={{ color: 'var(--accent-gold)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  Statutory Privacy Policy & DPDP 2023 Legal Shield
                </h2>
                <span className="badge badge-emerald">GOVT. OF INDIA COMPLIANT</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Governed under Digital Personal Data Protection Act, 2023 & Information Technology Act, 2000
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={closeModal}><X size={18} /></button>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', background: '#030712', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button 
            className={`btn-ghost-edit ${activeLegalTab === 'privacy_policy' ? 'badge-gold' : ''}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '12px', border: 'none' }}
            onClick={() => setActiveLegalTab('privacy_policy')}
          >
            <FileText size={14} /> 📜 Statutory Privacy Policy
          </button>
          <button 
            className={`btn-ghost-edit ${activeLegalTab === 'anti_hacking' ? 'badge-rose' : ''}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '12px', border: 'none' }}
            onClick={() => setActiveLegalTab('anti_hacking')}
          >
            <Scale size={14} /> ⚖️ Anti-Hacking & IT Act Terms
          </button>
          <button 
            className={`btn-ghost-edit ${activeLegalTab === 'certificate' ? 'badge-cyan' : ''}`}
            style={{ flex: 1, padding: '8px 12px', fontSize: '12px', border: 'none' }}
            onClick={() => setActiveLegalTab('certificate')}
          >
            <ShieldCheck size={14} /> 🖨️ Compliance Certificate
          </button>
        </div>

        {/* ================= TAB 1: STATUTORY PRIVACY POLICY ================= */}
        {activeLegalTab === 'privacy_policy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Data Fiduciary Declaration */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(212,175,55,0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                1. Data Fiduciary Declaration (Section 2(i) DPDP Act 2023)
              </div>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#CBD5E1', margin: 0 }}>
                This enterprise software platform (OmniBuild OS™) is owned and operated by <b>Shree Ganesh Enterprises / Godrej Interio Rayagada</b> (Managing Director: <b>Rakesh</b>, GSTIN: <code style={{ color: 'var(--accent-gold-light)' }}>21AAAAA0000A1Z5</code>). We act as the sole <b>Data Fiduciary</b> responsible for determining the purpose and means of processing personal data.
              </p>
            </div>

            {/* Scope & Categories of Data Collected */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '8px' }}>
                2. Categories of Personal Data Collected & Processed
              </div>
              <ul style={{ fontSize: '12px', lineHeight: '1.7', color: '#94A3B8', paddingLeft: '18px', margin: 0 }}>
                <li><b>Customer Identifiers:</b> Name, WhatsApp phone number, delivery residential address, and GSTIN (for B2B corporate billing).</li>
                <li><b>Spatial Imagery:</b> Customer room layout photos uploaded to the 2D AI Room Matcher exclusively for dimensional fit analysis and 3D furniture rendering.</li>
                <li><b>Financial Transactions:</b> Dynamic UPI reference IDs, advance token receipts (50%), and 0-cost EMI schedule options. <i>(No credit card numbers or UPI PINs are ever stored)</i>.</li>
                <li><b>Logistics & Signatures:</b> Electronic Proof of Delivery (ePOD) digital signatures, delivery OTPs (4-digit), and truck driver cargo proof photos.</li>
              </ul>
            </div>

            {/* Purpose Limitation & Consent */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-emerald)', textTransform: 'uppercase', marginBottom: '6px' }}>
                3. Purpose Limitation & No Third-Party Commercial Sale (Section 6)
              </div>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#CBD5E1', margin: 0 }}>
                Personal data is processed <b>strictly for legitimate furniture showroom operations</b>: quotation generation, order fulfillment, factory PO creation, warranty registration (5–10 years), and doorstep carpenter installation. <b>We strictly NEVER sell, rent, or lease personal customer data to any third-party marketing brokers or advertisers.</b>
              </p>
            </div>

            {/* Data Principal Rights */}
            <div style={{ background: '#030712', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-purple)', textTransform: 'uppercase', marginBottom: '6px' }}>
                4. Data Principal Rights (Sections 11, 12 & 13 DPDP Act 2023)
              </div>
              <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#94A3B8', margin: 0 }}>
                Customers and partners retain full statutory rights to: (a) Request a summary of personal data held, (b) Request correction of inaccurate addresses or contact numbers, (c) Request complete erasure of non-statutory records upon order completion, and (d) Nominate a representative in case of demise.
              </p>
            </div>

            {/* Grievance Officer */}
            <div style={{ background: 'rgba(212,175,55,0.08)', borderRadius: '12px', padding: '14px', border: '1px solid var(--accent-gold)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--accent-gold-light)', textTransform: 'uppercase' }}>
                  Statutory Grievance Redressal & Data Protection Officer (DPO):
                </div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                  Rakesh (Managing Director / DPO) • Shree Ganesh Enterprises
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  📍 Godrej Interio Flagship Showroom, Main Road, Rayagada, Odisha — 765001 • 📞 +91 9390553301
                </div>
              </div>
              <span className="badge badge-emerald">DPO DESIGNATED ✓</span>
            </div>

          </div>
        )}

        {/* ================= TAB 2: ANTI-HACKING & IT ACT 2000 TERMS ================= */}
        {activeLegalTab === 'anti_hacking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Warning Box */}
            <div style={{ background: 'rgba(244,63,94,0.15)', borderRadius: '12px', padding: '16px', border: '2px solid var(--accent-rose)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <AlertTriangle size={20} style={{ color: 'var(--accent-rose)' }} />
                <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--accent-rose)', margin: 0 }}>
                  CRIMINAL WARNING: STRICT LEGAL PROSECUTION FOR HACKING & UNAUTHORIZED ACCESS
                </h4>
              </div>
              <p style={{ fontSize: '12.5px', lineHeight: '1.6', color: '#FFFFFF', margin: 0 }}>
                This application, its Google Apps Script webhook endpoints, database tables, and inventory models are proprietary enterprise assets. Any unauthorized access, penetration attempt, SQL injection, webhook packet tampering, or unauthorized data scraping constitutes a <b>cognizable criminal offense</b> under the <b>Information Technology Act, 2000</b> and the <b>Bharatiya Nyaya Sanhita (BNS), 2023</b>.
              </p>
            </div>

            {/* Applicable Criminal Penalties Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              
              <div style={{ background: '#030712', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-cyan)' }}>
                  ⚖️ Section 43 & 66 of IT Act, 2000
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  Hacking, damaging computer systems, unauthorized downloading of catalog data, or introducing malware: <b>Imprisonment up to 3 Years + Fines up to ₹5,00,000 + Civil Compensation</b>.
                </div>
              </div>

              <div style={{ background: '#030712', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-amber)' }}>
                  ⚖️ Section 66C & 66D of IT Act, 2000
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  Identity theft, PIN stealing, or cheating by impersonation using computer resources: <b>Rigorous Imprisonment up to 3 Years + Non-Bailable Cognizance</b>.
                </div>
              </div>

              <div style={{ background: '#030712', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-emerald)' }}>
                  ⚖️ Section 65B Indian Evidence Act (BSA)
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  All PIN unlocks, price changes, and webhook IP transmissions are recorded in <b>tamper-evident audit logs</b> legally admissible in District & High Courts as primary electronic evidence.
                </div>
              </div>

              <div style={{ background: '#030712', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--accent-gold-light)' }}>
                  ⚖️ Section 8(5) DPDP Act 2023 Safeguards
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: '1.5' }}>
                  Fiduciary maintains verified <i>"Reasonable Security Safeguards"</i> (RBAC PINs, SSL encryption, tamper logs), fully shielding store management from regulatory liabilities.
                </div>
              </div>

            </div>

            {/* Jurisdiction */}
            <div style={{ background: '#030712', borderRadius: '10px', padding: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11.5px', color: '#94A3B8' }}>
              <b>Legal Jurisdiction:</b> Any dispute, breach prosecution, or legal proceedings shall be subject to the exclusive jurisdiction of the <b>District Sessions Court at Rayagada, Odisha</b> and the <b>High Court of Orissa at Cuttack</b>.
            </div>

          </div>
        )}

        {/* ================= TAB 3: PRINTABLE COMPLIANCE CERTIFICATE ================= */}
        {activeLegalTab === 'certificate' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            
            {/* Printable Certificate Canvas */}
            <div 
              className="printable-area"
              style={{ 
                background: '#FFFFFF', 
                color: '#000000', 
                borderRadius: '16px', 
                padding: '32px', 
                maxWidth: '650px', 
                width: '100%', 
                border: '6px double #000000', 
                boxShadow: '0 15px 40px rgba(0,0,0,0.8)',
                textAlign: 'center',
                fontFamily: "'Times New Roman', serif"
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={{ border: '2px solid #000', padding: '6px 14px', borderRadius: '50px', fontSize: '11px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  GOVERNMENT OF INDIA STATUTORY COMPLIANCE
                </div>
              </div>

              <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '8px 0 2px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                CERTIFICATE OF DPDP 2023 COMPLIANCE
              </h1>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#475569', marginBottom: '16px' }}>
                Issued pursuant to Section 8(5) of the Digital Personal Data Protection Act, 2023
              </div>

              <div style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '14px 0', margin: '14px 0', textAlign: 'left', fontSize: '12px', lineHeight: '1.8' }}>
                <div><b>Data Fiduciary Enterprise:</b> SHREE GANESH ENTERPRISES (Godrej Interio Flagship Showroom)</div>
                <div><b>Principal Place of Business:</b> Main Road, Rayagada, Odisha — 765001</div>
                <div><b>GSTIN Registration:</b> 21AAAAA0000A1Z5</div>
                <div><b>Designated Data Protection Officer:</b> Rakesh (Managing Director)</div>
                <div><b>Enterprise Software:</b> OmniBuild OS™ (React + Vite + Google Cloud Encrypted Webhooks)</div>
                <div><b>Security Standard:</b> Role-Based PIN Access Control (RBAC) + 256-Bit SSL Encryption + Section 65B BSA Electronic Audit Trail</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px', paddingTop: '10px' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Date of Certification:</div>
                  <div style={{ fontSize: '12px', fontWeight: '800' }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  <div style={{ fontSize: '9px', color: '#64748B' }}>Valid across all Indian Jurisdictions</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', border: '2px solid #000', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px auto' }}>
                    <div style={{ fontSize: '8px', fontWeight: '900' }}>DPDP 2023</div>
                    <div style={{ fontSize: '7px' }}>SEAL OF COMPLIANCE</div>
                    <div style={{ fontSize: '7px', fontWeight: '900' }}>RAYAGADA</div>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '900' }}>Authorized Store Signatory</div>
                </div>
              </div>
            </div>

            <button className="btn-luxury-gold" onClick={handlePrintCertificate} style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '900' }}>
              <Printer size={16} /> 🖨️ Print Official DPDP Compliance Certificate (for Showroom Office)
            </button>

          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            🔒 Legally protected under Information Technology Act, 2000 & DPDP Act, 2023 (Govt. of India)
          </div>
          <button className="btn-ghost-edit" onClick={closeModal}>
            Close Notice
          </button>
        </div>

      </div>
    </div>
  );
}
