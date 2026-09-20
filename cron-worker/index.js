/**
 * ⏰ Master Autonomous Cron Worker for OmniBuild OS™
 * Sri Vinayaka Furnitures (Godrej Interio Rayagada Flagship)
 * 
 * Manages 5 core showroom autonomous background schedules:
 * 1. 30 15 * * *  (09:00 PM IST Daily)   ➔ 9:00 PM EOD Cash & Sales Summary Slip
 * 2. 30 4 * * *   (10:00 AM IST Daily)   ➔ Morning Customer Follow-Up & Festive Offer Engine
 * 3. 0 * /2 * * * (Every 2 Hours)        ➔ SafeLock 48h Token Hold & Inventory Recovery Guard
 * 4. 0 10 * * *   (03:30 PM IST Daily)   ➔ Fleet Delivery Route Manifest & Driver Dispatch
 * 5. 30 4 * * 1   (Monday 10:00 AM IST)  ➔ Architect Weekly Volume & Commission Payout Ledger
 */

const EDGE_BASE_URL = "https://srivinayakafurnitures.rakeshleela5.workers.dev/api/d1/cron";

const CRON_ROUTES = {
  "30 15 * * *": {
    endpoint: `${EDGE_BASE_URL}/9pm-summary`,
    title: "Daily 9:00 PM EOD Showroom Cash & Sales Summary Slip",
    description: "Reconciles day's cash safe vs UPI and dispatches WhatsApp closing slip to Director"
  },
  "30 4 * * *": {
    endpoint: `${EDGE_BASE_URL}/morning-followups`,
    title: "10:00 AM Morning Customer Follow-Up Engine",
    description: "Scans past 24h-48h walk-in leads and dispatches personalized festive discount nudges"
  },
  "0 */2 * * *": {
    endpoint: `${EDGE_BASE_URL}/safelock-expiry-guard`,
    title: "SafeLock 48-Hour Token Hold & Inventory Recovery Guard",
    description: "Releases unconfirmed tentative holds back into active warehouse stock"
  },
  "0 10 * * *": {
    endpoint: `${EDGE_BASE_URL}/fleet-dispatch-manifest`,
    title: "03:30 PM Fleet Delivery Route Manifest & Driver Dispatch",
    description: "Pushes optimized delivery sequence, addresses, and OTP list to driver Tophan Gouda"
  },
  "30 4 * * 1": {
    endpoint: `${EDGE_BASE_URL}/architect-commission`,
    title: "Monday 10:00 AM Architect Weekly Commission Payout",
    description: "Tallies weekly architect referral project volume and calculates net commission & TDS"
  }
};

export default {
  /**
   * Scheduled hook invoked automatically by Cloudflare Edge cron scheduler
   */
  async scheduled(event, env, ctx) {
    const cronSchedule = event.cron;
    const taskConfig = CRON_ROUTES[cronSchedule];

    if (!taskConfig) {
      console.warn(`[Cron Router] Unknown cron trigger received: ${cronSchedule}`);
      return;
    }

    console.log(`[Cron Router] Executing task: ${taskConfig.title} (${cronSchedule})`);
    
    try {
      const response = await fetch(taskConfig.endpoint, {
        headers: {
          "X-Cron-Signature": "CLOUDFLARE_CRON_SCHEDULED_TRIGGER",
          "User-Agent": "OmniBuild-Sovereign-Cron-Worker/2.0"
        }
      });
      const result = await response.json();
      console.log(`[Cron Router Success] ${taskConfig.title}:`, JSON.stringify(result));
    } catch (err) {
      console.error(`[Cron Router Error] Failed running ${taskConfig.title}:`, err);
    }
  },

  /**
   * HTTP handler allowing manual health checks and on-demand trigger testing
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const requestedJob = url.searchParams.get("job");

    // If a specific job was requested via query parameter ?job=9pm-summary etc.
    if (requestedJob) {
      const matchedKey = Object.keys(CRON_ROUTES).find(key => 
        CRON_ROUTES[key].endpoint.endsWith(requestedJob) ||
        key.replace(/\s+/g, '') === requestedJob.replace(/\s+/g, '')
      );

      if (matchedKey) {
        const task = CRON_ROUTES[matchedKey];
        try {
          const res = await fetch(task.endpoint, {
            headers: { "X-Cron-Signature": "CLOUDFLARE_MANUAL_TRIGGER" }
          });
          const data = await res.json();
          return new Response(JSON.stringify({
            status: "EXECUTED",
            job: requestedJob,
            schedule: matchedKey,
            title: task.title,
            result: data,
            timestamp: new Date().toISOString()
          }, null, 2), {
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          return new Response(JSON.stringify({
            status: "ERROR",
            job: requestedJob,
            error: err.message
          }, null, 2), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }

    // Default status overview listing all 5 automated cron jobs
    return new Response(JSON.stringify({
      system: "OmniBuild OS™ Master Cloudflare Cron Engine",
      showroom: "Sri Vinayaka Furnitures (Godrej Interio Rayagada)",
      status: "ACTIVE_24_7",
      activeCronCount: Object.keys(CRON_ROUTES).length,
      schedules: Object.entries(CRON_ROUTES).map(([cron, details]) => ({
        cronSchedule: cron,
        task: details.title,
        endpoint: details.endpoint,
        description: details.description,
        testUrl: `${url.origin}/?job=${details.endpoint.split('/').pop()}`
      })),
      triggerAllUrl: `${url.origin}/?job=all`
    }, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
