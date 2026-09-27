/**
 * ⏰ Master Autonomous Cron Worker for OmniBuild OS™
 * Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
 * 
 * 20-BOT AUTONOMOUS SHOWROOM FLEET:
 * 1.  30 15 * * *  (09:00 PM IST) ➔ 9:00 PM EOD Cash & Sales Summary Slip
 * 2.  30 4 * * *   (10:00 AM IST) ➔ Morning Customer Follow-Up & Bridal VIP Registry
 * 3.  0 * /2 * * * (Every 2h)     ➔ SafeLock 48h Token Hold Recovery Guard
 * 4.  30 5 * * *   (11:00 AM IST) ➔ Floor Aging Stock Clearance Radar (>45 Days)
 * 5.  0 3 * * *    (08:30 AM IST) ➔ Bank UTR & Payment Auto-Reconciler
 * 6.  0 10 * * *   (03:30 PM IST) ➔ Fleet Route Manifest & Driver Dispatch
 * 7.  30 4 * * 1   (Mon 10:00 AM) ➔ Architect Weekly Volume & Commission Payout
 * 8.  30 18 * * *  (12:00 AM Mid) ➔ D1 Maintenance & Sovereign R2 Cloud Backup
 * 9.  0 * /4 * * * (Every 4h)     ➔ Godrej Khalapur Factory Low-Stock Auto-PO
 * 10. 30 11 * * *  (05:00 PM IST) ➔ Carpenter Hydraulic Assembly SLA Sentinel
 * 11. 30 6 * * *   (12:00 PM IST) ➔ Customer 1-Year Bed Care & Anniversary Nudge
 * 12. 30 3 1 * *   (1st of Month) ➔ Monthly GST 3B Outward Tax Summary for CA
 * 13. 30 14 * * *  (08:00 PM IST) ➔ Daily Staff Sales Leaderboard & Incentives
 * 14. 30 12 * * *  (06:00 PM IST) ➔ Google 5-Star Review & Photo Referral Booster
 * 15. 30 10 * * *  (04:00 PM IST) ➔ Delivered Orders Balance Due Recovery Chaser
 * 16. 30 5 * * 3   (Wed 11:00 AM) ➔ Godrej 2% Early Cash Discount Optimizer
 * 17. 30 8 * * *   (02:00 PM IST) ➔ Factory Lorry Receipt (LR) & Transit Damage Radar
 * 18. * /30 * * * *(Every 30 Min) ➔ SmartKit 5-Box Dock Loading Integrity Guard
 * 19. 0 18 * * 0   (Sun 11:30 PM) ➔ Zero Trust Security & P&L Vault Digest
 */

const EDGE_BASE_URL = "https://srivinayakafurnitures.rakeshleela5.workers.dev/api/d1/cron";

