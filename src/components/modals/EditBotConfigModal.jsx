import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Bot, 
  Check, 
  Save, 
  Zap, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  Sliders, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { playSuccessChime, triggerGoldenConfetti } from '../../utils/audioUtils';
import { dispatchWebhookAction } from '../../services/webhookService';

export function EditBotConfigModal({ isOpen, onClose, bot = {} }) {
  const { updateBotConfig, showToast } = useStore();

  const [botName, setBotName] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [trigger, setTrigger] = useState('On New Order');
  const [schedule, setSchedule] = useState('Instant Real-Time');
  const [targetChannel, setTargetChannel] = useState('WhatsApp Cloud + Google Sheets');
  const [template, setTemplate] = useState('');
  const [threshold, setThreshold] = useState('Buffer <= 2 Units');

  // Sync state dynamically whenever a new bot is selected or modal opens
  useEffect(() => {
    if (isOpen && bot) {
      setBotName(bot.name || '');
      setStatus(bot.status || 'ACTIVE');
      setTrigger(bot.trigger || 'On New Order');
      setSchedule(bot.schedule || 'Instant Real-Time');
      setTargetChannel(bot.targetChannel || 'WhatsApp Cloud + Google Sheets');
      setTemplate(
        bot.customTemplate || 
        `Namaskar {Customer_Name}! Your Godrej Interio order {Order_ID} is SAFELOCKED. Advance Token Received: ₹{Advance_Amount}. Est Delivery: {Delivery_Date}. Helpline: +91 9390553301.`
      );
      setThreshold(bot.threshold || 'Buffer <= 2 Units');
    }
  }, [isOpen, bot]);

  if (!isOpen || !bot || !bot.botId) return null;

  const handleSave = () => {
    const updated = {
      ...bot,
      name: botName,
      status: status,
      trigger: trigger,
      schedule: schedule,
      targetChannel: targetChannel,
      customTemplate: template,
      threshold: threshold
    };

    if (updateBotConfig) {
      updateBotConfig(bot.botId, updated);
    }

    playSuccessChime();
    triggerGoldenConfetti();
    showToast(`⚙️ Successfully updated & synced Bot Configuration for ${bot.botId} (${botName})!`, true);

    dispatchWebhookAction('UPDATE_BOT_CONFIG', {
      bot_id: bot.botId,
      name: botName,
      status: status,
      trigger: trigger,
      schedule: schedule,
      channel: targetChannel,
      template: template,
      threshold: threshold,
      updated_by: "Store Director (Rakesh)"
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-card glass-panel" 
        style={{ 
          maxWidth: '650px', 
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
              <Bot size={28} style={{ color: 'var(--accent-gold-light)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge badge-gold">{bot.botId}</span>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF', margin: 0 }}>
                  Configure Automation Bot
                </h2>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                Customize trigger rules, execution frequency, WhatsApp message templates & channels
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Master Status Toggle */}
        <div style={{ background: '#030712', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#FFFFFF' }}>Bot Operational Status</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Toggle this bot active or pause automation temporarily</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setStatus('ACTIVE')}
              style={{
                background: status === 'ACTIVE' ? 'linear-gradient(135deg, var(--accent-emerald), #047857)' : 'rgba(255,255,255,0.05)',
                color: status === 'ACTIVE' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: '900',
                border: status === 'ACTIVE' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🟢 ACTIVE
            </button>
            <button
              type="button"
              onClick={() => setStatus('PAUSED')}
              style={{
                background: status === 'PAUSED' ? 'linear-gradient(135deg, var(--accent-amber), #B45309)' : 'rgba(255,255,255,0.05)',
                color: status === 'PAUSED' ? '#000000' : 'var(--text-secondary)',
                fontWeight: '900',
                border: status === 'PAUSED' ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ⏸️ PAUSED
            </button>
          </div>
        </div>

        {/* Configuration Form Grid */}
        <div className="form-grid" style={{ marginBottom: '16px' }}>
          
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <label>Bot Display Name & Objective</label>
            <input value={botName} onChange={e => setBotName(e.target.value)} />
          </div>

          <div className="form-field">
            <label>Execution Trigger Condition</label>
            <select value={trigger} onChange={e => setTrigger(e.target.value)}>
              <option value="On New Order">On New SafeLock Order Reservation</option>
              <option value="On SafeLock Lock">On Inventory Stock Lock</option>
              <option value="On Staging Complete">On 5-Box Staging Bay Complete</option>
              <option value="On Dispatch">On Outward Dock Dispatch</option>
              <option value="On Customer Signature">On Customer Digital ePOD Signature</option>
              <option value="On Buffer Deficit">On Low Stock Buffer Deficit</option>
              <option value="Daily 21:00 IST">Daily 9 PM Showroom Cash Lock</option>
              <option value="Hourly Cron">Hourly Universal Deduplication</option>
              <option value="Manual / Scheduled">Manual / Scheduled Trigger</option>
            </select>
          </div>

          <div className="form-field">
            <label>Execution Frequency / Schedule</label>
            <select value={schedule} onChange={e => setSchedule(e.target.value)}>
              <option value="Instant Real-Time">Instant Real-Time Webhook (Sub-100ms)</option>
              <option value="Scheduled Daily at 21:00">Scheduled Daily at 21:00 IST</option>
              <option value="Scheduled Hourly">Scheduled Hourly</option>
              <option value="Manual Dispatch Only">Manual Staff Trigger Only</option>
            </select>
          </div>

          <div className="form-field">
            <label>Target Channel & Webhook Route</label>
            <select value={targetChannel} onChange={e => setTargetChannel(e.target.value)}>
              <option value="WhatsApp Cloud + Google Sheets">WhatsApp Business Cloud + Google Sheets</option>
              <option value="Customer SMS OTP Gateway">Customer SMS OTP Gateway</option>
              <option value="Owner Telegram / Email Slip">Owner Telegram / Email Slip</option>
              <option value="Fleet Driver Mobile App">Fleet Driver Mobile App Route</option>
              <option value="Supplier WhatsApp PO">Factory Supplier WhatsApp PO</option>
            </select>
          </div>

          <div className="form-field">
            <label>Safety Threshold / Rule Condition</label>
            <input value={threshold} onChange={e => setThreshold(e.target.value)} placeholder="e.g. Buffer <= 2 Units" />
          </div>

          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ margin: 0 }}>Custom WhatsApp Message Payload Template</label>
              <span style={{ fontSize: '10.5px', color: 'var(--accent-cyan)' }}>Variables: &#123;Customer_Name&#125;, &#123;Order_ID&#125;, &#123;Amount&#125;, &#123;OTP&#125;</span>
            </div>
            <textarea 
              rows={4}
              value={template} 
              onChange={e => setTemplate(e.target.value)}
              style={{
                width: '100%',
                background: '#0B132B',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

        </div>

        {/* Modal Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <button className="btn-ghost-edit" onClick={onClose}>
            Cancel
          </button>
          
          <button 
            className="btn-luxury-gold" 
            onClick={handleSave}
            style={{ padding: '12px 24px', fontSize: '13px', fontWeight: '900' }}
          >
            <Save size={16} /> 💾 Save Configuration & Sync to Google Sheets
          </button>
        </div>

      </div>
    </div>
  );
}
