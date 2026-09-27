import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Users, 
  Sparkles, 
  UserPlus, 
  Check, 
  Phone, 
  ArrowRight, 
  Filter, 
  Calendar, 
  Flame,
  Search,
  MessageSquare,
  Compass,
  Mic,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Send,
  Trash2,
  Edit3,
  Clock,
  Briefcase,
  Layers
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';

export function ShowroomCrmView() {
  const { inquiries, setInquiries, openModal, setActiveTab, showToast } = useStore();

  // Filters State
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 📊 Executive KPI Calculations
  const totalLeads = inquiries.length;
  const hotLeadsCount = inquiries.filter(i => (parseInt(i.AI_Intent_Score) || 0) >= 80).length;
  const mobileConciergeLeadsCount = inquiries.filter(i => 
    (i.Status || '').includes('ENGAGED_ON_MOBILE_AI') || 
    (i.Inquiry_ID || '').includes('INQ-AI') ||
    (i.AI_Intent_Score || '').toString().includes('CONCIERGE') ||
    (i.AI_Intent_Score || '').toString().includes('DIRECTOR')
  ).length;
  const convertedCount = inquiries.filter(i => (i.Status || '').includes('CONVERTED')).length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedCount / totalLeads) * 100) : 0;
  
  const totalPipelineBudget = useMemo(() => {
    return inquiries
      .filter(i => !(i.Status || '').includes('CANCELLED'))
      .reduce((acc, i) => acc + (Number(i.Budget_INR) || 0), 0);
  }, [inquiries]);

  // 🔍 Filtered Inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      // Status Filter
      let matchesStatus = true;
      if (filterStatus === 'HOT_LEAD') matchesStatus = (parseInt(inq.AI_Intent_Score) || 0) >= 80 && !(inq.Status || '').includes('CONVERTED');
      else if (filterStatus === 'WARM_LEAD') matchesStatus = (parseInt(inq.AI_Intent_Score) || 0) < 80 && !(inq.Status || '').includes('CONVERTED');
      else if (filterStatus === 'CONCIERGE_DROP') {
        matchesStatus = (inq.Status || '').includes('ENGAGED_ON_MOBILE_AI') || 
                        (inq.Inquiry_ID || '').includes('INQ-AI') || 
                        (inq.AI_Intent_Score || '').toString().includes('CONCIERGE') || 
                        (inq.AI_Intent_Score || '').toString().includes('DIRECTOR');
      }
      else if (filterStatus === 'FOLLOW_UP') matchesStatus = (inq.Status || '').includes('FOLLOW_UP') || (inq.Follow_Up_Date || '').includes('Tomorrow');
      else if (filterStatus === 'MISTRI_VISIT') matchesStatus = (inq.Status || '').includes('MISTRI');
      else if (filterStatus === 'CONVERTED') matchesStatus = (inq.Status || '').includes('CONVERTED');

      // Category Filter
      let matchesCategory = true;
      if (filterCategory === 'BEDROOM') matchesCategory = (inq.Category_Models || '').toLowerCase().includes('bed') || (inq.Category_Models || '').toLowerCase().includes('wardrobe');
      else if (filterCategory === 'LIVING') matchesCategory = (inq.Category_Models || '').toLowerCase().includes('sofa') || (inq.Category_Models || '').toLowerCase().includes('recliner');
      else if (filterCategory === 'DINING') matchesCategory = (inq.Category_Models || '').toLowerCase().includes('dining') || (inq.Category_Models || '').toLowerCase().includes('table');
      else if (filterCategory === 'OFFICE') matchesCategory = (inq.Category_Models || '').toLowerCase().includes('chair') || (inq.Category_Models || '').toLowerCase().includes('storwel') || (inq.Category_Models || '').toLowerCase().includes('office');

      // Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        (inq.Inquiry_ID || '').toLowerCase().includes(q) ||
        (inq.Customer_Name || '').toLowerCase().includes(q) ||
        (inq.Customer_Phone || '').toLowerCase().includes(q) ||
        (inq.Category_Models || '').toLowerCase().includes(q) ||
        (inq.Address || inq.Locality_Address || '').toLowerCase().includes(q);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [inquiries, filterStatus, filterCategory, searchQuery]);

  // 📲 1-Click WhatsApp Festive Catalog Drip
  const handleSendWhatsAppCatalog = (inq) => {
    const text = `🛋️ *Namaste ${inq.Customer_Name || 'Ji'}! Greetings from Godrej Interio Rayagada.*\n\n` +
      `Thank you for visiting our flagship showroom today! As discussed regarding *${inq.Category_Models || 'Premium Furniture Packages'}* (Budget ~₹${(inq.Budget_INR || 0).toLocaleString()}):\n\n` +
      `✨ *Special Festive Showroom Privileges:*\n` +
      `• 0% Interest EMI with Zero Down Payment (Bajaj Finserv / HDFC)\n` +
      `• Free 3D Laser Room Measurement by Master Carpenter Narayana\n` +
      `• Free Monsoon 5-Box Weather-Proof Delivery to your site in Rayagada\n\n` +
      `📖 *Explore Our 2026 Interactive 3D Catalog:* https://shreeganesh-godrej.web.app\n\n` +
      `Let us know if you would like us to reserve your preferred model before stock allocation.\n` +
      `*Showroom Directors:* Naresh & Naren (+91 93905 53301)\n*Godrej Interio — Main Road, Rayagada*`;

    dispatchWebhookAction("DISPATCH_WHATSAPP_PO_DISPATCH", {
      inquiry_id: inq.Inquiry_ID,
      phone: inq.Customer_Phone || "+91 94371",
      message: text
    });

    window.open(`https://wa.me/91${(inq.Customer_Phone || '9437188291').replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`📲 WhatsApp Festive Catalog sent to ${inq.Customer_Name}!`, true);
  };

  // 🎙️ Handoff to Tab 2 (Voice POS)
  const handleHandoffToVoicePos = (inq) => {
    setActiveTab('voice_pos');
    showToast(`🎙️ Transferred ${inq.Customer_Name} (Budget: ₹${(inq.Budget_INR || 0).toLocaleString()}) to Voice POS!`, true);
  };

  // 🗑️ Delete / Void Lead
  const handleDeleteLead = async (inqId) => {
    setInquiries(inquiries.filter(i => i.Inquiry_ID !== inqId));
    const dispatchRes = await dispatchWebhookAction("DELETE_INQUIRY_LEAD", { inquiry_id: inqId });
    if (dispatchRes && dispatchRes.success) {
      showToast(`🗑️ Inquiry Lead #${inqId} deleted from Cloudflare D1.`, true);
    } else {
      showToast(`🗑️ Inquiry Lead #${inqId} deleted locally.`, false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🌟 TOP INTERCONNECTED COMMAND RIBBON */}
      <div className="tab-action-ribbon" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="badge badge-rose">👥 SHOWROOM CRM & FOOTFALL COCKPIT</span>
          
          <button className="btn-luxury-gold" onClick={() => openModal('new_inquiry')} style={{ fontSize: '11.5px', padding: '6px 14px' }}>
            <UserPlus size={14} /> ➕ Log Walk-In Footfall Lead
          </button>

          <button className="btn-cyan" onClick={() => openModal('bulk_bot_broadcast')} style={{ fontSize: '11.5px', padding: '6px 14px' }}>
            📢 Bulk 500-Customer Bot Broadcast
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">AI INTENT BUYING RADAR ACTIVE</span>
        </div>
      </div>

      {/* 📊 1. EXECUTIVE FOOTFALL & CRM KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Walk-in Leads
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', marginTop: '4px' }}>
            {totalLeads} <span style={{ fontSize: '12px', color: 'var(--accent-gold-light)', fontWeight: '600' }}>Inquiries Logged</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Hot Buying Intent (80%+)
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-rose)', marginTop: '4px' }}>
            {hotLeadsCount} <span style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: '600' }}>🔥 Ready to Book</span>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-emerald)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Lead Pipeline Value
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
            ₹{totalPipelineBudget.toLocaleString()}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Conversion Success Rate
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--accent-cyan)', marginTop: '4px' }}>
            {conversionRate}% <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>({convertedCount} Orders Booked)</span>
          </div>
        </div>

      </div>

      {/* 🎯 2. MULTI-DIMENSION CATEGORY & TEMPERATURE FILTER STRIP */}
      <div className="glass-panel" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Temperature Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: '📋 All Leads' },
              { id: 'HOT_LEAD', label: '🔥 Hot Intent (80%+)' },
              { id: 'CONCIERGE_DROP', label: `📱 24/7 Mobile AI Leads (${mobileConciergeLeadsCount})` },
              { id: 'WARM_LEAD', label: '⚡ Warm Leads' },
              { id: 'MISTRI_VISIT', label: '📐 Mistri Booked' },
              { id: 'FOLLOW_UP', label: '📅 Follow-Up Due' },
              { id: 'CONVERTED', label: '✅ Converted Orders' }
            ].map(tab => (
              <button 
                key={tab.id} 
                className={`btn-ghost-edit ${filterStatus === tab.id ? 'badge-gold' : ''}`}
                onClick={() => setFilterStatus(tab.id)}
                style={{ fontSize: '11px', padding: '5px 11px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '220px' }}>
            <input 
              type="text" 
              placeholder="Search Customer, Phone, Locality..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: '8px', background: '#0B132B', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF', width: '100%' }}
            />
          </div>

        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '4px' }}>Category:</span>
          {[
            { id: 'ALL', label: 'All Furniture' },
            { id: 'BEDROOM', label: '🛏️ Bedroom (Beds & Wardrobes)' },
            { id: 'LIVING', label: '🛋️ Living (Sofas & Recliners)' },
            { id: 'DINING', label: '🍽️ Dining Tables' },
            { id: 'OFFICE', label: '🏢 Office Chairs & Storwel' }
          ].map(cat => (
            <button 
              key={cat.id} 
              className={`btn-ghost-edit ${filterCategory === cat.id ? 'badge-purple' : ''}`}
              onClick={() => setFilterCategory(cat.id)}
              style={{ fontSize: '10.5px', padding: '4px 10px' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* 📋 3. INTERACTIVE CRM LEADS PIPELINE TABLE */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="var(--accent-gold-light)" /> Showroom Walk-In CRM & Buying Intent Radar
            </h3>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>
              Direct 2-way reflection & real-time webhook sync with Inquiries_Log Google Sheet
            </p>
          </div>
          <span className="badge badge-purple">{filteredInquiries.length} Leads in Queue</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '10px' }}>Lead ID</th>
                <th style={{ padding: '10px' }}>Customer & Contact</th>
                <th style={{ padding: '10px' }}>Requirement & Models</th>
                <th style={{ padding: '10px' }}>Budget (₹)</th>
                <th style={{ padding: '10px' }}>AI Buying Intent</th>
                <th style={{ padding: '10px' }}>Follow-Up Schedule</th>
                <th style={{ padding: '10px' }}>Status / Staff</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq) => (
                <tr key={inq.Inquiry_ID} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                  
                  {/* Lead ID */}
                  <td style={{ padding: '12px 10px', fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                    {inq.Inquiry_ID}
                  </td>

                  {/* Customer Info */}
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{inq.Customer_Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {inq.Customer_Phone}</div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>📍 {inq.Address || inq.Locality_Address || 'Rayagada'}</div>
                  </td>

                  {/* Requirements */}
                  <td style={{ padding: '12px 10px', fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: '600' }}>
                    {inq.Category_Models}
                  </td>

                  {/* Budget */}
                  <td style={{ padding: '12px 10px', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                    ₹{(inq.Budget_INR || 0).toLocaleString()}
                  </td>

                  {/* AI Intent Score */}
                  <td style={{ padding: '12px 10px' }}>
                    {(() => {
                      const scoreStr = String(inq.AI_Intent_Score || '');
                      const numScore = parseInt(scoreStr) || 80;
                      if (scoreStr.includes('DIRECTOR') || inq.Urgency === 'DIRECTOR_URGENT') {
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <span className="badge badge-rose" style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)', color: '#FFF', border: '1px solid #F87171', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              👑 ULTRA-VIP DIRECTOR CALL ({numScore}%)
                            </span>
                            <span style={{ fontSize: '10px', color: '#FCA5A5', fontWeight: '600' }}>⚡ Dial within 5 mins</span>
                          </div>
                        );
                      }
                      if (scoreStr.includes('WEDDING')) {
                        return (
                          <span className="badge badge-purple" style={{ background: 'linear-gradient(135deg, #7C3AED, #4C1D95)', color: '#FFF', border: '1px solid #A78BFA', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            💍 WEDDING SUITE VIP ({numScore}%)
                          </span>
                        );
                      }
                      if (scoreStr.includes('CONCIERGE') || (inq.Status || '').includes('ENGAGED_ON_MOBILE_AI')) {
                        return (
                          <span className="badge badge-cyan" style={{ fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            📱 24/7 MOBILE AI LEAD ({numScore}%)
                          </span>
                        );
                      }
                      return (
                        <span className={`badge ${numScore >= 80 ? 'badge-rose' : 'badge-amber'}`}>
                          {numScore}% {numScore >= 80 ? '🔥 HOT' : '⚡ WARM'}
                        </span>
                      );
                    })()}
                  </td>

                  {/* Follow-up Schedule */}
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ fontSize: '11px', color: '#E2E8F0', fontWeight: '600' }}>
                      {inq.Follow_Up_Date || 'Tomorrow'}
                    </div>
                  </td>

                  {/* Status & Staff */}
                  <td style={{ padding: '12px 10px' }}>
                    <div>
                      <span className={`badge ${
                        inq.Status.includes('CONVERTED') ? 'badge-emerald' : 
                        inq.Status.includes('ENGAGED_ON_MOBILE_AI') ? 'badge-cyan' :
                        inq.Status.includes('MISTRI') ? 'badge-purple' : 
                        'badge-gold'
                      }`}>
                        {inq.Status === 'ENGAGED_ON_MOBILE_AI' ? '📱 Mobile AI Engaged' : inq.Status}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {(inq.Status === 'ENGAGED_ON_MOBILE_AI' && !inq.Assigned_Staff) ? '🤖 24/7 AI Concierge' : `👤 ${inq.Assigned_Staff || 'Naresh & Naren'}`}
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
                      
                      {/* 📞 Immediate Direct Phone Call */}
                      {inq.Customer_Phone && (
                        <a 
                          href={`tel:${inq.Customer_Phone}`} 
                          className="btn-luxury-gold" 
                          title={`Direct Phone Call to ${inq.Customer_Name} (${inq.Customer_Phone})`}
                          style={{ padding: '5px 8px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                        >
                          <Phone size={13} />
                        </a>
                      )}

                      {/* ✏️ Edit Lead */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => openModal('edit_inquiry', { inquiry: inq })}
                        title="Edit Customer Lead, Budget & Follow-up Details"
                        style={{ padding: '5px 8px', fontSize: '11px' }}
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* 📲 WhatsApp Festive Catalog */}
                      <button 
                        className="btn-emerald" 
                        onClick={() => handleSendWhatsAppCatalog(inq)}
                        title="Send Curated WhatsApp Festive Catalog & EMI Scheme"
                        style={{ padding: '5px 8px', fontSize: '11px' }}
                      >
                        <Send size={13} />
                      </button>

                      {/* 📐 Schedule Mistri Visit */}
                      <button 
                        className="btn-purple" 
                        onClick={() => openModal('schedule_mistri_visit', { lead: inq })}
                        title="Schedule Free 3D Room Laser Measurement with Narayana Mistri"
                        style={{ padding: '5px 8px', fontSize: '11px' }}
                      >
                        📐 Mistri
                      </button>

                      {/* 🎙️ Voice POS Handoff */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => handleHandoffToVoicePos(inq)}
                        title="Transfer Customer to Tab 2 (Voice POS) to Close Booking"
                        style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--accent-cyan)', border: '1px solid rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.06)' }}
                      >
                        <Mic size={13} />
                      </button>

                      {/* ⚡ Convert to Order */}
                      {!inq.Status.includes('CONVERTED') && (
                        <button 
                          className="btn-emerald" 
                          onClick={() => openModal('convert_inquiry', { inquiry: inq })} 
                          title="1-Click Convert Lead to SafeLocked Order with Deposit"
                          style={{ padding: '5px 10px', fontSize: '11px' }}
                        >
                          ⚡ Convert
                        </button>
                      )}

                      {/* 🗑️ Delete / Void */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => handleDeleteLead(inq.Inquiry_ID)} 
                        title="Void / Cancel Lead"
                        style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={13} />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
