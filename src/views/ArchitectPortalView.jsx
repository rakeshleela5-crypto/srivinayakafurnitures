import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Landmark, 
  Award, 
  DollarSign, 
  UserPlus, 
  Phone, 
  FileSpreadsheet, 
  Send, 
  Sparkles, 
  Search, 
  Filter, 
  Edit, 
  QrCode, 
  Printer, 
  ChevronDown, 
  ChevronRight, 
  ShieldCheck,
  RefreshCw,
  Mic,
  Camera,
  FileText
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function ArchitectPortalView() {
  const { 
    architects, 
    orders, 
    openModal, 
    showToast, 
    setActiveTab, 
    syncWithGoogleSheets, 
    isSyncing 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL' | 'Platinum' | 'Gold' | 'Silver' | 'DUE_ONLY'
  const [expandedArchitectId, setExpandedArchitectId] = useState(null);

  const totalSalesByArchitects = architects.reduce((sum, a) => sum + (a.Total_Sales_INR || 0), 0);
  const totalCommissionEarned = architects.reduce((sum, a) => sum + (a.Commission_Earned_INR || 0), 0);
  const totalPaidOut = architects.reduce((sum, a) => sum + (a.Paid_Out_INR || 0), 0);
  const totalBalanceDue = architects.reduce((sum, a) => sum + (a.Balance_Due_INR || 0), 0);

  const filteredArchitects = architects.filter(a => {
    const matchesSearch = 
      (a.Full_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.Firm_Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.Phone_Number || '').includes(searchQuery) ||
      (a.Architect_ID || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = 
      tierFilter === 'ALL' ? true :
      tierFilter === 'DUE_ONLY' ? a.Balance_Due_INR > 0 :
      a.Tier_Slab === tierFilter;

    return matchesSearch && matchesTier;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 Top Action Ribbon & Command Hub */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Left Action Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-purple">🏛️ ARCHITECT VIP PARTNER NETWORK</span>
          
          <button className="btn-luxury-gold" onClick={() => openModal('register_architect')} style={{ fontSize: '11px', padding: '5px 10px' }}>
            <UserPlus size={13} /> ➕ Register VIP Partner
          </button>
        </div>

        {/* Right Cross-Tab Quick Handoffs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className="btn-cyan" 
            onClick={() => {
              setActiveTab('voice_pos');
              showToast("🎙️ Switched to Voice POS to tag an architect on a commercial quote!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Mic size={12} /> <span>Voice POS (Tab 2)</span>
          </button>

          <button 
            className="btn-ghost-edit" 
            onClick={() => {
              setActiveTab('documents');
              showToast("📄 Switched to Document Studio to print Architect Certificates!", true);
            }}
            style={{ fontSize: '11px', padding: '5px 10px' }}
          >
            <Printer size={12} /> <span>Doc Studio (Tab 10)</span>
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

      {/* 👑 4-Pillar Performance Ledger Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label"><Landmark size={14} color="var(--accent-purple)" /> Total Referred Sales</div>
          <div className="kpi-value" style={{ color: 'var(--accent-purple)' }}>₹{totalSalesByArchitects.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{architects.length} Registered Design Partners</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><Award size={14} color="var(--accent-gold)" /> Total Commission Earned</div>
          <div className="kpi-value" style={{ color: 'var(--accent-gold-light)' }}>₹{totalCommissionEarned.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)' }}>Tiered Slabs (5.0% - 8.5%)</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><DollarSign size={14} color="var(--accent-emerald)" /> Disbursed UPI Payouts</div>
          <div className="kpi-value" style={{ color: 'var(--accent-emerald)' }}>₹{totalPaidOut.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Settled via Real-Time UPI</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label"><DollarSign size={14} color="var(--accent-rose)" /> Outstanding Balance Due</div>
          <div className="kpi-value" style={{ color: 'var(--accent-rose)' }}>₹{totalBalanceDue.toLocaleString()}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)' }}>1-Click Instant Payout</div>
        </div>
      </div>

      {/* 🔍 Search & Tier Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        
        {/* Search Box */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            placeholder="Search architect, design studio, phone, or VIP ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#0B132B',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '9px 12px 9px 36px',
              color: '#FFFFFF',
              fontSize: '12.5px',
              outline: 'none'
            }}
          />
        </div>

        {/* Tier Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Partners' },
            { id: 'Platinum', label: '👑 Platinum (8.5%)' },
            { id: 'Gold', label: '⭐ Gold (6.5%)' },
            { id: 'Silver', label: '🔹 Silver (5.0%)' },
            { id: 'DUE_ONLY', label: '🚨 Pending Payout Due' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTierFilter(f.id)}
              className={`btn-ghost-edit ${tierFilter === f.id ? 'badge-gold' : ''}`}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* 🏛️ Architect Directory Table with Complete Edit & Loyalty Tools */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>VIP Architect Partners & Tiered Commission Ledger</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Showing {filteredArchitects.length} of {architects.length} Empaneled Design Partners
            </span>
          </div>
          <span className="badge badge-cyan">REAL-TIME WEBHOOK SYNC ACTIVE</span>
        </div>

        <div className="data-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Architect / Firm</th>
                <th>Contact & VPA</th>
                <th>Commission Tier</th>
                <th style={{ textAlign: 'right' }}>Total Sales</th>
                <th style={{ textAlign: 'right' }}>Commission Earned</th>
                <th style={{ textAlign: 'right' }}>Balance Due</th>
                <th style={{ textAlign: 'center' }}>VIP Actions & Tools</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchitects.map(arch => {
                const isExpanded = expandedArchitectId === arch.Architect_ID;

                return (
                  <React.Fragment key={arch.Architect_ID}>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button 
                            onClick={() => setExpandedArchitectId(isExpanded ? null : arch.Architect_ID)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-gold-light)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            title="View Project Sales Attribution Breakdown"
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                          <div>
                            <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{arch.Full_Name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🏛️ {arch.Firm_Name} • <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent-gold-light)' }}>{arch.Architect_ID}</span></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '11.5px', color: '#FFFFFF' }}>📞 {arch.Phone_Number}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>UPI: {arch.UPI_Bank}</div>
                      </td>
                      <td>
                        <span className={`badge ${arch.Tier_Slab === 'Platinum' ? 'badge-gold' : arch.Tier_Slab === 'Gold' ? 'badge-amber' : 'badge-cyan'}`}>
                          {arch.Tier_Slab} ({arch.Commission_Rate})
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono' }}>
                        ₹{arch.Total_Sales_INR?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                        ₹{arch.Commission_Earned_INR?.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '900', color: arch.Balance_Due_INR > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', fontFamily: 'JetBrains Mono' }}>
                        ₹{arch.Balance_Due_INR?.toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          
                          {/* 1. Edit Partner */}
                          <button 
                            className="btn-ghost-edit" 
                            style={{ fontSize: '10.5px', padding: '4px 6px' }}
                            onClick={() => openModal('edit_architect', { architect: arch })}
                            title="Edit Profile, Phone & Commission Tier"
                          >
                            <Edit size={12} /> Edit
                          </button>

                          {/* 2. VIP Pass */}
                          <button 
                            className="btn-ghost-edit" 
                            style={{ fontSize: '10.5px', padding: '4px 6px', color: 'var(--accent-cyan)' }}
                            onClick={() => openModal('architect_pass', { architect: arch })}
                            title="Generate Client Referral QR Pass"
                          >
                            <QrCode size={12} /> Pass
                          </button>

                          {/* 3. Certificate */}
                          <button 
                            className="btn-ghost-edit" 
                            style={{ fontSize: '10.5px', padding: '4px 6px', color: 'var(--accent-gold-light)' }}
                            onClick={() => openModal('architect_certificate', { architect: arch })}
                            title="Print Official Empanelled Design Partner Certificate"
                          >
                            <Printer size={12} /> Cert
                          </button>

                          {/* 4. WhatsApp Statement */}
                          <button 
                            className="btn-ghost-edit" 
                            style={{ fontSize: '10.5px', padding: '4px 6px', color: 'var(--accent-emerald)' }}
                            onClick={() => openModal('architect_statement', { architect: arch })}
                            title="Dispatch WhatsApp Commission Statement"
                          >
                            <Send size={12} /> WhatsApp
                          </button>

                          {/* 5. UPI Payout */}
                          <button 
                            className="btn-luxury-gold" 
                            onClick={() => openModal('architect_payout', { architect: arch })}
                            disabled={arch.Balance_Due_INR <= 0}
                            style={{ fontSize: '10.5px', padding: '4px 8px', opacity: arch.Balance_Due_INR <= 0 ? 0.45 : 1 }}
                            title="Disburse Real-Time UPI Commission Payout"
                          >
                            💸 Payout
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Project Attribution Drawer */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} style={{ background: '#030712', padding: '14px 20px', borderLeft: '3px solid var(--accent-gold)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent-gold-light)' }}>
                              🏢 Referred Client Projects & Attribution Ledger ({arch.Full_Name})
                            </div>
                            <span className="badge badge-purple">TIER: {arch.Tier_Slab} ({arch.Commission_Rate})</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF' }}>Dr. Subhashish Jena Villa</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Order Ref: ORD-8921 • Royal Teak King Suite</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
                                <span>Deal: ₹1,56,494</span>
                                <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Earned: ₹13,301</span>
                              </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF' }}>Kasturi Nagar Luxury Flat</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Order Ref: ORD-8922 • 7-Seater Italian Velvet Sofa</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
                                <span>Deal: ₹1,18,400</span>
                                <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Earned: ₹10,064</span>
                              </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: '#FFFFFF' }}>JK Paper Executive Bungalow</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Order Ref: ORD-8919 • Marble Dining + Sliders</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
                                <span>Deal: ₹1,76,000</span>
                                <span style={{ color: 'var(--accent-emerald)', fontWeight: '800' }}>Earned: ₹14,960</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
