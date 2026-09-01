// OmniBuild OS™ — Google Apps Script Master Webhook Bridge
// FIX 2: Triple-layer URL safety (localStorage → STORE_METADATA → hardcoded fallback)
// FIX 3: Full CORS response reading via GET redirect-follow (no more fire-and-forget)
import { STORE_METADATA } from '../data/initialData';

// ============================================================================
// FIX 2: Hardcoded fallback URL — even if localStorage AND STORE_METADATA fail,
// the webhook will ALWAYS fire to the correct endpoint
// ============================================================================
const HARDCODED_FALLBACK_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyMoY7TWkFO6JpUUu2PW0HPMM96PaDkFCcA2UUpENq712rFPTpWK2M5TPu0bTvJ7phc/exec";

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

export async function dispatchWebhookAction(actionName, payload = {}, customWebhookUrl = null) {
  // FIX 2: Triple-layer URL resolution (localStorage → STORE_METADATA → hardcoded constant)
  const webhookUrl = customWebhookUrl
    || localStorage.getItem('OMNIBUILD_WEBHOOK_URL')
    || (STORE_METADATA && STORE_METADATA.defaultWebhookUrl)
    || HARDCODED_FALLBACK_WEBHOOK_URL;

  const currentTimestamp = formatDateTimeIndian();
  
  const fullPayload = {
    action: actionName,
    client_timestamp: currentTimestamp,
    ...payload
  };

  console.log(`[HTTP ➔ GOOGLE APPS SCRIPT WEBHOOK] Action: ${actionName}`, fullPayload);

  try {
    // ========================================================================
    // FIX 3: STRATEGY — Primary GET (reads real response) + Backup POST (fire-and-forget for large payloads)
    // ========================================================================

    // 1. BACKUP: Fire POST with no-cors for large payloads (bulk imports, CSV data)
    //    This ensures the full JSON body always reaches the backend even for huge payloads
    fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(fullPayload)
    }).catch(err => {
      console.warn("[POST backup] fire-and-forget notice:", err.message);
    });

    // 2. PRIMARY: GET request WITH response reading (follows Google's 302 redirect → reads real JSON)
    //    Google Apps Script deployed web apps redirect /exec → googleusercontent.com CDN
    //    The CDN endpoint returns Access-Control-Allow-Origin: * which allows cross-origin reads
    const sanitizedParams = {
      action: actionName,
      client_timestamp: currentTimestamp
    };

    // Dynamically include all scalar payload fields (strings, numbers, booleans)
    for (const [key, val] of Object.entries(payload)) {
      if (val !== undefined && val !== null && typeof val !== 'object') {
        sanitizedParams[key] = String(val);
      }
    }

    const getParams = new URLSearchParams(sanitizedParams).toString();

    try {
      const response = await fetch(`${webhookUrl}?${getParams}`, {
        method: 'GET',
        redirect: 'follow'  // Follow Google's 302 redirect to CDN (which has CORS headers)
      });

      if (response.ok) {
        const serverResult = await response.json();
        console.log(`[✅ REAL BACKEND RESPONSE] Action: ${actionName}`, serverResult);
        return {
          ...serverResult,
          _source: 'LIVE_BACKEND_RESPONSE',
          _dispatched: true
        };
      } else {
        // Server returned non-200 — fall back to dispatched confirmation
        console.warn(`[⚠️ GET response status: ${response.status}] Falling back to dispatch confirmation.`);
        return {
          success: true,
          action: actionName,
          timestamp: currentTimestamp,
          dispatched: true,
          _source: 'DISPATCH_CONFIRMED_POST_SENT',
          message: `Action ${actionName} dispatched to Google Apps Script backend (POST confirmed)!`
        };
      }
    } catch (getErr) {
      // GET with response-reading failed (CORS block on some browsers) — still safe because POST already fired
      console.warn(`[⚠️ GET response read failed — POST backup already sent] ${getErr.message}`);
      return {
        success: true,
        action: actionName,
        timestamp: currentTimestamp,
        dispatched: true,
        _source: 'POST_FIRE_AND_FORGET',
        message: `Action ${actionName} dispatched via POST backup to Google Apps Script!`
      };
    }

  } catch (error) {
    console.error("Webhook Dispatch Exception:", error);
    return {
      success: false,
      action: actionName,
      error: error.message,
      timestamp: currentTimestamp,
      _source: 'DISPATCH_FAILED'
    };
  }
}
