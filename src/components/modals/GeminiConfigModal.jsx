import React, { useState } from 'react';
import { Sparkles, Key, CheckCircle2, ShieldCheck, ExternalLink, X, Info, Trash2 } from 'lucide-react';
import { getGeminiApiKey, saveGeminiApiKey } from '../../services/geminiService';

export function GeminiConfigModal({ isOpen, onClose }) {
  const [key, setKey] = useState(getGeminiApiKey() || '');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveGeminiApiKey(key);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    saveGeminiApiKey('');
    setKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden">
        {/* Glow Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                <Sparkles size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Google Gemini AI Studio Engine
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    Free Tier (15 RPM)
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Powering Ask My Showroom, Vision QC, and Regional WhatsApp Concierge</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-xl flex items-start gap-3">
            <Info size={18} className="text-indigo-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-300 leading-relaxed">
              Google Gemini 1.5 Flash provides a generous <strong>100% Free Forever Tier</strong> (15 requests/minute). 
              Your key stays locally saved in your browser and is never sent to third parties.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Gemini API Key (Google AI Studio)</span>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
              >
                Get Free API Key <ExternalLink size={12} />
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-mono"
              />
              <Key size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
              {key && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 text-slate-500 hover:text-rose-400 transition"
                  title="Clear Key"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              {key ? "🟢 Custom Gemini API Key is configured and active." : "🟡 Using built-in local intelligent showroom neural fallback."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Model</span>
              <span className="text-xs font-bold text-indigo-400 font-mono">gemini-1.5-flash</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Monthly Cost</span>
              <span className="text-xs font-bold text-emerald-400">₹0.00 / Free</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Vision QC</span>
              <span className="text-xs font-bold text-purple-400">Enabled ✓</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Encrypted local storage</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 transition flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-300" /> Saved!
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Save Configuration
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
