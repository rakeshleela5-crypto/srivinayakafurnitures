// OmniBuild OS™ — Google Apps Script Master Webhook Bridge
import { STORE_METADATA } from '../data/initialData';

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
  const webhookUrl = customWebhookUrl || localStorage.getItem('OMNIBUILD_WEBHOOK_URL') || STORE_METADATA.defaultWebhookUrl;
  const currentTimestamp = formatDateTimeIndian();
  
  const fullPayload = {
    action: actionName,
    client_timestamp: currentTimestamp,
    ...payload
  };

  console.log(`[HTTP ➔ GOOGLE APPS SCRIPT WEBHOOK] Action: ${actionName}`, fullPayload);

  try {
    // 1. Primary: POST request with complete JSON payload (supports unlimited batch rows)
    fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(fullPayload)
    }).catch(err => {
      console.warn("Background POST webhook notice:", err.message);
    });

    // 2. Secondary: Fallback GET request with key summary params
    try {
      const getParams = new URLSearchParams({
        action: actionName,
        client_timestamp: currentTimestamp,
        ...(payload.total_rows ? { total_rows: payload.total_rows } : {}),
        ...(payload.sample_skus ? { sample_skus: payload.sample_skus } : {}),
        ...(payload.import_mode ? { import_mode: payload.import_mode } : {}),
        ...(payload.sku ? { sku: payload.sku } : {}),
        ...(payload.order_id ? { order_id: payload.order_id } : {})
      }).toString();
      fetch(`${webhookUrl}?${getParams}`, { mode: 'no-cors' }).catch(() => {});
    } catch(e) {}

    return {
      success: true,
      action: actionName,
      timestamp: currentTimestamp,
      dispatched: true,
      message: `Action ${actionName} dispatched to Google Apps Script backend!`
    };
  } catch (error) {
    console.error("Webhook Dispatch Exception:", error);
    return {
      success: false,
      action: actionName,
      error: error.message,
      timestamp: currentTimestamp
    };
  }
}
