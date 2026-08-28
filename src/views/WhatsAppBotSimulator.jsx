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
  RotateCcw,
  LayoutGrid,
  Columns,
  Layers,
  ArrowRight
} from 'lucide-react';
import { playScanBeep, playSuccessChime, triggerGoldenConfetti } from '../utils/audioUtils';

export function WhatsAppBotSimulator() {
  const { bots, triggerAppSheetBot, openModal, showToast } = useStore();

  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'SPLIT' | 'PHONE'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

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
        : `⚡ Automated Cloud Trigger Executed: Target [${b.target}]. Status: EXECUTED_SUCCESS ✓`,
      time: "Just Now"
    };
    setChatMessages(prev => [...prev, newBotMsg]);
    playSuccessChime();
    showToast(`⚡ Dispatched simulated webhook for ${b.botId}!`, true);
  };

  // Helper to categorize bots
  const getBotCategory = (botId) => {
    const idNum = parseInt(botId.replace('BOT-', ''), 10);
    if ([1, 14, 16].includes(idNum)) return 'SALES';
    if ([2, 3, 13, 18].includes(idNum)) return 'WAREHOUSE';
    if ([4, 5, 6, 9].includes(idNum)) return 'LOGISTICS';
    if ([7, 10, 12, 19].includes(idNum)) return 'FINANCE';
    return 'SYSTEM';
  };

  const filteredBots = bots.filter(b => {
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.botId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.target || '').toLowerCase().includes(searchQuery.toLowerCase());

    const botCat = getBotCategory(b.botId);
    const matchesCategory = 
      categoryFilter === 'ALL' ? true :
      categoryFilter === 'ACTIVE' ? b.status !== 'PAUSED' :
      categoryFilter === 'PAUSED' ? b.status === 'PAUSED' :
      botCat === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon & View Mode Selector */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span className="badge badge-emerald">💬 WHATSAPP & 20 APPSHEET AUTOMATION BOTS</span>
          <span className="badge badge-purple">{bots.filter(b => b.status !== 'PAUSED').length}/{bots.length} ACTIVE</span>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button 
            className={`btn-ghost-edit ${viewMode === 'GRID' ? 'badge-gold' : ''}`}
            onClick={() => setViewMode('GRID')}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            <LayoutGrid size={13} /> 🎛️ 20-Bot Control Tower
          </button>
          
          <button 
            className={`btn-ghost-edit ${viewMode === 'SPLIT' ? 'badge-gold' : ''}`}
            onClick={() => setViewMode('SPLIT')}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            <Columns size={13} /> ⚡ Side-by-Side Dual View
          </button>

          <button 
            className={`btn-ghost-edit ${viewMode === 'PHONE' ? 'badge-gold' : ''}`}
            onClick={() => setViewMode('PHONE')}
            style={{ fontSize: '11px', padding: '6px 12px' }}
          >
            <Smartphone size={13} /> 📱 Phone Simulator Focus
          </button>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              placeholder="Search bot name, trigger condition, or webhook target..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#0B132B',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '8px 12px 8px 34px',
                color: '#FFFFFF',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          {/* Department Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Bots (20)' },
              { id: 'SALES', label: '🛒 Sales & Quotes (3)' },
              { id: 'WAREHOUSE', label: '🔒 Warehouse & SafeLock (4)' },
              { id: 'LOGISTICS', label: '🚚 Fleet & ePOD (4)' },
              { id: 'FINANCE', label: '🏛️ Finance & Cash Lock (4)' },
              { id: 'SYSTEM', label: '⚙️ Cloud Sync & Audit (5)' },
              { id: 'ACTIVE', label: '🟢 Active Only' },
              { id: 'PAUSED', label: '⏸️ Paused Only' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id)}
                className={`btn-ghost-edit ${categoryFilter === f.id ? 'badge-gold' : ''}`}
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* VIEW MODE 1: FULL-WIDTH 20-BOT MASTER CONTROL TOWER (GRID) */}
      {viewMode === 'GRID' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {filteredBots.map((b, idx) => {
            const isPaused = b.status === 'PAUSED';
            const cat = getBotCategory(b.botId);

            return (
              <div 
                key={b.botId || idx}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  borderLeft: `5px solid ${isPaused ? '#64748B' : (b.color || '#D4AF37')}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  opacity: isPaused ? 0.65 : 1,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', fontWeight: '900', color: b.color || 'var(--accent-gold-light)' }}>
                        {b.botId}
                      </span>
                      <span className="badge badge-purple" style={{ fontSize: '9px' }}>
                        {cat}
                      </span>
                    </div>

                    <span className={`badge ${isPaused ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '9px', padding: '3px 8px' }}>
                      {isPaused ? '⏸️ PAUSED' : '🟢 ACTIVE'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    {b.name}
                  </h4>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    ⚡ <b>Trigger Rule:</b> <span style={{ color: '#FFFFFF' }}>{b.trigger}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                    🎯 <b>Target:</b> {b.target}
                  </div>

                  {b.threshold && (
                    <div style={{ fontSize: '10.5px', color: 'var(--accent-gold-light)', marginTop: '4px' }}>
                      ⚙️ <b>Condition:</b> {b.threshold} • {b.schedule || 'Instant Webhook'}
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: '4px' }}>
                  <button 
                    className="btn-ghost-edit" 
                    onClick={() => openModal('edit_bot_config', { bot: b })}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '8px 12px', color: 'var(--accent-gold-light)' }}
                  >
                    <Settings size={13} /> ⚙️ Configure Bot
                  </button>

                  <button 
                    className="btn-emerald" 
                    onClick={() => handleTestBot(b)}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '8px 12px' }}
                  >
                    <Play size={13} /> ▶ Test Trigger
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: SPLIT DUAL VIEW (PHONE + BOTS LIST) */}
      {viewMode === 'SPLIT' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '20px', alignItems: 'start' }}>
          
          {/* Smartphone Simulator */}
          <div style={{ background: '#0B141B', border: '3.5px solid #334155', borderRadius: '32px', padding: '14px', height: '620px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(37,211,102,0.15)' }}>
            <div style={{ width: '100px', height: '14px', background: '#1E293B', borderRadius: '8px', margin: '0 auto 8px auto' }} />

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
              <button onClick={() => setChatMessages(prev => prev.slice(0, 3))} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} title="Reset Chat Screen">
                <RotateCcw size={14} />
              </button>
            </div>

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

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', padding: '4px' }}>
              <input 
                placeholder="Ask bot: 'Send quote for king bed'..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, background: '#1F2C34', border: 'none', borderRadius: '20px', padding: '10px 16px', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
              />
              <button onClick={handleSendChat} style={{ background: '#00A884', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Right Column: Scrollable Bots List */}
          <div style={{ maxHeight: '620px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
            {filteredBots.map((b, idx) => (
              <div 
                key={b.botId || idx}
                className="glass-panel"
                style={{
                  padding: '12px 16px',
                  borderLeft: `4px solid ${b.status === 'PAUSED' ? '#64748B' : (b.color || '#D4AF37')}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: '900', color: b.color || 'var(--accent-gold-light)' }}>
                      {b.botId}
                    </span>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF' }}>{b.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    ⚡ {b.trigger} ➔ <span style={{ color: 'var(--accent-cyan)' }}>{b.target}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className="btn-ghost-edit" 
                    onClick={() => openModal('edit_bot_config', { bot: b })}
                    style={{ fontSize: '10.5px', padding: '6px 8px' }}
                  >
                    <Settings size={12} /> ⚙️
                  </button>
                  <button 
                    className="btn-emerald" 
                    onClick={() => handleTestBot(b)}
                    style={{ fontSize: '10.5px', padding: '6px 10px' }}
                  >
                    <Play size={12} /> Test
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* VIEW MODE 3: FULL PHONE FOCUS */}
      {viewMode === 'PHONE' && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
          <div style={{ background: '#0B141B', border: '4px solid #334155', borderRadius: '36px', padding: '16px', width: '420px', height: '660px', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.95), 0 0 50px rgba(37,211,102,0.2)' }}>
            <div style={{ width: '120px', height: '16px', background: '#1E293B', borderRadius: '10px', margin: '0 auto 10px auto' }} />

            <div style={{ background: '#1F2C34', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#FFFFFF', fontSize: '14px' }}>
                GI
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF' }}>Godrej Interio Rayagada</div>
                <div style={{ fontSize: '11px', color: '#25D366' }}>Online • AI Bot Active (+91 93905 53301)</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px', background: '#081015', borderRadius: '16px' }}>
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? '#005C4B' : '#1F2C34',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '10px 14px',
                    maxWidth: '88%',
                    fontSize: '12.5px',
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
                  <div style={{ fontSize: '9.5px', color: '#8696A0', textAlign: 'right', marginTop: '4px' }}>
                    {msg.time} {msg.sender === 'user' && '✓✓'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input 
                placeholder="Ask bot: 'Send quote for king bed'..."
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, background: '#1F2C34', border: 'none', borderRadius: '20px', padding: '12px 18px', color: '#FFFFFF', fontSize: '13px', outline: 'none' }}
              />
              <button onClick={handleSendChat} style={{ background: '#00A884', border: 'none', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
