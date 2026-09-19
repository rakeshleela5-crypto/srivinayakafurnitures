# 🔍 Cloudflare Security Audit — Detailed Findings & Verification Traces
**OmniBuild OS™ — Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)**

---

## Finding SEC-001: Unauthenticated Arbitrary SQL Mutation on Edge Router
- **Verdict**: CONFIRMED & REMEDIATED ✓
- **Severity**: HIGH
- **Component**: `functions/api/d1/[[route]].js` (Line 378)
- **Attack Class**: Remote Unauthenticated SQL Data Manipulation
- **Hypothesis**: An external attacker sends a forged POST request to `/api/d1/query` with `{ "sql": "UPDATE orders SET total_amount_inr = 0 WHERE order_id = 'ORD-1001'" }`.
- **Pre-Fix Behavior**: Cloudflare edge Worker verified only that query started with `select`, `insert`, or `update`. The mutation succeeded without credentials.
- **Post-Fix Behavior**: Edge router strictly checks `Authorization` or `X-Director-Auth` header. Non-SELECT mutations return `401 Unauthorized` unless signed with Director authorization.

---

## Finding SEC-002: Hardcoded Director PIN & Disclosure in UI Placeholders
- **Verdict**: CONFIRMED & REMEDIATED ✓
- **Severity**: MEDIUM
- **Component**: `src/views/VoicePosView.jsx`, `src/components/modals/*`
- **Attack Class**: Information Disclosure in DOM / Secrets in Source
- **Hypothesis**: Junior showroom staff inspects the HTML input elements or looks at screen placeholders to read `placeholder="Enter 8899"` or `placeholder="PIN 8899"`.
- **Pre-Fix Behavior**: Secret PIN `8899` was visible as placeholder hint text.
- **Post-Fix Behavior**: All input elements sanitized to generic `••••` and `PIN` hints with no disclosure of the underlying key.

---

## Finding SEC-003: Permissive Wildcard CORS Header
- **Verdict**: CONFIRMED & REMEDIATED ✓
- **Severity**: LOW
- **Component**: `functions/api/d1/[[route]].js` (Line 15)
- **Attack Class**: Cross-Origin Resource Sharing (CORS) Over-Trust
- **Hypothesis**: A rogue website opened in the showroom browser sends cross-origin AJAX requests to mutate showroom orders.
- **Pre-Fix Behavior**: Wildcard `'Access-Control-Allow-Origin': '*'` permitted all domains.
- **Post-Fix Behavior**: Edge router validates request `Origin` header against showroom domains (`srivinayakafurnitures.rakeshleela5.workers.dev`, `localhost`, `web.app`).

---

## Finding SEC-004: Plaintext Storage of AI Provider API Keys
- **Verdict**: CONFIRMED & HARDENED ✓
- **Severity**: LOW
- **Component**: `src/services/aiRouterService.js` (Line 43)
- **Attack Class**: Insecure Client-Side Storage
- **Mitigation**: Stored in isolated origin storage, with environment variable priority fallbacks and failover router bounds.
