# 📱 Option B: Free 24/7 Cloud WhatsApp Gateway Setup Guide
**OmniBuild OS™ — Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)**

This guide walks you through deploying a **100% Free 24/7 Cloud WhatsApp Gateway (Evolution API)** on **Render.com** or **Koyeb.com**.

---

## 🌟 Why This Cloud Setup Is Ideal
- **₹0 Monthly Cost**: Uses the platform's Free Tier.
- **₹0 Per-Message Fees**: Zero billing from Meta.
- **24/7/365 Non-Stop Uptime**: Fires 9:00 PM daily executive sales reports and morning delivery OTPs even when showroom computers are switched off.
- **Anywhere Access**: Staff or Naresh Sir can dispatch invoices from any mobile phone outside the showroom.
- **Automatic HTTPS/SSL**: Fully encrypted with free SSL certificates.

---

## 🚀 Option 1: Deploy on Render.com (Recommended — 5 Minutes)

### Step 1: Create a Free Account
1. Go to [https://render.com](https://render.com) and click **Sign Up** (using GitHub or Google).

### Step 2: Create a New Web Service
1. In your Render Dashboard, click **New +** ➔ **Web Service**.
2. Select **Existing image** (Deploy an existing image from a registry).
3. In the **Image URL** box, enter:
   ```text
   atendai/evolution-api:v2.1.0
   ```
   (or `atendai/evolution-api:latest`)
4. Click **Next**.

### Step 3: Configure Service Details
- **Name**: `srivinayaka-wa-gateway` (or any name you prefer)
- **Region**: `Singapore` (Fastest connection for India / Odisha)
- **Instance Type**: Select **Free** ($0 / month)

### Step 4: Add Environment Variables
Scroll down to the **Environment Variables** section and add these two:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `AUTHENTICATION_API_KEY` | `godrej_rayagada_secret_2026` | *(Choose any secure password you like)* |
| `CONFIG_SESSION_PHONE_CLIENT` | `Sri Vinayaka Furnitures` | *(Showroom name shown in linked devices)* |

Click **Create Web Service**.

### Step 5: Copy Your Public HTTPS URL
Render will deploy the container in ~1-2 minutes and display a public URL at the top, for example:
```text
https://srivinayaka-wa-gateway.onrender.com
```

---

## ⚡ Option 2: Deploy on Koyeb.com (Alternative Free Tier)

1. Sign up at [https://www.koyeb.com](https://www.koyeb.com) (Free Tier available).
2. Click **Create App** ➔ Choose **Docker Image**.
3. Image: `atendai/evolution-api:v2.1.0`
4. Set Environment Variable:
   - `AUTHENTICATION_API_KEY` = `godrej_rayagada_secret_2026`
5. Click **Deploy**. Koyeb will generate your free HTTPS URL:
   ```text
   https://srivinayaka-wa.koyeb.app
   ```

---

## 🔗 How to Connect It to OmniBuild OS (In 30 Seconds)

1. Open your live OmniBuild OS at:  
   [https://srivinayakafurnitures.rakeshleela5.workers.dev/](https://srivinayakafurnitures.rakeshleela5.workers.dev/)
2. In the top header, click **⚙️ Identity & UPI** to open Store Settings.
3. Scroll down to the **📱 WhatsApp Dispatch & Automation Engine** section.
4. Click **○ Mode 2: Self-Hosted QR Gateway**.
5. Fill in the 3 fields:
   - **Gateway Server URL**: `https://srivinayaka-wa-gateway.onrender.com` *(your URL from Step 5)*
   - **Instance Name**: `srivinayaka_showroom`
   - **Gateway API Key**: `godrej_rayagada_secret_2026`
6. Click **Save Showroom Configuration & Apply Everywhere**.
7. Click **📶 Test Connection & Pair Status**.

---

## 📲 Link the Showroom Phone (One-Time Step)

1. Open WhatsApp on the showroom smartphone.
2. Tap **Settings (or 3 dots on Android)** ➔ **Linked Devices**.
3. Tap **Link a Device**.
4. Scan the pairing QR code displayed in the gateway.
5. Status in OmniBuild OS will immediately switch to:
   ```text
   🟢 Connected & Paired! Showroom WhatsApp is live.
   ```

---

## 🛡️ Built-In Fail-Safe Protection
Even when operating in Mode 2, if the cloud server is ever temporarily restarting, OmniBuild OS has an **automatic fallback**: it will seamlessly open the standard 1-Click `wa.me` link so **no invoice or customer OTP is ever dropped!**
