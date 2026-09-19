// OmniBuild OS™ — Unified WhatsApp Dispatch & Gateway Service
// Supports Dual Mode:
// Mode 1: 1-Click Universal wa.me Deep Links (Default, ₹0 cost, zero setup, safe)
// Mode 2: Self-Hosted QR Gateway (Evolution API / Baileys Worker, unattended auto-dispatch)

const STORAGE_KEY = 'OMNIBUILD_WA_GATEWAY_CONFIG';

export const DEFAULT_GATEWAY_CONFIG = {
  dispatchMode: 'DEEP_LINK', // 'DEEP_LINK' | 'SELF_HOSTED_GATEWAY'
  gatewayUrl: '', // e.g. https://my-wa-gateway.railway.app or http://localhost:8080
  gatewayApiKey: '',
  instanceName: 'srivinayaka_showroom',
  isPaired: false,
  lastStatusCheck: null
};

/**
 * Retrieve current WhatsApp Gateway configuration from local storage
 */
export function getWhatsAppGatewayConfig() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_GATEWAY_CONFIG, ...parsed };
      }
    }
  } catch (e) {
    console.warn('[WA Gateway] Failed to read config from localStorage:', e);
  }
  return { ...DEFAULT_GATEWAY_CONFIG };
}

/**
 * Save WhatsApp Gateway configuration to local storage
 */
export function saveWhatsAppGatewayConfig(updatedConfig) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const current = getWhatsAppGatewayConfig();
      const merged = { ...current, ...updatedConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.error('[WA Gateway] Failed to save config to localStorage:', e);
  }
  return updatedConfig;
}

/**
 * Format Indian telephone number for WhatsApp dispatch
 */
export function formatWhatsAppPhone(rawPhone) {
  const digits = String(rawPhone || '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  if (digits.length > 10) {
    return digits;
  }
  return '919390553301'; // Default Rayagada showroom helpline fallback
}

/**
 * Test connectivity with the self-hosted Evolution API / Baileys instance
 */
export async function checkGatewayConnection(config = null) {
  const cfg = config || getWhatsAppGatewayConfig();
  if (!cfg.gatewayUrl || cfg.gatewayUrl.trim() === '') {
    return {
      connected: false,
      state: 'UNCONFIGURED',
      message: 'No Gateway URL configured.'
    };
  }

  const cleanUrl = cfg.gatewayUrl.trim().replace(/\/+$/, '');
  const instance = encodeURIComponent(cfg.instanceName || 'srivinayaka_showroom');
  const endpoint = `${cleanUrl}/instance/connectionState/${instance}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const headers = {
      'Content-Type': 'application/json'
    };
    if (cfg.gatewayApiKey && cfg.gatewayApiKey.trim() !== '') {
      headers['apikey'] = cfg.gatewayApiKey.trim();
      headers['Authorization'] = `Bearer ${cfg.gatewayApiKey.trim()}`;
    }

    const res = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const state = data?.instance?.state || data?.state || (data?.status === 'open' ? 'open' : 'connected');
      const isConnected = state === 'open' || state === 'connected';

      saveWhatsAppGatewayConfig({
        isPaired: isConnected,
        lastStatusCheck: new Date().toISOString()
      });

      return {
        connected: isConnected,
        state: state,
        message: isConnected 
          ? `🟢 Connected & Paired! Showroom WhatsApp is live.`
          : `🟡 Gateway online, but phone is not paired (State: ${state}). Scan QR to link.`
      };
    } else {
      return {
        connected: false,
        state: `HTTP_${res.status}`,
        message: `Gateway responded with HTTP ${res.status}. Check API Key or Instance Name.`
      };
    }
  } catch (err) {
    return {
      connected: false,
      state: 'OFFLINE_UNREACHABLE',
      message: `Could not reach ${cleanUrl}. Ensure your worker/server is running.`
    };
  }
}

/**
 * Request Pairing QR code from Evolution API / Baileys instance
 */
export async function fetchGatewayQrCode(config = null) {
  const cfg = config || getWhatsAppGatewayConfig();
  if (!cfg.gatewayUrl) {
    throw new Error('Please enter a Gateway Server URL first.');
  }

  const cleanUrl = cfg.gatewayUrl.trim().replace(/\/+$/, '');
  const instance = encodeURIComponent(cfg.instanceName || 'srivinayaka_showroom');
  const endpoint = `${cleanUrl}/instance/connect/${instance}`;

  const headers = { 'Content-Type': 'application/json' };
  if (cfg.gatewayApiKey) {
    headers['apikey'] = cfg.gatewayApiKey.trim();
    headers['Authorization'] = `Bearer ${cfg.gatewayApiKey.trim()}`;
  }

  const res = await fetch(endpoint, { method: 'GET', headers });
  if (!res.ok) {
    throw new Error(`Gateway returned HTTP ${res.status}`);
  }

  const data = await res.json();
  // Evolution API returns { base64: "data:image/png;base64,...", code: "..." }
  return {
    base64: data?.base64 || data?.qrcode?.base64 || null,
    code: data?.code || data?.qrcode?.code || null,
    pairingCode: data?.pairingCode || null
  };
}

/**
 * Unified WhatsApp Message Dispatcher
 * Automatically switches between Self-Hosted Gateway (Mode 2) and Universal wa.me Deep Links (Mode 1).
 * If Self-Hosted Gateway fails, it seamlessly falls back to wa.me so messages are NEVER lost!
 */
export async function dispatchUnifiedWhatsApp(rawPhone, messageText, options = {}) {
  const cleanPhone = formatWhatsAppPhone(rawPhone);
  const cfg = getWhatsAppGatewayConfig();

  // Mode 2: If Self-Hosted QR Gateway is enabled and configured, attempt headless background POST
  if (cfg.dispatchMode === 'SELF_HOSTED_GATEWAY' && cfg.gatewayUrl && cfg.gatewayUrl.trim() !== '') {
    const cleanUrl = cfg.gatewayUrl.trim().replace(/\/+$/, '');
    const instance = encodeURIComponent(cfg.instanceName || 'srivinayaka_showroom');
    const sendEndpoint = `${cleanUrl}/message/sendText/${instance}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const headers = {
        'Content-Type': 'application/json'
      };
      if (cfg.gatewayApiKey) {
        headers['apikey'] = cfg.gatewayApiKey.trim();
        headers['Authorization'] = `Bearer ${cfg.gatewayApiKey.trim()}`;
      }

      const payload = {
        number: cleanPhone,
        text: messageText,
        options: {
          delay: 1200,
          presence: 'composing'
        }
      };

      const res = await fetch(sendEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        console.log(`[WA GATEWAY] Headless message dispatched via self-hosted gateway to ${cleanPhone}:`, json);
        return {
          success: true,
          mode: 'SELF_HOSTED_GATEWAY',
          phone: cleanPhone,
          details: json
        };
      } else {
        console.warn(`[WA GATEWAY] Gateway returned HTTP ${res.status}. Falling back to universal wa.me link.`);
      }
    } catch (gatewayErr) {
      console.warn(`[WA GATEWAY] Gateway request failed (${gatewayErr.message}). Falling back to universal wa.me link.`);
    }
  }

  // Mode 1 (Default & Safe Fallback): 1-Click Universal wa.me deep link
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
  if (!options.silent) {
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  }

  return {
    success: true,
    mode: 'DEEP_LINK',
    phone: cleanPhone,
    url: waUrl
  };
}
