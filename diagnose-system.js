import https from 'https';

const webhookUrl = "https://script.google.com/macros/s/AKfycbxaMPI6fFcOrANKmS6Lqhr6-dB9h882cZyXFP9w3Nf52OTt2af17rPIB14OJ8gqLM-7/exec";

function fetchWithRedirect(url) {
  https.get(url, (res) => {
    if (res.statusCode === 302 || res.statusCode === 301 || res.statusCode === 307) {
      console.log(`↪️ Following Google Apps Script Redirect to:\n   ${res.headers.location.substring(0, 90)}...`);
      fetchWithRedirect(res.headers.location);
      return;
    }

    console.log(`📡 Final HTTP Response Status: ${res.statusCode} ${res.statusMessage}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`📦 Response Body from Webhook:`, data);
      try {
        const parsed = JSON.parse(data);
        console.log(`✅ Valid JSON Received from Webhook!`, parsed);
      } catch (e) {
        console.log(`ℹ️ Text response received (Length: ${data.length} characters)`);
      }
    });
  }).on('error', (err) => {
    console.error(`❌ Connection Error:`, err);
  });
}

console.log("Testing full Google Apps Script Webhook payload response...");
fetchWithRedirect(`${webhookUrl}?action=PING_CHECK&client_timestamp=${encodeURIComponent(new Date().toISOString())}`);
