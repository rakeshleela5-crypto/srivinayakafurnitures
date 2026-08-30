import React, { useState } from 'react';
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
  Flame
} from 'lucide-react';

export function ShowroomCrmView() {
  const { inquiries, openModal } = useStore();

  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredInquiries = inquiries.filter(i => {
    if (filterStatus === 'ALL') return true;
    return i.Status === filterStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-rose">👥 SHOWROOM CRM & FOOTFALL LEADS</span>
          <button className="btn-luxury-gold" onClick={() => openModal('furniture_followup', { lead: filteredInquiries[0] || {} })}>
            ⏳ 48h Smart Follow-Up Manager
          </button>
          <button className="btn-cyan" onClick={() => openModal('bulk_bot_broadcast')}>
            📢 Bulk 500-Customer Bot Broadcast
          </button>
          <button className="btn-ghost-edit" onClick={() => openModal('new_inquiry')}>
            <UserPlus size={14} /> ➕ Log Walk-In Lead
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">AI INTENT BUYING SCORE ACTIVE</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['ALL', 'HOT_LEAD', 'FOLLOW_UP', 'CONVERTED_TO_ORDER ✓'].map(tab => (
          <button 
            key={tab} 
            className={`btn-ghost-edit ${filterStatus === tab ? 'badge-gold' : ''}`}
            onClick={() => setFilterStatus(tab)}
            style={{ fontSize: '11.5px', padding: '6px 14px' }}
          >
            {tab === 'ALL' ? '📋 All Showroom Leads' : tab === 'HOT_LEAD' ? '🔥 Hot Leads (90%+ Intent)' : tab === 'FOLLOW_UP' ? '📅 Follow-Up Queue' : '✅ Converted Orders'}
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Showroom Walk-In CRM & AI Buying Intent</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Direct 2-way reflection from Inquiries_Log Google Sheets</span>
          </div>
          <span className="badge badge-purple">{filteredInquiries.length} Leads in Queue</span>
        </div>

        <div className="data-table-wrapper">
          <table className="luxury-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Customer & Phone</th>
                <th>Requirement & Models</th>
                <th>Budget (₹)</th>
                <th>AI Buying Score</th>
                <th>⏳ 48h Drip Sequence</th>
                <th>Status / Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inq, idx) => (
                <tr key={inq.Inquiry_ID}>
                  <td style={{ fontFamily: 'JetBrains Mono', fontWeight: '800', color: 'var(--accent-cyan)' }}>{inq.Inquiry_ID}</td>
                  <td>
                    <div style={{ fontWeight: '800', color: '#FFFFFF' }}>{inq.Customer_Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>📞 {inq.Customer_Phone}</div>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '600' }}>{inq.Category_Models}</td>
                  <td style={{ fontWeight: '800', color: 'var(--accent-gold-light)', fontFamily: 'JetBrains Mono' }}>
                    ₹{(inq.Budget_INR || 0).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className={`badge ${inq.AI_Intent_Score >= 80 ? 'badge-rose' : 'badge-amber'}`}>
                        {inq.AI_Intent_Score}% {inq.AI_Intent_Score >= 80 ? '🔥 HOT' : '⚡ WARM'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {inq.Status.includes('CONVERTED') ? (
                      <span className="badge badge-emerald" style={{ fontSize: '10px' }}>🛑 Token Paid (Auto-Stopped)</span>
                    ) : idx % 2 === 0 ? (
                      <span className="badge badge-cyan" style={{ fontSize: '10px' }}>🕒 Due in 42h (01-Sep)</span>
                    ) : (
                      <span className="badge badge-gold" style={{ fontSize: '10px' }}>✅ Sent Today (0% EMI)</span>
                    )}
                  </td>
                  <td>
                    <div>
                      <span className={`badge ${inq.Status.includes('CONVERTED') ? 'badge-emerald' : 'badge-gold'}`}>
                        {inq.Status}
                      </span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>👤 {inq.Assigned_Staff}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {!inq.Status.includes('CONVERTED') && (
                        <button className="btn-emerald" onClick={() => openModal('convert_inquiry', { inquiry: inq })} style={{ padding: '3px 6px', fontSize: '10.5px' }}>
                          ⚡ Convert
                        </button>
                      )}
                      <button className="btn-luxury-gold" onClick={() => openModal('furniture_followup', { lead: inq })} style={{ padding: '3px 6px', fontSize: '10.5px' }}>
                        ⏳ Follow-Up
                      </button>
                      <button className="btn-cyan" onClick={() => openModal('godrej_care_amc', { customer: { Customer_Name: inq.Customer_Name, Phone: inq.Customer_Phone } })} style={{ padding: '3px 6px', fontSize: '10.5px' }}>
                        🧼 AMC
                      </button>
                      <button className="btn-ghost-edit" onClick={() => openModal('edit_inquiry', { inquiry: inq })} style={{ padding: '3px 6px', fontSize: '10.5px' }}>
                        ✏️
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
