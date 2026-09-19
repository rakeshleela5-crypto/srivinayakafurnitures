export default {
  async scheduled(event, env, ctx) {
    console.log("⏰ 9:00 PM IST Scheduled Cron Triggered for Sri Vinayaka Furnitures!");
    const targetUrl = "https://srivinayakafurnitures.rakeshleela5.workers.dev/api/d1/cron/9pm-summary";
    try {
      const response = await fetch(targetUrl);
      const result = await response.json();
      console.log("9:00 PM Summary Output:", JSON.stringify(result));
    } catch (err) {
      console.error("Error executing 9:00 PM Cron:", err);
    }
  },

  async fetch(request, env, ctx) {
    const targetUrl = "https://srivinayakafurnitures.rakeshleela5.workers.dev/api/d1/cron/9pm-summary";
    try {
      const res = await fetch(targetUrl);
      const data = await res.json();
      return new Response(JSON.stringify({
        status: "ONLINE",
        service: "srivinayaka-9pm-cron",
        schedule: "30 15 * * * (9:00 PM IST Daily)",
        manualTriggerResult: data
      }, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
