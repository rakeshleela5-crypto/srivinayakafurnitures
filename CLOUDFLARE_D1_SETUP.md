# ⚡ Cloudflare D1 Edge SQL Database Setup & Ingestion Guide
**Project**: OmniBuild OS™ (Sri Vinayaka Furnitures / Godrej Interio Rayagada Flagship)  
**Edge Host**: Cloudflare Workers (`srivinayakafurnitures.rakeshleela5.workers.dev`)

---

## 🌟 Overview: What Was Built

OmniBuild OS now features native **Cloudflare D1 Edge SQL Database** support with 3 catalog ingestion methods:

| Ingestion Method | How to Use | Best For |
| :--- | :--- | :--- |
| **Method 1: 📁 Excel / CSV Drag & Drop** | In Tab 17 (`Live Database`), click **⚡ Cloudflare D1 Catalog Hub** ➔ Drag & drop Godrej `.csv` file. | Daily showroom stock updates & factory price sheet imports |
| **Method 2: ⚡ One-Command Bulk SQL Seed** | Run `npx wrangler d1 execute srivinayaka-db --file=./catalog_seed.sql` | 1-time bulk import of all 137 Godrej models |
| **Method 3: ➕ Quick "Add Model" Form** | In Tab 17 (`Live Database`), click **⚡ Cloudflare D1 Catalog Hub** ➔ Method 3 ➔ Enter SKU & Price. | Single walk-in arrivals or custom customer requests |

---

## 🚀 3-Step Setup to Bind D1 in Your Cloudflare Account

### Step 1: Create the D1 Database via Wrangler
Open your terminal in the project directory and run:
```bash
npx wrangler d1 create srivinayaka-db
```
Cloudflare will output:
```text
[[d1_databases]]
binding = "DB"
database_name = "srivinayaka-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step 2: Apply the SQL Schema
Run:
```bash
npx wrangler d1 execute srivinayaka-db --file=./schema.sql
```
This creates:
- `catalog` (SKUs, Models, Categories, MRP, Selling Price, Warehouse Stock, Finishes, Warranties)
- `orders` (SafeLock reservations, Customer Phone, Balance Due, OTP)
- `inquiries` (VIP Leads & AI Intent scores)
- `payments` (UPI & Reconciliation records)
- `architects` (VIP Partner ledgers & TDS deductions)

### Step 3: Seed All 137 Existing Godrej Items (Method 2)
Run:
```bash
npx wrangler d1 execute srivinayaka-db --file=./catalog_seed.sql
```
All 137 Godrej Interio models will be live in your Cloudflare D1 database in **under 1 second**!

---

## 🌐 In-App Showroom UI Features
1. Open [https://srivinayakafurnitures.rakeshleela5.workers.dev/](https://srivinayakafurnitures.rakeshleela5.workers.dev/).
2. Enter your PIN: **`8899`** (Director Rakesh).
3. Navigate to **Tab 17: 🗄️ Live Database**.
4. Click **⚡ Cloudflare D1 Catalog Hub**:
   - **Method 1 Tab**: Drag & drop any CSV catalog. Download sample CSV template.
   - **Method 3 Tab**: Add a single model with MRP, Festive Rate, and Stock.
   - **Method 2 Tab**: Copy the terminal command for bulk seed migration.
