# 👑 Oracle Cloud Always Free 24/7 WhatsApp Gateway Guide
**OmniBuild OS™ — Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)**

This guide explains how to set up a **100% Free Forever, 24/7/365 Non-Stop Cloud Server** on **Oracle Cloud Infrastructure (OCI)** for your showroom's automated WhatsApp engine.

---

## 🌟 Why Oracle Cloud Always Free Is the #1 Choice

| Feature | Render / Railway | Oracle Cloud Always Free 👑 |
| :--- | :---: | :---: |
| **Cost** | Free with limits | **₹0 FOREVER (Lifetime)** |
| **Server Sleeps?** | ⚠️ Yes (Sleeps after 15 min) | ❌ **NEVER SLEEPS (24/7 Non-Stop)** |
| **RAM** | 512 MB | **Up to 24 GB RAM** |
| **Storage** | Ephemeral | **200 GB NVMe Storage Included** |
| **WhatsApp Session** | Drops when sleeping | **Stays paired permanently** |
| **Data Center** | Overseas | **Hyderabad / Mumbai (Lowest latency to Odisha)** |

---

## 🚀 Step 1: Create an Oracle Cloud Account (10 Minutes)

1. Go to: **[https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/)**
2. Click **Start for free**.
3. Fill in your details:
   - **Country**: India
   - **Home Region**: Choose **India South (Hyderabad)** or **India West (Mumbai)** for the fastest speed to Rayagada.
4. **Identity Verification**:
   - Oracle requires a valid debit/credit card (Visa or Mastercard with international transactions enabled).
   - **They charge a temporary ~₹75 ($1) refundable test hold** that is returned to your account within minutes.
   - You will **NEVER be billed** as long as you use "Always Free" resources.

---

## 🖥️ Step 2: Create Your Free Ubuntu Virtual Machine

1. Log into your Oracle Cloud Console: [cloud.oracle.com](https://cloud.oracle.com)
2. In the search bar or menu, click **Compute** ➔ **Instances** ➔ **Create instance**.
3. Name your instance: `srivinayaka-wa-server`
4. **Placement & Shape**:
   - Image: Choose **Canonical Ubuntu 24.04** (or 22.04 LTS).
   - Shape: Click **Change Shape** ➔ Select **Ampere** (ARM processor) ➔ **VM.Standard.A1.Flex** (Set 2 OCPUs and 12 GB RAM — marked with the green **"Always Free Eligible"** tag!).
   *(Alternatively, you can choose AMD `VM.Standard.E2.1.Micro` which is also Always Free).*
5. **Networking**: Keep defaults (Create new Virtual Cloud Network).
6. **SSH Keys**:
   - Select **Generate a key pair for me**.
   - Click **Save private key** and **Save public key** to your computer.
7. Click **Create**.
8. In ~60 seconds, your instance status turns **RUNNING** 🟢.
9. Note down your **Public IP Address** (e.g. `140.238.12.34`).

---

## 🛡️ Step 3: Open Port 8080 in Oracle Cloud Firewall (Important!)

Oracle Cloud blocks all incoming ports by default for security. You need to allow Port 8080:

1. On the instance page, click on your **Subnet** link (under Primary VNIC).
2. Click on **Default Security List for...**
3. Click **Add Ingress Rules**:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: `TCP`
   - **Destination Port Range**: `8080`
   - **Description**: `Allow Evolution API WhatsApp Port`
4. Click **Add Ingress Rules**.

---

## ⚡ Step 4: Run the 1-Command Installer

Open PowerShell or Terminal on your computer where you saved your private key:

1. **Connect to your Oracle VM via SSH**:
   ```bash
   ssh -i /path/to/your-private-key.key ubuntu@YOUR_ORACLE_PUBLIC_IP
   ```

2. **Clone this repository**:
   ```bash
   git clone https://github.com/rakeshleela5-crypto/srivinayakafurnitures.git
   cd srivinayakafurnitures
   ```

3. **Run the 1-command setup script**:
   ```bash
   chmod +x setup-oracle-cloud.sh
   ./setup-oracle-cloud.sh
   ```

The script will automatically:
- Install Docker & Docker Compose
- Configure Ubuntu's internal iptables firewall
- Start PostgreSQL, Redis, and Evolution API
- Display your Gateway URL: `http://YOUR_ORACLE_PUBLIC_IP:8080`

---

## 🔗 Step 5: Connect OmniBuild OS to Oracle Cloud

1. Open OmniBuild OS: [https://srivinayakafurnitures.rakeshleela5.workers.dev/](https://srivinayakafurnitures.rakeshleela5.workers.dev/)
2. In the top header, click **⚙️ Identity & UPI** (Store Settings).
3. Scroll to **📱 WhatsApp Dispatch & Automation Engine**.
4. Select **○ Mode 2: 24/7 Cloud Gateway (Oracle Cloud / Evolution API)**.
5. Enter:
   - **Gateway Server URL**: `http://YOUR_ORACLE_PUBLIC_IP:8080`
   - **Instance Name**: `srivinayaka_showroom`
   - **Gateway API Key**: `godrej_rayagada_secret_2026`
6. Click **Save Showroom Configuration & Apply Everywhere**.
7. Click **📶 Test Connection & Pair Status**.

---

## 📲 Step 6: Scan the Pairing QR Code Once

1. Open WhatsApp on the showroom smartphone.
2. Tap **Settings (or 3 dots)** ➔ **Linked Devices** ➔ **Link a Device**.
3. Scan the QR code displayed in OmniBuild OS.
4. The status turns:
   ```text
   🟢 Connected & Paired! Showroom WhatsApp is live.
   ```

---

## 🏆 Congratulations!
Sri Vinayaka Furnitures now has a **permanent, enterprise-grade 24/7 WhatsApp automation engine**:
- **0.5-second instant deliveries** with zero cold starts or server sleeps.
- **Daily 9:00 PM executive sales summaries** fire like clockwork.
- **Delivery OTPs and SafeLock invoices** dispatch automatically.
- **100% Free Forever ($0.00 / month)** on Oracle Cloud Always Free Infrastructure.
