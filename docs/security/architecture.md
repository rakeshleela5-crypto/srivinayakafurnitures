# 🏛️ Architecture & Threat Model
**OmniBuild OS™ — Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)**
*Conducted in accordance with Cloudflare Security Audit Specification*

---

## 1. System Overview
OmniBuild OS is a cloud-native showroom management system operating on Cloudflare Edge Workers, Cloudflare D1 SQL database (`srivinayaka-db`), and a React 19 Progressive Web Application (PWA).

### Subsystems:
1. **Frontend PWA (16 Tabs)**: Showroom POS, B2B Commercial Hub, SafeLock Inventory, Fleet Logistics, Barcode/QR Studios, Finance Ledger, Master Database.
2. **Edge API (`functions/api/d1/[[route]].js`)**: Cloudflare Workers edge router handling atomic D1 transactions, catalog sync, and WhatsApp/payment dispatches.
3. **Database Layer (Cloudflare D1 `srivinayaka-db`)**: 43 relational SQLite tables distributed across APAC colos with sub-millisecond query latency.
4. **AI & RAG Engine**: Multi-LLM failover router (Gemini 1.5 Flash ➔ Groq LLaMA 3.3 70B ➔ Local) backed by BM25 LangGraph-style agentic RAG for Godrej warranty retrieval.
5. **Scheduled Cron (`srivinayaka-9pm-cron`)**: Automated cron worker triggering daily at 9:00 PM IST (15:30 UTC).

---

## 2. Trust Boundaries & Actor Personas

```
                     [ Public Internet ]
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           [ Walk-in Customer ]  [ External Web Client ]
                    │                   │
  ──────────────────┼───────────────────┼─────────────────── (Internet Boundary)
                    ▼                   ▼
           [ React 19 PWA Client (Browser LocalStorage) ]
                    │
                    ├─ Staff: Sunil (Sales PIN)
                    ├─ Driver: Tophan (ePOD OTP)
                    └─ Executive: Director Rakesh (PIN 8899)
                    │
  ──────────────────┼─────────────────────────────────────── (Edge Boundary)
                    ▼
           [ Cloudflare Workers Edge Router (/api/d1/*) ]
                    │
  ──────────────────┼─────────────────────────────────────── (Data Boundary)
                    ▼
           [ Cloudflare D1 Relational Engine (43 Tables) ]
```

---

## 3. Entry Points & Attack Surfaces
| Entry Point | Protocol | Trust Level | Primary Risk |
| :--- | :---: | :---: | :--- |
| `POST /api/d1/query` | HTTPS JSON | Untrusted | Unauthorized SQL mutation / PII extraction |
| `POST /api/d1/dispatch` | HTTPS JSON | Untrusted | Order injection, fake payment confirmations |
| `GET /api/d1/sync-all` | HTTPS GET | Untrusted | Sensitive commercial customer data disclosure |
| `GET /api/d1/cron/9pm-summary` | HTTPS GET | Cron / Edge | EOD summary scraping |
| LocalStorage | Web Storage | Client-side | Gemini & Groq API key theft via XSS |
| PIN Overrides | UI Component | Staff | Sales staff unauthorized margin discount bypass |
