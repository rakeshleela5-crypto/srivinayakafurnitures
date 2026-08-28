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
    const params = new URLSearchParams(fullPayload).toString();
    const targetUrl = `${webhookUrl}?${params}`;
    
    // We attempt fetch in no-cors mode for Google Apps Script redirects
    fetch(targetUrl, { mode: 'no-cors' }).catch(err => {
      console.warn("Background webhook dispatch notice:", err.message);
    });

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
