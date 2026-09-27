# OmniBuild OS™ — Pricing & Commercial Monetization Strategy
**Target Entity:** Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship Showroom)  
**Executive Leadership:** Naresh & Naren (Store Directors)  
**Applicability:** Retail Showroom, VIP Architects, Commercial B2B & Wedding Packages  

---

## 1. Showroom Retail Pricing & Discount Governance

To protect gross margins while maintaining local market competitiveness in southern Odisha, OmniBuild OS™ enforces a **three-tier discount governance ladder**:

| Discount Slab | Maximum Authorization | Approval Requirement | Applicable Scenarios |
| :---: | :---: | :---: | :--- |
| **Tier 1 (Standard)** | **Up to 5.0%** | Sales Consultant (Sunil) | Standard walk-in cash/UPI purchases. |
| **Tier 2 (Festive)** | **Up to 8.0%** | System Preset (Active Festive Policy) | Griha Pravesh, Diwali/Dussehra showroom promotions. |
| **Tier 3 (Director Override)** | **8.1% to 15.0%** | **Directors Naresh & Naren (PIN: 8899)** | Whole-villa turnkey projects, civil surgeon/advocate VIPs. |
| **Tier 4 (Disallowed)** | **> 15.0%** | **HARD SYSTEM LOCK** | Disallowed to preserve landed COGS and brand equity. |

---

## 2. Outstation Logistics & Freight Surcharge Matrix

Delivery logistics across the hilly terrains of Rayagada, Koraput, and Andhra Pradesh border districts are governed by strict cartage rules coded into `ShowroomPricingEngine.js`:

```
Order Subtotal >= ₹1,00,000 ? 
  └───► FREE DELIVERY & COMPLIMENTARY NARAYANA MISTRI ASSEMBLY (Anywhere within 75 KM)

Order Subtotal < ₹1,00,000 :
  ├───► Local Rayagada Municipality (Within 10 KM): FREE DELIVERY
  ├───► Outstation Odisha (Koraput, Gunupur, Jeypore, Damanjodi): Flat ₹1,200 Fuel Surcharge
  └───► Inter-State Andhra Pradesh (Parvathipuram, Bobbili): Flat ₹1,800 + 18% IGST
```

---

## 3. B2B Commercial & Institutional Hotel/Residency Slabs

For commercial clients like hotels, guest houses, and corporate offices (handled by Naresh Sir's Commercial Desk):

| Volume Slab | Minimum Order Value (₹) | Discount Off MRP | Payment Terms Milestone | Warranty & Maintenance |
| :---: | :---: | :---: | :--- | :--- |
| **Slab 1 (Boutique 5–10 Rooms)** | ₹3,50,000 | **12% Off MRP** | 40% Advance • 50% on LR Bilty • 10% on Fitting | 3-Year Commercial Warranty |
| **Slab 2 (Residency 11–25 Rooms)**| ₹8,50,000 | **16% Off MRP** | 35% Advance • 55% on LR Bilty • 10% on Handover| 5-Year Commercial Warranty + 1x Annual Polish |
| **Slab 3 (Hotel/Hospital 25+ Rooms)**| ₹18,00,000+ | **20% Off MRP** | 30% Advance • 60% on LR Bilty • 10% on Final QC | 5-Year Warranty + 2x Free Annual Preventive Polish |

---

## 4. VIP Architect Referral Partner Program

Architects and interior designers drive over 40% of luxury teakwood suite sales. OmniBuild OS™ automates partner commissions through the `architect_referral_ledger` table:

* **Platinum Partner Tier (e.g. Ar. Sunita Patnaik — Studio Vastu):**
  - **Eligibility:** Cumulative annual client billing $\ge$ ₹15,00,000.
  - **Commission Rate:** **8.5% Direct Commission** on Invoiced Net Value (Excluding 18% GST).
  - **Payout Cadence:** Instant NEFT/RTGS settlement within 48 hours of customer 100% final balance clearance.
* **Gold Partner Tier (e.g. Er. Rajesh Mohanty — Rayagada Urban Planners):**
  - **Eligibility:** Cumulative annual client billing < ₹15,00,000.
  - **Commission Rate:** **6.5% Direct Commission**.
  - **Perk:** 3D Floor blueprint import into OmniBuild OS Blueprint Studio with priority site measurement by Narayana Mistri.

---

## 5. Wedding Suite (💍) & Griha Pravesh Packages

Bundled high-margin luxury packages designed for emotional life-milestone purchases:

### Package 1: Grand Royal Teakwood Bridal Suite (MRP ₹3,10,000 | Bundle Offer: ₹2,45,000)
1. Solid CP Teak King Bed with Hydraulic Storage (`BED-MOD-001`)
2. 4-Door Matching Teak Wardrobe with Internal Locker (`ALM-MOD-001`)
3. 6-Seater Royal Dining Table with Cushioned Chairs (`DIN-MOD-001`)
4. **Complimentary Life-Event Gifts:**
   - 2x Luxury Memory Foam Ortho Pillows (Worth ₹4,800 — FREE)
   - 1x Waterproof Quilted Mattress Protector (Worth ₹2,500 — FREE)
   - Narayana Mistri VIP White-Glove Installation (Worth ₹3,500 — FREE)
* **Realized Gross Profit to Showroom:** **₹88,200 (36% Net Margin)**

---

## 6. Old Furniture Exchange & Buyback Valuation Matrix

To capture customer upgrades from old wooden furniture to new Godrej Interio suites:

* **Solid Teak / Rosewood (Old Heritage Furniture):**
  - Evaluated at salvage wood timber rates: **₹800 – ₹1,200 per Cubic Foot**.
  - Credit voucher applied directly as token advance against new suite.
* **Old Modular / Particle Board Furniture:**
  - Flat promotional trade-in exchange bonus: **₹2,000 – ₹4,000** off the new order invoice.
  - Scrapped or re-sold to local rental contractors in Rayagada.
