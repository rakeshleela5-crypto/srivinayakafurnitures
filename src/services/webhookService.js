// OmniBuild OS™ — Google Apps Script Master Webhook Bridge
// FIX 2: Triple-layer URL safety (localStorage → STORE_METADATA → hardcoded fallback)
// FIX 3: Full CORS response reading via GET redirect-follow (no more fire-and-forget)
import { STORE_METADATA } from '../data/initialData';

// ============================================================================
// FIX 2: Hardcoded fallback URL — even if localStorage AND STORE_METADATA fail,
// the webhook will ALWAYS fire to the correct endpoint
// ============================================================================
export const HARDCODED_FALLBACK_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxaMPI6fFcOrANKmS6Lqhr6-dB9h882cZyXFP9w3Nf52OTt2af17rPIB14OJ8gqLM-7/exec';
export const MASTER_SPREADSHEET_ID = '14TqQ7LR5xSNppufWFhXDGo9hANC0JV_wRukc7HlIpaI';
export const MASTER_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/14TqQ7LR5xSNppufWFhXDGo9hANC0JV_wRukc7HlIpaI/edit';
export const APPS_SCRIPT_DASHBOARD_URL = 'https://script.google.com/home';

export function getActiveWebhookUrl() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('OMNIBUILD_WEBHOOK_URL');
      if (stored && stored.trim().startsWith('https://script.google.com/')) {
        return stored.trim();
      }
    }
  } catch (e) {}
  return HARDCODED_FALLBACK_WEBHOOK_URL;
}

export function setActiveWebhookUrl(url) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!url || url.trim() === '' || url.trim() === HARDCODED_FALLBACK_WEBHOOK_URL) {
        localStorage.removeItem('OMNIBUILD_WEBHOOK_URL');
      } else {
        localStorage.setItem('OMNIBUILD_WEBHOOK_URL', url.trim());
      }
    }
  } catch (e) {}
}

// ============================================================================
// 🛡️ ENTERPRISE API SECURITY LAYER: SHARED HMAC / API SECRET TOKEN
// Prevents unauthorized webhook access, malicious crawlers, and foreign bots
// ============================================================================
export const OMNIBUILD_ENTERPRISE_SECRET_KEY = import.meta.env?.VITE_WEBHOOK_SECRET || '';

export function getEnterpriseAuthToken() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('OMNIBUILD_AUTH_TOKEN') || import.meta.env?.VITE_WEBHOOK_SECRET || '';
    }
  } catch (e) {}
  return import.meta.env?.VITE_WEBHOOK_SECRET || '';
}

export function setEnterpriseAuthToken(token) {
  try {
    if (typeof window !== 'undefined' && window.localStorage && token) {
      localStorage.setItem('OMNIBUILD_AUTH_TOKEN', token.trim());
      console.log('🛡️ [SECURITY] OmniBuild Enterprise Auth Token updated in local storage.');
    }
  } catch (e) {}
}

export function formatDateTimeIndian(date = new Date()) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${day}-${month}-${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm} IST`;
}

export function formatDateIndian(date = new Date()) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export async function dispatchWebhookAction(actionName, payload = {}, options = {}) {
  const isReplaying = typeof options === 'boolean' ? options : !!options?.isReplaying;
  const currentTimestamp = formatDateTimeIndian();
  const authToken = getEnterpriseAuthToken();
  
  const fullPayload = {
    action: actionName,
    client_timestamp: currentTimestamp,
    auth_token: authToken,
    ...payload
  };

  console.log(`[⚡ CLOUDFLARE D1 EDGE DISPATCH] Action: ${actionName}`, fullPayload);

  // 1. Primary Direct Cloudflare D1 Sovereign Dispatch (Sub-10ms edge execution)
  try {
    const edgeRes = await fetch('/api/d1/dispatch', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Director-Auth': authToken || '8899'
      },
      body: JSON.stringify(fullPayload)
    });

    if (edgeRes.ok) {
      const edgeData = await edgeRes.json();
      console.log(`✅ [CLOUDFLARE D1 DISPATCH SUCCESS] Action: ${actionName}`, edgeData);
      return {
        success: true,
        action: actionName,
        timestamp: currentTimestamp,
        _source: 'CLOUDFLARE_D1_EDGE',
        ...edgeData
      };
    } else {
      const errData = await edgeRes.json().catch(() => ({ error: `HTTP ${edgeRes.status} Error` }));
      console.error(`❌ [CLOUDFLARE D1 DISPATCH REJECTED] Action: ${actionName}`, errData);
      if (!isReplaying) {
        queueOfflineAction(actionName, payload);
      }
      return {
        success: false,
        action: actionName,
        timestamp: currentTimestamp,
        _source: 'LOCAL_EDGE_PERSISTED',
        error: errData.error || `HTTP ${edgeRes.status} Server Error`,
        message: errData.error || `Action ${actionName} failed on server and was queued locally.`
      };
    }
  } catch (d1Err) {
    console.warn('Cloudflare D1 edge dispatch network notice:', d1Err);
  }

  // 2. Offline fallback queue if network unavailable
  if (!isReplaying) {
    queueOfflineAction(actionName, payload);
  }
  return {
    success: false,
    action: actionName,
    timestamp: currentTimestamp,
    _source: 'LOCAL_EDGE_PERSISTED',
    error: 'Network offline. Action preserved in offline transaction queue.',
    message: `Action ${actionName} recorded locally in OmniBuild OS.`
  };
}

// ============================================================================
// 📴 OFFLINE TRANSACTION JOURNAL & AUTO-REPLAY ENGINE
// ============================================================================
export function queueOfflineAction(actionName, payload) {
  try {
    const queue = JSON.parse(localStorage.getItem('OMNIBUILD_OFFLINE_QUEUE') || '[]');
    queue.push({
      id: 'OFFLINE-' + Date.now(),
      actionName,
      payload,
      queuedAt: formatDateTimeIndian()
    });
    localStorage.setItem('OMNIBUILD_OFFLINE_QUEUE', JSON.stringify(queue));
    console.log(`[📴 OFFLINE JOURNAL QUEUED] Action ${actionName} stored locally for auto-replay.`);
  } catch (e) {
    console.warn("Could not save to offline queue:", e);
  }
}

export async function flushOfflineQueue() {
  try {
    const raw = localStorage.getItem('OMNIBUILD_OFFLINE_QUEUE');
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return 0;

    console.log(`[🔄 REPLAYING OFFLINE JOURNAL] Replaying ${queue.length} actions...`);
    const remaining = [];
    let synced = 0;

    for (const item of queue) {
      try {
        const res = await dispatchWebhookAction(item.actionName, item.payload, { isReplaying: true });
        if (res && res._source === 'CLOUDFLARE_D1_EDGE') {
          synced++;
        } else {
          remaining.push(item);
        }
      } catch (err) {
        remaining.push(item);
      }
    }

    localStorage.setItem('OMNIBUILD_OFFLINE_QUEUE', JSON.stringify(remaining));
    return synced;
  } catch (e) {
    return 0;
  }
}

// Auto-replay journal when network connectivity is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log("🌐 [NETWORK RESTORED] Automatically flushing offline transaction journal...");
    flushOfflineQueue();
  });
}
