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
  PhoneCall
} from 'lucide-react';
import { playScanBeep, playSuccessChime } from '../utils/audioUtils';

export function WhatsAppBotSimulator() {
  const { bots, triggerAppSheetBot, showToast } = useStore();

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "bot", title: "Godrej Interio Assistant", text: "Namaskar! Welcome to Godrej Interio Rayagada Flagship Showroom AI Assistant. How can I assist you with bedroom suites, recliner sofas, or delivery tracking today?", time: "10:30 AM" },
    { id: 2, sender: "user", text: "Can you send the quote for the Solid King Bed with Hydraulic Storage?", time: "10:31 AM" },
    { id: 3, sender: "bot", title: "SafeLock Quote Bot", text: "Here is your VIP Quotation for Solid King Bed (Hydraulic Storage - BED-MOD-001) in 100% Solid CP Teak Wood: MRP ₹1,11,000 ➔ Showroom Price: ₹89,790 (Save ₹21,210). 10-Year Warranty included! Would you like to reserve with 50% advance token?", time: "10:31 AM" }
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Action Ribbon */}
      <div className="tab-action-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">💬 WHATSAPP AI ASSISTANT & 20 APPSHEET BOTS</span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Automated Cloud Webhook Execution Hub</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-purple">20 BOTS ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: Smartphone Simulator + AppSheet 20-Bot Cloud Control */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Smartphone Simulator */}
        <div style={{ background: '#0B141B', border: '3.5px solid #334155', borderRadius: '32px', padding: '14px', height: '620px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(37,211,102,0.15)' }}>
          {/* Top Notch */}
          <div style={{ width: '100px', height: '14px', background: '#1E293B', borderRadius: '8px', margin: '0 auto 8px auto' }} />

          {/* WhatsApp Header */}
          <div style={{ background: '#1F2C34', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #047857)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#FFFFFF', fontSize: '13px' }}>
              GI
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>Godrej Interio Rayagada</div>
              <div style={{ fontSize: '10px', color: '#25D366' }}>Online • AI Bot Active</div>
            </div>
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
                  maxWidth: '90%',
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
                <div>{msg.text}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textAlign: 'right', marginTop: '4px' }}>
                  {msg.time}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', background: '#1F2C34', padding: '6px 10px', borderRadius: '20px' }}>
            <input 
              placeholder="Type message to AI showroom bot..."
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              style={{ flex: 1, background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '12px', outline: 'none' }}
            />
            <button 
              type="button" 
              onClick={handleSendChat}
              style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#00A884', color: '#FFFFFF', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>

        {/* 20 AppSheet Cloud Automation Bots Grid */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>🤖 AppSheet 20-Bot Cloud Automation Trigger Cockpit</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>1-Click manual or webhook execution of AppSheet enterprise bots</span>
            </div>
            <span className="badge badge-emerald">WEBHOOK 200 OK</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', maxHeight: '520px', overflowY: 'auto' }}>
            {bots.map(bot => (
              <div 
                key={bot.botId}
                style={{
                  background: '#030712',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '9.5px' }}>{bot.botId}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{bot.trigger}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>{bot.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Target: {bot.target}</div>
                </div>

                <button 
                  className="btn-luxury-gold" 
                  onClick={() => triggerAppSheetBot(bot.botId, bot.name)}
                  style={{ padding: '6px 12px', fontSize: '11px', justifyContent: 'center' }}
                >
                  <Play size={12} /> Trigger Bot Cloud Action
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
