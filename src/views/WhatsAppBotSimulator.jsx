import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Smartphone, 
  Send, 
  Bot, 
  Sparkles, 
  Check, 
  Play, 
  MessageSquare, 
  Zap, 
  PhoneCall, 
  Settings, 
  Sliders, 
  Search, 
  Filter,
  CheckCircle,
  PauseCircle,
  RotateCcw
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function WhatsAppBotSimulator() {
  const { bots, triggerAppSheetBot, openModal, showToast } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'PAUSED'

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", title: "Godrej Interio Assistant", text: "Namaskar! Welcome to Godrej Interio Rayagada Flagship Showroom AI Assistant. How can I assist you with bedroom suites, recliner sofas, or delivery tracking today?", time: "10:30 AM" },
    { id: 2, sender: "user", text: "Can you send the quote for the Solid King Bed with Hydraulic Storage?", time: "10:31 AM" },
    { id: 3, sender: "bot", title: "SafeLock Quote Bot (BOT-01)", text: "Here is your VIP Quotation for Solid King Bed (Hydraulic Storage - BED-MOD-001) in 100% Solid CP Teak Wood: MRP ₹1,11,000 ➔ Showroom Price: ₹89,790 (Save ₹21,210). 10-Year Warranty included! Would you like to reserve with 50% advance token?", time: "10:31 AM" }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const handleSendChat = () => {
    if (!inputMsg.trim()) return;
    const userMsg = { id: Date.now(), sender: "user", text: inputMsg, time: "Just Now" };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    playScanBeep();

    setTimeout(() => {
      const botReply = {
        id: Date.now() + 1,
        sender: "bot",
        title: "OmniBuild AI Bot",
        text: `Namaskar! Our Rayagada showroom executive has received your request regarding: "${userMsg.text}". Stock is currently SAFELOCKED for express delivery!`,
        time: "Just Now"
      };
      setChatMessages(prev => [...prev, botReply]);
      playSuccessChime();
    }, 600);
  };

  const handleTestBot = (b) => {
    triggerAppSheetBot(b.botId, b.name);
    const newBotMsg = {
      id: Date.now(),
      sender: "bot",
      title: `${b.name} (${b.botId})`,
      text: b.customTemplate 
        ? b.customTemplate.replace('{Customer_Name}', 'Dr. Subhashish Jena').replace('{Order_ID}', 'ORD-8921').replace('{Advance_Amount}', '78,247').replace('{Delivery_Date}', 'Today 04:30 PM')
        : `⚡ Automated Notification Triggered: Target [${b.target}]. Status: EXECUTED_SUCCESS ✓`,
      time: "Just Now"
    };
    setChatMessages(prev => [...prev, newBotMsg]);
    playSuccessChime();
  };

  const filteredBots = bots.filter(b => {
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.botId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.target || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      filterStatus === 'ALL' ? true :
      b.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald">💬 WHATSAPP AI ASSISTANT & 20 APPSHEET BOTS</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Automated Cloud Webhook Execution Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-purple">{bots.filter(b => b.status !== 'PAUSED').length}/{bots.length} BOTS ACTIVE</span>
          <span className="badge badge-gold">2-WAY SYNC READY</span>
        </div>
      </div>

      {/* Main Grid: Smartphone Simulator + AppSheet 20-Bot Cloud Control */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.35fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Smartphone Simulator */}
        <div style={{ background: '#0B141B', border: '3.5px solid #334155', borderRadius: '32px', padding: '14px', height: '640px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(37,211,102,0.15)' }}>
          {/* Top Notch */}
          <div style={{ width: '100px', height: '14px', background: '#1E293B', borderRadius: '8px', margin: '0 auto 8px auto' }} />

          {/* WhatsApp Header */}
          <div style={{ background: '#1F2C34', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#FFFFFF', fontSize: '13px' }}>
                GI
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>Godrej Interio Rayagada</div>
                <div style={{ fontSize: '10px', color: '#25D366' }}>Online • AI Bot Active (+91 93905 53301)</div>
              </div>
            </div>
            <button 
              onClick={() => setChatMessages(prev => prev.slice(0, 3))}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              title="Reset Chat Screen"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Chat Messages Screen */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '8px', background: '#081015', borderRadius: '14px' }}>
            {chatMessages.map(msg => (
              <div 
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#005C4B' : '#1F2C34',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  padding: '10px 12px',
                  maxWidth: '92%',
                  fontSize: '12px',
                  color: '#E9EDEF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  borderLeft: msg.sender === 'bot' ? '3px solid #25D366' : 'none'
                }}
              >
                {msg.title && (
                  <div style={{ fontSize: '10px', fontWeight: '900', color: '#25D366', textTransform: 'uppercase', marginBottom: '3px' }}>
                    {msg.title}
                  </div>
                )}
                <div style={{ lineHeight: '1.45' }}>{msg.text}</div>
                <div style={{ fontSize: '9px', color: '#8696A0', textAlign: 'right', marginTop: '4px' }}>
                  {msg.time} {msg.sender === 'user' && '✓✓'}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Chat Input Bar */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', padding: '4px' }}>
            <input 
              placeholder="Ask bot: 'Send quote for king bed'..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              style={{
                flex: 1,
                background: '#1F2C34',
                border: 'none',
                borderRadius: '20px',
                padding: '10px 16px',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button 
              onClick={handleSendChat}
              style={{
                background: '#00A884',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,168,132,0.4)'
              }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>

        {/* 20 AppSheet Automation Bots Control Center with Configure Modals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Header & Search/Filter Controls */}
          <div className="glass-panel" style={{ padding: '14px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>
                  🤖 20 Active Cloud Automation Bots & Trigger Matrix
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Click <b>⚙️ Configure</b> to edit thresholds, schedules & templates, or <b>▶ Test</b> to simulate.
                </span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  placeholder="Search bot name, trigger, or target..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0B132B',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    padding: '6px 10px 6px 30px',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {['ALL', 'ACTIVE', 'PAUSED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`btn-ghost-edit ${filterStatus === st ? 'badge-gold' : ''}`}
                    style={{ fontSize: '10.5px', padding: '4px 10px' }}
                  >
                    {st === 'ALL' ? 'All (20)' : st === 'ACTIVE' ? '🟢 Active' : '⏸️ Paused'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Bots List */}
          <div style={{ maxHeight: '530px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            {filteredBots.map((b, idx) => {
              const isPaused = b.status === 'PAUSED';

              return (
                <div 
                  key={b.botId || idx}
                  className="glass-panel"
                  style={{
                    padding: '12px 16px',
                    borderLeft: `4px solid ${isPaused ? '#64748B' : (b.color || '#D4AF37')}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: isPaused ? 0.6 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '10.5px', fontWeight: '900', color: b.color || 'var(--accent-gold-light)' }}>
                        {b.botId}
                      </span>
                      <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>
                        {b.name}
                      </span>
                      <span className={`badge ${isPaused ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '8.5px', padding: '2px 6px' }}>
                        {isPaused ? '⏸️ PAUSED' : '🟢 ACTIVE'}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      ⚡ <b>Trigger:</b> {b.trigger} ➔ <b>Target:</b> <span style={{ color: 'var(--accent-cyan)' }}>{b.target}</span>
                    </div>

                    {b.threshold && (
                      <div style={{ fontSize: '10px', color: 'var(--accent-gold-light)', marginTop: '2px' }}>
                        ⚙️ Rule: {b.threshold} • {b.schedule || 'Instant Webhook'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    
                    {/* Configure Bot Modal Button */}
                    <button 
                      className="btn-ghost-edit" 
                      onClick={() => openModal('edit_bot_config', { bot: b })}
                      style={{ fontSize: '10.5px', padding: '6px 10px', color: 'var(--accent-gold-light)' }}
                      title="Edit Trigger Rules & Message Templates"
                    >
                      <Settings size={12} /> ⚙️ Configure
                    </button>

                    {/* Test Trigger Button */}
                    <button 
                      className="btn-emerald" 
                      onClick={() => handleTestBot(b)}
                      style={{ fontSize: '10.5px', padding: '6px 12px' }}
                      title="Simulate Real-Time Trigger"
                    >
                      <Play size={12} /> ▶ Test
                    </button>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
