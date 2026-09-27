# OmniBuild OS™ — CFO Financial Modeling & Showroom Unit Economics
**Target Entity:** Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship Showroom)  
**Executive Leadership:** Naresh & Naren (Store Directors & Owners)  
**Financial Period:** FY 2026–2027  
**Currency:** Indian Rupee (INR ₹)  

---

## 1. Showroom Revenue & Margin Architecture

OmniBuild OS™ integrates a real-time Profit Heart Engine (`ShowroomProfitRadarModal.jsx` and `TallyGstOfficeView.jsx`) that splits showroom revenue across three core product categories with distinct margin profiles:

| Product Category | Example Models / SKUs | Average Selling Price (₹) | Landed Factory Cost (₹) | Gross Margin (%) | Realized Margin per Unit (₹) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Category A: 100% Solid CP Teak Suites** | `BED-MOD-001`, `DIN-MOD-001` | ₹89,790 | ₹55,670 | **38.0%** | **₹34,120** |
| **Category B: Godrej Modular Wardrobes & Beds** | `ALM-MOD-001`, `BED-MOD-002` | ₹68,400 | ₹49,250 | **28.0%** | **₹19,150** |
| **Category C: Recliners, Sofas & Mattresses** | `SOF-MOD-001`, `MAT-MOD-001` | ₹42,500 | ₹28,900 | **32.0%** | **₹13,600** |
| **Category D: Commercial / Hotel Contract Furnishing** | Hotel Residency Room Suites | ₹1,25,000 | ₹97,500 | **22.0%** | **₹27,500** |

---

## 2. Working Capital & Factory Purchase Order Cashflow Velocity

### The Factory Advance Cycle (Saharanpur / Jodhpur / Godrej Plants)
Every major replenishment cycle requires balancing factory commitments against customer booking advances:

```
[Factory Purchase Order Generated: ₹5,00,000]
       │
       ├─► 30% Advance Token Paid via RTGS (₹1,50,000) [Working Capital Locked]
       │
       ▼ (12–15 Days Manufacturing & Seasoning)
[Transporter Consignment Handover (LR / Bilty Issued)]
       │
       ├─► 70% Balance Dispatched against Bank UTR (₹3,50,000)
       │
       ▼ (3–4 Days Transit via V-Trans / GATI to Rayagada Dock)
[Warehouse Inward Unloading & SmartKit 5-Box Scan QC]
       │
       ▼ (Customer Delivery & SafeLock Release)
[Final Settlement via Doorstep Dynamic UPI / Cash]
```

### Working Capital Optimization Strategy:
1. **Zero-Stockout Buffer Rules:** Maintain exactly **2 units buffer** for fast-moving items (`BED-MOD-001`, `ALM-MOD-001`). AutoProcure generates POs only when stock drops below threshold, preventing excess working capital lockup.
2. **Customer Token Advance Funding:** With our SafeLock POS requiring **50% advance token** (or minimum ₹5,000 reservation), customer deposits directly fund the factory 30% advance, yielding **negative working capital financing**.

---

## 3. Dual-Ledger Cash & Bank Liquidity Snapshot

To safeguard daily operations and statutory tax obligations, OmniBuild OS™ balances two operational accounts:

* **HDFC Bank Operating Account (Rayagada Main Branch):**
  - **Account No:** `50200088991234` | **IFSC:** `HDFC0001824`
  - **Purpose:** Primary digital collections (UPI QR, Card Swipes, Customer RTGS) and GST payments.
  - **Target Liquid Reserve:** Minimum **₹15,00,000** for emergency vendor inventory releases.
* **SBI Commercial / Working Capital Account:**
  - **Purpose:** Transporter freight payments, carpenter wages, showroom diesel generator expenses.
  - **Target Liquid Reserve:** Minimum **₹5,00,000**.
* **Physical Cash Register (Showroom Safe):**
  - **Daily Ceiling:** Maximum **₹1,50,000**. All excess cash is deposited into the HDFC drop-box daily at 07:30 PM to comply with statutory cash holding limits.

---

## 4. Accounts Receivable Aging & Villa Turnkey Contracts

OmniBuild OS™ tracks high-ticket receivables to eliminate bad debts across Rayagada and outstation projects:

| Contract / Client | Scope of Supply | Contract Value (₹) | Advance Paid (₹) | Balance Due (₹) | Payment Milestone Trigger |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Dr. Subhashish Jena (Raniguda Farmhouse)** | 4 Bedroom Teak Suites + Dining | ₹1,56,494 | ₹78,247 | ₹78,247 | 40% on unloading, 10% on Narayana Mistri fitting |
| **Hotel Sai Residency (Gunupur)** | 12 Deluxe Room Modular Beds | ₹5,80,000 | ₹2,90,000 | ₹2,90,000 | 50% mobilization, 50% against NIC E-Way Bill |
| **Er. Pradeep Patnaik (JK Paper Villa)** | Master Suite + 7-Seater Sofa | ₹2,10,000 | ₹1,50,000 | ₹60,000 | Doorstep Dynamic UPI on delivery |

**Aging Protocol:** Any balance due exceeding 14 days post-delivery triggers an automatic WhatsApp ledger statement signed by Store Directors Naresh & Naren.

---

## 5. Monthly Showroom Breakeven & Fixed Overheads Analysis

* **Monthly Fixed Operating Expenses:**
  - Showroom Main Road Facility Lease: ₹65,000
  - Staff Compensation (Sales, Dock, Logistics, Cashier): ₹85,000
  - Commercial 3-Phase Power & AC Utility: ₹22,000
  - Logistics Tata Ace Vehicle EMI & Fuel: ₹28,000
  - Software, Internet & Security Telemetry: ₹5,000
  - **Total Monthly Fixed Overhead:** **₹2,05,000**

* **Breakeven Turnover Calculation:**
  - Average Realized Blended Gross Margin: **30.8%**
  - **Monthly Breakeven Invoiced Sales:**
    $$\text{Breakeven} = \frac{₹2,05,000}{0.308} = \mathbf{₹6,65,584/\text{Month}}$$
  - **Current Average Monthly Showroom Sales:** **₹21,50,000**
  - **Safety Margin:** Operating at **3.23× above monthly breakeven**, generating a net monthly cash surplus of approximately **₹4,57,200**.