const CRON_ROUTES = {
  "30 15 * * *": {
    endpoints: [`${EDGE_BASE_URL}/9pm-summary`],
    title: "Daily 9:00 PM EOD Showroom Cash & Sales Summary Slip",
    dept: "Executive Sales"
  },
  "30 4 * * *": {
    endpoints: [`${EDGE_BASE_URL}/morning-followups`, `${EDGE_BASE_URL}/bridal-registry`],
    title: "10:00 AM Morning Customer Walk-In Follow-Up & Bridal Registry",
    dept: "CRM & VIP Sales"
  },
  "0 */2 * * *": {
    endpoints: [`${EDGE_BASE_URL}/safelock-expiry-guard`],
    title: "SafeLock 48-Hour Token Hold Recovery Guard",
    dept: "Inventory Management"
  },
  "30 5 * * *": {
    endpoints: [`${EDGE_BASE_URL}/floor-aging-radar`],
    title: "11:00 AM Floor Aging Display Clearance Radar",
    dept: "Showroom Merchandising"
  },
  "0 3 * * *": {
    endpoints: [`${EDGE_BASE_URL}/bank-utr-reconcile`],
    title: "08:30 AM Morning Bank UTR & Payment Auto-Reconciler",
    dept: "Finance & Accounts"
  },
  "0 10 * * *": {
    endpoints: [`${EDGE_BASE_URL}/fleet-dispatch-manifest`],
    title: "03:30 PM Fleet Route Manifest & Driver Dispatch",
    dept: "Logistics & Delivery"
  },
  "30 4 * * MON": {
    endpoints: [`${EDGE_BASE_URL}/architect-commission`],
    title: "Monday 10:00 AM Architect Commission & TDS Ledger",
    dept: "B2B Design Partners"
  },
  "30 4 * * 1": {
    endpoints: [`${EDGE_BASE_URL}/architect-commission`],
    title: "Monday 10:00 AM Architect Commission & TDS Ledger",
    dept: "B2B Design Partners"
  },
  "30 18 * * *": {
    endpoints: [`${EDGE_BASE_URL}/midnight-maintenance-backup`],
    title: "12:00 AM Midnight Database Maintenance & R2 Cloud Backup",
    dept: "Sovereign Cloud Ops"
  },
  "0 */4 * * *": {
    endpoints: [`${EDGE_BASE_URL}/factory-auto-po`],
    title: "Every 4 Hours Godrej Khalapur Factory Auto-PO Generator",
    dept: "Procurement & Factory Replenishment"
  },
  "30 11 * * *": {
    endpoints: [`${EDGE_BASE_URL}/carpenter-sla-sentinel`],
    title: "05:00 PM Carpenter Hydraulic Assembly SLA Sentinel",
    dept: "Field Installation Services"
  },
  "30 6 * * *": {
    endpoints: [`${EDGE_BASE_URL}/customer-anniversary-care`],
    title: "12:00 PM Customer 1-Year Bed Care & Anniversary Nudge",
    dept: "Customer Delight & Retention"
  },
  "30 3 1 * *": {
    endpoints: [`${EDGE_BASE_URL}/monthly-gst-3b-ledger`],
    title: "1st of Month 09:00 AM GST 3B Outward Tax Summary",
    dept: "Taxation & Audit"
  },
  "30 14 * * *": {
    endpoints: [`${EDGE_BASE_URL}/staff-leaderboard`],
    title: "08:00 PM Daily Staff Sales Leaderboard & Incentives",
    dept: "Human Resources & Motivation"
  },
  "30 12 * * *": {
    endpoints: [`${EDGE_BASE_URL}/google-review-booster`],
    title: "06:00 PM Google 5-Star Review & Photo Referral Booster",
    dept: "Brand Reputation & Marketing"
  },
  "30 10 * * *": {
    endpoints: [`${EDGE_BASE_URL}/balance-due-chaser`],
    title: "04:00 PM Delivered Orders Balance Due Recovery Chaser",
    dept: "Credit Control & Cash Flow"
  },
  "30 5 * * WED": {
    endpoints: [`${EDGE_BASE_URL}/supplier-early-discount`],
    title: "Wednesday 11:00 AM Godrej 2% Early Cash Discount Optimizer",
    dept: "Treasury & Supplier Relations"
  },
  "30 5 * * 3": {
    endpoints: [`${EDGE_BASE_URL}/supplier-early-discount`],
    title: "Wednesday 11:00 AM Godrej 2% Early Cash Discount Optimizer",
    dept: "Treasury & Supplier Relations"
  },
  "30 8 * * *": {
    endpoints: [`${EDGE_BASE_URL}/transit-lr-radar`],
    title: "02:00 PM Factory LR Transit & Cargo Damage Radar",
    dept: "Freight & Insurance"
  },
  "*/30 * * * *": {
    endpoints: [`${EDGE_BASE_URL}/smartkit-dock-integrity`],
    title: "Every 30 Min SmartKit 5-Box Dock Loading Integrity Guard",
    dept: "Warehouse Quality Assurance"
  },
  "0 18 * * SUN": {
    endpoints: [`${EDGE_BASE_URL}/security-vault-digest`],
    title: "Sunday 11:30 PM Zero Trust Security & Vault Digest",
    dept: "Director Cyber Governance"
  },
  "0 18 * * 0": {
    endpoints: [`${EDGE_BASE_URL}/security-vault-digest`],
    title: "Sunday 11:30 PM Zero Trust Security & Vault Digest",
    dept: "Director Cyber Governance"
  }
};

/**
 * Checks if a 5-part cron expression is due at the given UTC time
 */
function isJobDue(cronStr, date = new Date()) {
  const parts = cronStr.trim().split(/\s+/);
  if (parts.length < 5) return false;
  const [minPart, hourPart, domPart, monthPart, dowPart] = parts;

  const currentMin = date.getUTCMinutes();
  const currentHour = date.getUTCHours();
  const currentDate = date.getUTCDate();
  const currentMonth = date.getUTCMonth() + 1; // 1-12
  const currentDow = date.getUTCDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  // Check minute (+/- 5 min window for Cloudflare edge scheduler jitter)
  function matchMin(p, m) {
    if (p === "*") return true;
    if (p === "*/30") return Math.abs(m - 0) <= 5 || Math.abs(m - 30) <= 5 || Math.abs(m - 60) <= 5;
    const target = parseInt(p, 10);
    return !isNaN(target) && Math.abs(m - target) <= 5;
  }

  // Check hour
  function matchHour(p, h) {
    if (p === "*") return true;
    if (p === "*/2") return h % 2 === 0;
    if (p === "*/4") return h % 4 === 0;
    const target = parseInt(p, 10);
    return !isNaN(target) && target === h;
  }

  // Check day of month
  function matchDom(p, d) {
    if (p === "*") return true;
    const target = parseInt(p, 10);
    return !isNaN(target) && target === d;
  }

  // Check month
  function matchMonth(p, mo) {
    if (p === "*") return true;
    const target = parseInt(p, 10);
    return !isNaN(target) && target === mo;
  }

  // Check day of week
  function matchDow(p, dow) {
    if (p === "*") return true;
    const pUpper = p.toUpperCase();
    if (pUpper === "SUN" || pUpper === "0" || pUpper === "7") return dow === 0;
    if (pUpper === "MON" || pUpper === "1") return dow === 1;
    if (pUpper === "TUE" || pUpper === "2") return dow === 2;
    if (pUpper === "WED" || pUpper === "3") return dow === 3;
    if (pUpper === "THU" || pUpper === "4") return dow === 4;
    if (pUpper === "FRI" || pUpper === "5") return dow === 5;
    if (pUpper === "SAT" || pUpper === "6") return dow === 6;
    return false;
  }

  return matchMin(minPart, currentMin) &&
         matchHour(hourPart, currentHour) &&
         matchDom(domPart, currentDate) &&
         matchMonth(monthPart, currentMonth) &&
         matchDow(dowPart, currentDow);
}

