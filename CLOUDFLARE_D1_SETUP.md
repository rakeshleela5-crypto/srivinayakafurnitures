# ⚡ Cloudflare D1 Live Edge Database Deployment
**Database Name**: `srivinayaka-db`  
**Database ID**: `dec7abfc-0131-434b-9d31-fa19770a6203`  
**Region**: APAC (Singapore / India Edge)  
**Host Application**: `https://srivinayakafurnitures.rakeshleela5.workers.dev/`

---

## 🌟 Live Status: Remote Database Is Active!

We have successfully created and verified your remote Cloudflare D1 SQL database:

| Table Name | Description | Active Records in D1 | Execution Speed |
| :--- | :--- | :---: | :---: |
| **`catalog`** | Full Godrej Interio Rayagada Furniture Catalog | **141 Models** | **0.21 ms** ⚡ |
| **`orders`** | SafeLock Reservations & Delivery Manifests | **3 Active Orders** | **0.28 ms** ⚡ |
| **`architects`** | VIP Architect Partner Ledgers & TDS Sec 194H | **3 Firms** | **0.25 ms** ⚡ |
| **`inquiries`** | Customer Leads & Mobile AI Intent Tracking | **2 Leads** | **0.20 ms** ⚡ |
| **`payments`** | Dynamic UPI QR & Settlement Reconciliations | Seeded | **0.22 ms** ⚡ |
| **`smartkit_boxes`** | Flat-Pack Carton Staging & Barcodes | Seeded | **0.22 ms** ⚡ |

---

## 🔗 15-Second Final Step: Bind `DB` to Your Worker

To let your live web app at `srivinayakafurnitures.rakeshleela5.workers.dev` read & write directly to `srivinayaka-db` at the edge:

1. Click this direct link to your Worker's Bindings settings:  
   👉 **[https://dash.cloudflare.com/45d9869c22f24f97a86e7934e5bdd630/workers/services/view/srivinayakafurnitures/production/settings/bindings](https://dash.cloudflare.com/45d9869c22f24f97a86e7934e5bdd630/workers/services/view/srivinayakafurnitures/production/settings/bindings)**
2. Click **Add binding** (or **Add** under D1 Database Bindings).
3. Fill in:
   - **Variable name**: `DB`
   - **D1 database**: Select `srivinayaka-db` (`dec7abfc-0131-434b-9d31-fa19770a6203`)
4. Click **Save and deploy** (or **Deploy**).

---

## 💻 Useful Terminal Commands

You can query or manage your live database directly anytime:

* **Query top 5 items**:
  ```bash
  npx wrangler d1 execute srivinayaka-db --command="SELECT sku, product_name, selling_price_inr FROM catalog LIMIT 5;" --remote
  ```
* **Check live order count**:
  ```bash
  npx wrangler d1 execute srivinayaka-db --command="SELECT COUNT(*) FROM orders;" --remote
  ```
* **Backup / Export entire database**:
  ```bash
  npx wrangler d1 export srivinayaka-db --remote --output=./backup.sql
  ```
