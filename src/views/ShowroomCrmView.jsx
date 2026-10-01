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
  Layers,
  X,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';
import { dispatchWebhookAction } from '../services/webhookService';
import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { EditableCell } from '../components/common/InlineCellRenderer';

export function ShowroomCrmView() {
  const { inquiries, setInquiries, openModal, setActiveTab, showToast, isDateInAuditWindow, auditDateWindow } = useStore();

  // Filters State
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 💬 Interactive WhatsApp Template Dispatcher State
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState(null);
  const [activeWhatsAppTemplate, setActiveWhatsAppTemplate] = useState('festive_offer');
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');

  // 📝 Lead Conversation Notes & Activity State
  const [selectedLeadForNotes, setSelectedLeadForNotes] = useState(null);
  const [newNoteInput, setNewNoteInput] = useState('');

  // 📝 Inline Cell Edit — editable fields in CRM table, saves to D1 'inquiries'
  const cellEdit = useInlineCellEdit({
    table: 'inquiries',
    pkField: 'Inquiry_ID',
    readOnly: ['AI_Intent_Score'],
    setRows: setInquiries,
    showToast
  });

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

      // 📅 Global Date Range Audit Window (From Date -> To Date)
      if (isDateInAuditWindow && !isDateInAuditWindow(inq.Inquiry_Date || inq.Created_Date || inq.Follow_Up_Date)) {
        return false;
      }

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [inquiries, filterStatus, filterCategory, searchQuery, isDateInAuditWindow, auditDateWindow]);

  // ⏰ Follow-up Cadence & Urgency Analyzer
  const getFollowUpUrgency = (dateStr) => {
    if (!dateStr) return { type: 'NONE', label: '📅 Not Set', color: '#94A3B8', bg: 'rgba(255,255,255,0.04)' };
    const str = String(dateStr).trim();
    const today = new Date().toISOString().slice(0, 10);
    
    if (str.toLowerCase().includes('today') || str.toLowerCase().includes('immediate')) {
      return { type: 'DUE_TODAY', label: '⚡ Due Today', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' };
    }
    if (str.toLowerCase().includes('tomorrow')) {
      return { type: 'TOMORROW', label: '📅 Tomorrow', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const iso = parsed.toISOString().slice(0, 10);
      if (iso < today) {
        return { type: 'OVERDUE', label: `🚨 Overdue (${str})`, color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.25)' };
      }
      if (iso === today) {
        return { type: 'DUE_TODAY', label: '⚡ Due Today', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.2)' };
      }
      return { type: 'FUTURE', label: `📅 ${str}`, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)' };
    }
    return { type: 'CUSTOM', label: str, color: '#CBD5E1', bg: 'rgba(255, 255, 255, 0.05)' };
  };

  // 🔄 1-Click Stage Transition Handler (Saves to D1)
  const handleQuickStatusChange = async (inqId, newStatus) => {
    setInquiries(prev => prev.map(inq => inq.Inquiry_ID === inqId ? { ...inq, Status: newStatus } : inq));
    await cellEdit.updateCell(inqId, 'Status', newStatus);
    showToast(`🔄 Lead #${inqId} status updated to ${newStatus}!`, true);
  };

  // 📝 Generate WhatsApp Dynamic Templates
  const getWhatsAppTemplateText = (inq, templateId) => {
    if (!inq) return '';
    const name = inq.Customer_Name || 'Ji';
    const models = inq.Category_Models || 'Premium Furniture Collection';
    const budget = Number(inq.Budget_INR || 0).toLocaleString('en-IN');
    const emiPerMonth = Math.round((Number(inq.Budget_INR || 60000) * 0.9) / 12).toLocaleString('en-IN');

    switch (templateId) {
      case 'festive_offer':
        return `🛋️ *Namaste ${name}! Greetings from Sri Vinayaka Furnitures (Godrej Interio Rayagada).*\n\n` +
          `Thank you for visiting our flagship showroom regarding *${models}* (Budget: ~₹${budget})!\n\n` +
          `✨ *Exclusive Showroom Privileges:*\n` +
          `• 🎁 Special 10% Festive Cash Voucher or Free Memory-Foam Pillows\n` +
          `• 💳 0% Interest EMI Scheme via Bajaj Finserv / HDFC with Zero Down Payment\n` +
          `• 🚚 100% Free Rain-Safe Delivery across Rayagada district\n\n` +
          `📖 Explore our live catalog: https://srivinayakafurnitures.pages.dev\n\n` +
          `Would you like us to block this piece in SafeLock holding before weekend stock allocation?\n\n` +
          `*Showroom Directors:* Naresh & Naren (+91 93905 53301)\n*Godrej Interio — Main Road, Rayagada*`;

      case 'mistri_visit':
        return `📐 *Free 3D Room Laser Measurement — Godrej Interio Rayagada*\n\n` +
          `Dear ${name},\n` +
          `We have scheduled a complimentary site inspection & laser measurement for your room layout regarding *${models}*.\n\n` +
          `👷 *Assigned Master Carpenter:* Narayana Mistri (+91 94371 88291)\n` +
          `📍 *Site Location:* ${inq.Address || 'Rayagada Town'}\n` +
          `🛠️ *Service Includes:* Laser precision wall check, modular clearance plan & skirting allowance.\n\n` +
          `Please reply with your preferred morning (10 AM - 1 PM) or evening (4 PM - 7 PM) slot.\n\n` +
          `*Sri Vinayaka Furnitures, Main Road, Rayagada*`;

      case 'emi_scheme':
        return `💳 *0% Down Payment EMI Options — Godrej Interio Rayagada*\n\n` +
          `Dear ${name},\n` +
          `Here is the verified financing breakdown for your selected *${models}* (₹${budget}):\n\n` +
          `• *12 Months EMI:* Just ~₹${emiPerMonth}/month (0% Interest)\n` +
          `• *Down Payment:* ₹0 / Token Advance of ₹5,000 only\n` +
          `• *Financing Partners:* Bajaj Finserv, HDFC Bank, TVS Credit\n` +
          `• *Instant Approval:* Just Aadhaar + PAN on counter (2-minute approval)\n\n` +
          `Visit us or reply to reserve with zero upfront cash!\n\n` +
          `*Naresh & Naren — +91 93905 53301*`;

      case 'quotation_link':
        return `📑 *Official Price Quotation & SafeLock Booking Link*\n\n` +
          `Dear ${name},\n` +
          `Your customized commercial proposal for *${models}* has been prepared:\n\n` +
          `• Gross Value: ₹${budget}\n` +
          `• Statutory GST: 18% HSN 9403 Compliant Tax Invoice Included\n` +
          `• Warranty: 5 Years Godrej Interio Official Seal\n\n` +
          `🔒 *To Lock Price & Staging:* Deposit 10% UPI advance to showroom VPA: 9390553301@ybl\n` +
          `Digital Ledger Ref: #${inq.Inquiry_ID}\n\n` +
          `*Sri Vinayaka Furnitures Flagship Showroom, Rayagada*`;

      case 'custom':
      default:
        return `Namaste ${name}, regarding your showroom inquiry for ${models} at Sri Vinayaka Furnitures, how can we assist you today? Feel free to call us at +91 93905 53301.`;
    }
  };

  // 📲 Open WhatsApp Dispatcher Modal
  const handleOpenWhatsAppModal = (inq) => {
    setSelectedLeadForWhatsApp(inq);
    setActiveWhatsAppTemplate('festive_offer');
    setCustomWhatsAppMsg(getWhatsAppTemplateText(inq, 'festive_offer'));
  };

  // 📲 Send Selected WhatsApp Message
  const handleSendSelectedWhatsApp = () => {
    if (!selectedLeadForWhatsApp) return;
    const phone = (selectedLeadForWhatsApp.Customer_Phone || '9437188291').replace(/[^0-9]/g, '').slice(-10);
    const text = customWhatsAppMsg;

    dispatchWebhookAction("DISPATCH_WHATSAPP_PO_DISPATCH", {
      inquiry_id: selectedLeadForWhatsApp.Inquiry_ID,
      phone: selectedLeadForWhatsApp.Customer_Phone,
      message: text
    });

    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
    showToast(`📲 WhatsApp dispatched to ${selectedLeadForWhatsApp.Customer_Name}!`, true);
    setSelectedLeadForWhatsApp(null);
  };

  // 📝 Open Conversation Notes Modal
  const handleOpenNotesModal = (inq) => {
    setSelectedLeadForNotes(inq);
    setNewNoteInput('');
  };

  // 📝 Add Note to Lead (Syncs with local & D1)
  const handleAddLeadNote = async () => {
    if (!newNoteInput.trim() || !selectedLeadForNotes) return;
    const nowStamp = `${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    const newEntry = `[${nowStamp} • Staff]: ${newNoteInput.trim()}`;
    const existingNotes = selectedLeadForNotes.Notes || '';
    const updatedNotes = existingNotes ? `${existingNotes}\n${newEntry}` : newEntry;

    // Update in memory
    setInquiries(prev => prev.map(inq => 
      inq.Inquiry_ID === selectedLeadForNotes.Inquiry_ID 
        ? { ...inq, Notes: updatedNotes } 
        : inq
    ));
    setSelectedLeadForNotes(prev => ({ ...prev, Notes: updatedNotes }));
    setNewNoteInput('');

    // Persist via cellEdit hook
    await cellEdit.updateCell(selectedLeadForNotes.Inquiry_ID, 'Notes', updatedNotes);
    showToast(`📝 Call note logged for ${selectedLeadForNotes.Customer_Name}!`, true);
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

        <div className="data-table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="luxury-table sheets-grid" style={{ width: '100%', fontSize: '11.5px' }}>
            <thead>
              <tr style={{ background: '#0B132B' }}>
                <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                <th>Lead ID</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Requirement & Models</th>
                <th style={{ textAlign: 'right' }}>Budget (₹)</th>
                <th>AI Buying Intent</th>
                <th>Follow-Up Schedule</th>
                <th>Status / Staff</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq, idx) => (
                <tr key={inq.Inquiry_ID}>
                  {/* Google Sheets Row Number Gutter */}
                  <td className="row-num" style={{ textAlign: 'center', color: '#94A3B8', fontFamily: 'JetBrains Mono', fontSize: '10.5px' }}>
                    {idx + 1}
                  </td>
                  
                  {/* Lead ID — Protected PK */}
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)', padding: '8px 10px' }}>
                    {inq.Inquiry_ID}
                  </td>

                  {/* Customer Name — Editable */}
                  <EditableCell
                    value={inq.Customer_Name} 
                    field="Customer_Name" 
                    rowIdx={idx}
                    pkVal={inq.Inquiry_ID} 
                    isProtected={false}
                    style={{ padding: '8px 10px', fontWeight: '700', color: '#FFFFFF' }}
                    {...cellEdit}
                  />

                  {/* Phone — Editable */}
                  <EditableCell
                    value={inq.Customer_Phone} 
                    field="Customer_Phone" 
                    rowIdx={idx}
                    pkVal={inq.Inquiry_ID} 
                    isProtected={false}
                    style={{ padding: '8px 10px', fontFamily: 'JetBrains Mono', color: 'var(--accent-cyan)' }}
                    {...cellEdit}
                  />

                  {/* Address — Editable */}
                  <EditableCell
                    value={inq.Address || inq.Locality_Address || 'Rayagada'} 
                    field="Address" 
                    rowIdx={idx}
                    pkVal={inq.Inquiry_ID} 
                    isProtected={false}
                    style={{ padding: '8px 10px', color: '#94A3B8', minWidth: '130px' }}
                    {...cellEdit}
                  />

                  {/* Requirements — Editable */}
                  <EditableCell
                    value={inq.Category_Models} field="Category_Models" rowIdx={idx}
                    pkVal={inq.Inquiry_ID} isProtected={false}
                    style={{ padding: '8px 10px', fontSize: '11.5px', fontWeight: '600' }}
                    {...cellEdit}
                  />

                  {/* Budget — Editable numeric */}
                  <EditableCell
                    value={inq.Budget_INR} field="Budget_INR" rowIdx={idx}
                    pkVal={inq.Inquiry_ID} isProtected={false} numeric
                    style={{ padding: '8px 10px', fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}
                    {...cellEdit}
                  >
                    ₹{(inq.Budget_INR || 0).toLocaleString()}
                  </EditableCell>

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

                  {/* Follow-up Date & Urgency Cadence */}
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <EditableCell
                        value={inq.Follow_Up_Date || 'Tomorrow'} field="Follow_Up_Date" rowIdx={idx}
                        pkVal={inq.Inquiry_ID} isProtected={false}
                        style={{ padding: '0', fontSize: '11px', color: '#E2E8F0', fontWeight: '600' }}
                        {...cellEdit}
                      />
                      {(() => {
                        const urgency = getFollowUpUrgency(inq.Follow_Up_Date);
                        return (
                          <span style={{
                            fontSize: '9px',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontWeight: '800',
                            background: urgency.bg,
                            color: urgency.color,
                            border: `1px solid ${urgency.color}55`,
                            display: 'inline-block',
                            width: 'fit-content'
                          }}>
                            {urgency.label}
                          </span>
                        );
                      })()}
                    </div>
                  </td>

                  {/* Status & Staff with 1-Click Stage Transition */}
                  <td style={{ padding: '8px 6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <select
                        value={inq.Status}
                        onChange={(e) => handleQuickStatusChange(inq.Inquiry_ID, e.target.value)}
                        style={{
                          background: inq.Status.includes('CONVERTED') ? 'rgba(34, 197, 94, 0.25)' : 
                                      inq.Status.includes('ENGAGED_ON_MOBILE_AI') ? 'rgba(56, 189, 248, 0.25)' :
                                      inq.Status.includes('MISTRI') ? 'rgba(168, 85, 247, 0.25)' : 
                                      inq.Status.includes('HOT') ? 'rgba(244, 63, 94, 0.25)' : 
                                      'rgba(245, 158, 11, 0.25)',
                          color: inq.Status.includes('CONVERTED') ? '#4ADE80' : 
                                 inq.Status.includes('ENGAGED_ON_MOBILE_AI') ? '#38BDF8' :
                                 inq.Status.includes('MISTRI') ? '#C084FC' : 
                                 inq.Status.includes('HOT') ? '#FB7185' : 
                                 '#FBBF24',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '4px',
                          padding: '2px 4px',
                          fontSize: '10.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                        title="1-Click Stage Transition (syncs directly to Cloudflare D1)"
                      >
                        <option value="NEW_HOT_LEAD" style={{ background: '#0F172A', color: '#FB7185' }}>🔥 New Hot Lead</option>
                        <option value="HOT_LEAD" style={{ background: '#0F172A', color: '#FB7185' }}>🔥 Hot Intent</option>
                        <option value="WARM_LEAD" style={{ background: '#0F172A', color: '#FBBF24' }}>⚡ Warm Lead</option>
                        <option value="ENGAGED_ON_MOBILE_AI" style={{ background: '#0F172A', color: '#38BDF8' }}>📱 Mobile AI Lead</option>
                        <option value="MISTRI_SCHEDULED" style={{ background: '#0F172A', color: '#C084FC' }}>📐 Mistri Scheduled</option>
                        <option value="QUOTATION_SHARED" style={{ background: '#0F172A', color: '#38BDF8' }}>📄 Quote Shared</option>
                        <option value="FOLLOW_UP" style={{ background: '#0F172A', color: '#FBBF24' }}>📅 Follow-Up Due</option>
                        <option value="CONVERTED" style={{ background: '#0F172A', color: '#4ADE80' }}>✅ Converted Order</option>
                        <option value="CANCELLED" style={{ background: '#0F172A', color: '#94A3B8' }}>❌ Void / Cold</option>
                      </select>
                      
                      <div style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>
                        {(inq.Status === 'ENGAGED_ON_MOBILE_AI' && !inq.Assigned_Staff) ? '🤖 24/7 AI Concierge' : `👤 ${inq.Assigned_Staff || 'Naresh & Naren'}`}
                      </div>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
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

                      {/* 📝 View & Log Call / Conversation Notes */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => handleOpenNotesModal(inq)}
                        title="View & Log Customer Conversation History & Notes"
                        style={{ padding: '5px 8px', fontSize: '11px', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.4)' }}
                      >
                        <MessageSquare size={13} />
                      </button>

                      {/* ✏️ Edit Lead */}
                      <button 
                        className="btn-ghost-edit" 
                        onClick={() => openModal('edit_inquiry', { inquiry: inq })}
                        title="Edit Customer Lead, Budget & Follow-up Details"
                        style={{ padding: '5px 8px', fontSize: '11px' }}
                      >
                        <Edit3 size={13} />
                      </button>

                      {/* 📲 WhatsApp Multi-Template Dispatcher */}
                      <button 
                        className="btn-emerald" 
                        onClick={() => handleOpenWhatsAppModal(inq)}
                        title="1-Click WhatsApp Personalized Template Dispatcher"
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

      {/* ============================================================== */}
      {/* 📲 1-CLICK WHATSAPP MULTI-TEMPLATE DISPATCHER MODAL */}
      {/* ============================================================== */}
      {selectedLeadForWhatsApp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '620px',
            width: '100%',
            background: '#0B132B',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#10B981', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={18} /> WhatsApp Customer Dispatcher
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '3px 0 0 0' }}>
                  Sending to <strong>{selectedLeadForWhatsApp.Customer_Name}</strong> ({selectedLeadForWhatsApp.Customer_Phone}) • Ref #{selectedLeadForWhatsApp.Inquiry_ID}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLeadForWhatsApp(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Template Selector Pills */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                Select Curated Message Template:
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'festive_offer', label: '🎁 Festive Offer & EMI' },
                  { id: 'mistri_visit', label: '📐 Mistri 3D Laser Measurement' },
                  { id: 'emi_scheme', label: '💳 0% Down Financing' },
                  { id: 'quotation_link', label: '📑 Price Quotation & Token' },
                  { id: 'custom', label: '💬 Custom Message' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveWhatsAppTemplate(t.id);
                      setCustomWhatsAppMsg(getWhatsAppTemplateText(selectedLeadForWhatsApp, t.id));
                    }}
                    className={`btn-ghost-edit ${activeWhatsAppTemplate === t.id ? 'badge-emerald' : ''}`}
                    style={{ fontSize: '11px', padding: '5px 10px', borderRadius: '6px' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview & Editor */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>Message Text (Editable before sending):</span>
                <span style={{ color: '#10B981' }}>✓ WhatsApp Markdown Supported</span>
              </label>
              <textarea
                rows={9}
                value={customWhatsAppMsg}
                onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '12px',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.5',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                className="btn-ghost-edit"
                onClick={() => setSelectedLeadForWhatsApp(null)}
                style={{ padding: '8px 16px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                className="btn-emerald"
                onClick={handleSendSelectedWhatsApp}
                style={{ padding: '8px 20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={14} /> Send via WhatsApp Web / App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 📝 CUSTOMER INTERACTION & CALL NOTES MODAL */}
      {/* ============================================================== */}
      {selectedLeadForNotes && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '580px',
            width: '100%',
            background: '#0B132B',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#38BDF8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} /> Customer Conversation Timeline
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '3px 0 0 0' }}>
                  Lead: <strong>{selectedLeadForNotes.Customer_Name}</strong> ({selectedLeadForNotes.Customer_Phone}) • {selectedLeadForNotes.Category_Models}
                </p>
              </div>
              <button 
                onClick={() => setSelectedLeadForNotes(null)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Conversation Log Box */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                Conversation History:
              </label>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '11.5px',
                color: '#E2E8F0',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedLeadForNotes.Notes ? (
                  selectedLeadForNotes.Notes
                ) : (
                  <span style={{ color: '#64748B', fontStyle: 'italic' }}>No call notes logged yet. Add the first conversation note below.</span>
                )}
              </div>
            </div>

            {/* New Note Input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                Add New Call Note / Discussion Summary:
              </label>
              <textarea
                rows={3}
                placeholder="E.g. Visited with family. Prefers walnut teak finish. Requested delivery before Dussehra. Follow-up Saturday morning."
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  padding: '10px',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10.5px', color: '#10B981' }}>
                ⚡ Auto-syncs to Cloudflare D1 Inquiries Table
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-ghost-edit"
                  onClick={() => setSelectedLeadForNotes(null)}
                  style={{ padding: '7px 14px', fontSize: '11.5px' }}
                >
                  Close
                </button>
                <button
                  className="btn-luxury-gold"
                  onClick={handleAddLeadNote}
                  disabled={!newNoteInput.trim()}
                  style={{ padding: '7px 18px', fontSize: '11.5px', opacity: newNoteInput.trim() ? 1 : 0.5 }}
                >
                  ➕ Log Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