export default {
  /**
   * Scheduled hook invoked automatically by Cloudflare Edge cron scheduler
   */
  async scheduled(event, env, ctx) {
    const cronSchedule = event.cron;
    const now = new Date();
    console.log(`[Cron Master] Edge scheduler triggered: "${cronSchedule}" at UTC ${now.toISOString()}`);

    let tasksToRun = [];

    // If an individual custom schedule triggered directly
    if (cronSchedule && cronSchedule !== "*/30 * * * *" && CRON_ROUTES[cronSchedule]) {
      tasksToRun = [CRON_ROUTES[cronSchedule]];
    } else {
      // Master 30-minute scheduler tick: evaluate which fleet bots are due now
      const seenTitles = new Set();
      for (const [sched, config] of Object.entries(CRON_ROUTES)) {
        if (!seenTitles.has(config.title) && isJobDue(sched, now)) {
          seenTitles.add(config.title);
          tasksToRun.push(config);
        }
      }
    }

    if (tasksToRun.length === 0) {
      console.log(`[Cron Master] No specific fleet jobs due at this interval.`);
      return;
    }

    console.log(`[Cron Master] Executing ${tasksToRun.length} due fleet job(s)...`);

    for (const taskConfig of tasksToRun) {
      console.log(`[Cron Router] Running: ${taskConfig.title}`);
      for (const endpoint of taskConfig.endpoints) {
        try {
          const response = await fetch(endpoint, {
            headers: {
              "X-Cron-Signature": "CLOUDFLARE_CRON_SCHEDULED_TRIGGER",
              "User-Agent": "OmniBuild-20Bot-Fleet/2.0"
            }
          });
          const result = await response.json();
          console.log(`[Cron Success] ${endpoint}:`, JSON.stringify(result));
        } catch (err) {
          console.error(`[Cron Error] Failed running ${endpoint}:`, err);
        }
      }
    }
  },

  /**
   * HTTP handler allowing manual health checks and on-demand trigger testing
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestedJob = url.searchParams.get("job");

    if (requestedJob) {
      const matchedKey = Object.keys(CRON_ROUTES).find(key => 
        CRON_ROUTES[key].endpoints.some(ep => ep.endsWith(requestedJob)) ||
        key.replace(/\s+/g, '') === requestedJob.replace(/\s+/g, '')
      );

      if (matchedKey) {
        const task = CRON_ROUTES[matchedKey];
        const results = [];
        for (const ep of task.endpoints) {
          try {
            const res = await fetch(ep, { headers: { "X-Cron-Signature": "CLOUDFLARE_MANUAL_TRIGGER" } });
            results.push(await res.json());
          } catch (err) {
            results.push({ error: err.message });
          }
        }
        return new Response(JSON.stringify({
          status: "EXECUTED",
          job: requestedJob,
          schedule: matchedKey,
          title: task.title,
          department: task.dept,
          results,
          timestamp: new Date().toISOString()
        }, null, 2), { headers: { "Content-Type": "application/json" } });
      }
    }

    // Full 20-Bot Overview
    const allSchedules = Object.entries(CRON_ROUTES).map(([cron, details]) => ({
      cronSchedule: cron,
      task: details.title,
      department: details.dept,
      endpoints: details.endpoints,
      testUrl: `${url.origin}/?job=${details.endpoints[0].split('/').pop()}`
    }));

    return new Response(JSON.stringify({
      system: "OmniBuild OS™ 20-Bot Autonomous Fleet Engine",
      showroom: "Sri Vinayaka Furnitures (Godrej Interio Rayagada)",
      status: "ACTIVE_24_7",
      totalFleetBots: allSchedules.length,
      activeCronCount: allSchedules.length,
      schedules: allSchedules
    }, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
