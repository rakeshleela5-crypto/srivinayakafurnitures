# OmniBuild OS™ — Product Requirement Document (PRD)
**Target Entity:** Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship Showroom)  
**Executive Sponsors:** Naresh & Naren (Store Directors)  
**Author:** Product & Architecture Team  
**Scope:** Phase 4 Production Modules  

---

## Part 1: Module A — Production Meta WhatsApp Cloud API Gateway

### 1. Objective
Graduate from the local WhatsApp Bot Simulator (`WhatsAppBotSimulator.jsx`) to an edge-hosted Meta WhatsApp Cloud API Gateway capable of receiving real inbound messages from customers across Rayagada/Koraput and responding in real-time with verified inventory, prices, and showroom festive offers.

### 2. User Personas
* **Customer (Smt. Manjula / Dr. Jena):** Wants catalog photos, dimensions, and prices without travelling to the showroom.
* **Store Directors (Naresh & Naren):** Need instant WhatsApp alerts when a high-intent inquiry exceeds ₹1,50,000 for direct director VIP follow-up.
* **Showroom Consultant (Sunil):** Converts chatbot inquiries into in-store showroom appointments.

### 3. Functional Requirements
* **FR-W1: Webhook Ingestion & Verification:**
  - Endpoint: `GET /api/webhook/whatsapp` (handles Meta challenge verification with secure verification token).
  - Endpoint: `POST /api/webhook/whatsapp` (receives inbound text, button clicks, and location pins).
* **FR-W2: AI Concierge NLP Routing:**
  - Queries incoming text against the 115-SKU catalog.
  - Automatically respects customer language (Odia, Telugu, or English).
  - Enforces firewall guardrails: Never reveals factory purchase costs, wholesale margins, or competitor pricing.
* **FR-W3: Interactive Catalog Messages:**
  - Sends WhatsApp Interactive Button Messages with actions:
    1. `[🛋️ View 3D Floor Model]`
    2. `[🔒 SafeLock 48-Hr Hold]`
    3. `[📞 Speak to Director Naresh & Naren]`
* **FR-W4: Ultra-VIP Lead Alerting:**
  - When customer inquiry budget $\ge$ ₹1,50,000 or category includes "Wedding Suite", the gateway immediately dispatches an outbound alert to Directors Naresh & Naren (`+91 93905 53301`).

---

## Part 2: Module B — Autonomous Fleet GPS & Master Carpenter SmartKit Dispatch

### 1. Objective
Ensure end-to-end delivery integrity from the Rayagada dock to customer doorstep, eliminating transit damage disputes and assembly delays.

### 2. User Personas
* **Fleet Driver (Tophan Gouda):** Drives Tata Ace (`OD-18-A-1234`), captures customer OTP and digital signature on phone screen.
* **Master Carpenter (Narayana Mistri):** Receives installation work orders, performs laser room fitment, and reports completion with photo proof.
* **Warehouse Supervisor (Santosh):** Verifies all 5 cartons of the SmartKit™ are scanned before issuing gatepass.

### 3. Functional Requirements
* **FR-F1: 5-Box SmartKit™ Staging & Gatepass Validation:**
  - Before a vehicle departs dock, all 5 cartons (`Headboard`, `Side Rails`, `Metal Grid`, `Hardware Kit`, `Mattress Base`) must be scanned with barcode scanner.
  - Prevents partial dispatches (e.g. bed delivered without assembly hardware).
* **FR-F2: Doorstep ePOD & Cryptographic OTP Handover:**
  - Delivery cannot be marked completed without entering the 4-digit Delivery OTP sent to the customer's phone (`otp_log` table in D1).
  - Touchscreen HTML5 Canvas captures the customer's legal signature.
* **FR-F3: Doorstep Dynamic UPI Balance Collection:**
  - If an order has a pending balance (e.g. ₹50,000 remaining on delivery), the driver app renders a dynamic UPI QR code linked to `9390553301@ybl` with the exact balance pre-filled.
* **FR-F4: Master Carpenter 24-Hour SLA Timer:**
  - Upon successful ePOD signature, a carpenter work order is automatically generated in `carpenter_work_orders` table.
  - Narayana Mistri receives an SMS/WhatsApp dispatch with room blueprint and customer contact.
  - Assembly must be completed within 24 hours to maintain 5-star customer Google review ratings.
