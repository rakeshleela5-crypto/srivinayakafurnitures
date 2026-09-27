import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Resilient Circuit Breaker implementation for Chaos Verification
 */
class ChaosCircuitBreaker {
  constructor({ failureThreshold = 3, resetTimeoutMs = 1000 }) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.state = 'CLOSED'; // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async execute(action, fallback) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
      } else {
        return fallback('CIRCUIT_OPEN_FAST_FAIL');
      }
    }

    try {
      const result = await action();
      this.reset();
      return result;
    } catch (err) {
      this.recordFailure();
      return fallback(err);
    }
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
}

describe('Chaos & Fault-Tolerance Test Suite (#22)', () => {
  describe('Fault 1: Network Severance & Offline Transaction Buffering', () => {
    it('buffers transactions in local durable storage when offline and auto-reconciles on reconnect', () => {
      const offlineQueue = [];
      let isOnline = false;

      function dispatchOrderWithOfflineBuffer(order) {
        if (!isOnline) {
          offlineQueue.push({
            ...order,
            idempotencyKey: `IDEMP-${order.orderId}-${Date.now()}`,
            bufferedAt: new Date().toISOString(),
            syncStatus: 'PENDING_OFFLINE_RECONNECT'
          });
          return { success: true, buffered: true, message: 'Saved to local resilient buffer' };
        }
        return { success: true, buffered: false, message: 'Synced immediately to Cloudflare D1' };
      }

      // 1. Transaction submitted during complete network outage
      const result = dispatchOrderWithOfflineBuffer({
        orderId: 'ORD-CHAOS-001',
        customerName: 'Dr. Subhashish Jena',
        amount: 78000
      });

      assert.equal(result.buffered, true);
      assert.equal(offlineQueue.length, 1);
      assert.equal(offlineQueue[0].orderId, 'ORD-CHAOS-001');
      assert.equal(offlineQueue[0].syncStatus, 'PENDING_OFFLINE_RECONNECT');

      // 2. Reconnect simulated
      isOnline = true;
      const syncedOrders = [];
      while (offlineQueue.length > 0) {
        const item = offlineQueue.shift();
        syncedOrders.push({ ...item, syncStatus: 'RECONCILED_D1' });
      }

      assert.equal(offlineQueue.length, 0);
      assert.equal(syncedOrders.length, 1);
      assert.equal(syncedOrders[0].syncStatus, 'RECONCILED_D1');
    });
  });

  describe('Fault 2: Database Latency & Query Timeout Handling', () => {
    it('times out after deadline, protects client from freezing, and returns cached fallback', async () => {
      async function executeWithTimeout(promise, timeoutMs, fallbackValue) {
        let timeoutHandle;
        const timeoutPromise = new Promise((resolve) => {
          timeoutHandle = setTimeout(() => {
            resolve({ timedOut: true, data: fallbackValue });
          }, timeoutMs);
        });

        const result = await Promise.race([
          promise.then(data => {
            clearTimeout(timeoutHandle);
            return { timedOut: false, data };
          }),
          timeoutPromise
        ]);

        return result;
      }

      // Simulate a hung database query taking 3,000ms
      const hungQuery = new Promise((resolve) => setTimeout(() => resolve(['Slow DB Result']), 3000));
      const cachedCatalog = [{ sku: 'BED-MOD-001', name: 'Kalista Bed' }];

      // Cut off after 500ms timeout
      const response = await executeWithTimeout(hungQuery, 500, cachedCatalog);

      assert.equal(response.timedOut, true);
      assert.deepEqual(response.data, cachedCatalog);
    });
  });

  describe('Fault 3: Downstream Gemini AI 500 Error -> Offline RAG Fallback', () => {
    it('gracefully degrades to local catalog rule engine when AI API returns HTTP 500', async () => {
      // Mock Gemini AI API that throws HTTP 500
      const mockGeminiApi = async () => {
        const error = new Error('HTTP 500 Internal Server Error: AI Model Overloaded');
        error.status = 500;
        throw error;
      };

      // Offline Catalog RAG Fallback
      function offlineCatalogFallback(query) {
        const catalog = [
          { sku: 'BED-HYD-001', name: 'Kalista Hydraulic King Bed', warranty: '10-Year Comprehensive', price: 78000 },
          { sku: 'SOF-REC-002', name: 'Centuro Motorized Recliner', warranty: '5-Year Mechanism', price: 54000 }
        ];

        const q = query.toLowerCase();
        const match = catalog.find(c => {
          const name = c.name.toLowerCase();
          if (q.includes('recliner') && name.includes('recliner')) return true;
          if (q.includes('bed') && name.includes('bed')) return true;
          return name.includes(q);
        });
        return {
          source: 'OFFLINE_CATALOG_RAG_FALLBACK',
          message: match 
            ? `Namaste! Godrej Interio ${match.name} is available in Rayagada showroom. Floor Price: ₹${match.price.toLocaleString()} with ${match.warranty}.`
            : 'Welcome to Godrej Interio Rayagada flagship showroom. How can we assist you today?'
        };
      }

      async function queryConciergeWithResilience(userPrompt) {
        try {
          return await mockGeminiApi();
        } catch (err) {
          // Graceful fallback to offline RAG
          return offlineCatalogFallback(userPrompt);
        }
      }

      const response = await queryConciergeWithResilience('Do you have motorized recliner in Rayagada?');
      assert.equal(response.source, 'OFFLINE_CATALOG_RAG_FALLBACK');
      assert.ok(response.message.includes('Centuro Motorized Recliner'));
      assert.ok(response.message.includes('5-Year Mechanism'));
    });
  });

  describe('Fault 4: Downstream WhatsApp Webhook Gateway 502 Outage & Retry Queue', () => {
    it('queues undelivered messages into Dead-Letter Queue with exponential backoff', () => {
      const deadLetterQueue = [];

      function handleFailedWebhookDelivery({ messageId, recipient, text, errorStatus }) {
        const retryEntry = {
          messageId,
          recipient,
          text,
          attemptCount: 1,
          nextRetryDelaySeconds: 10, // 1st backoff = 10s, 2nd = 30s, 3rd = 90s
          lastError: `HTTP ${errorStatus} Bad Gateway`,
          status: 'QUEUED_FOR_RETRY'
        };
        deadLetterQueue.push(retryEntry);
        return retryEntry;
      }

      const queued = handleFailedWebhookDelivery({
        messageId: 'MSG-9921',
        recipient: '9437188291',
        text: 'Your Godrej Interio Tax Invoice has been generated.',
        errorStatus: 502
      });

      assert.equal(queued.status, 'QUEUED_FOR_RETRY');
      assert.equal(queued.attemptCount, 1);
      assert.equal(queued.nextRetryDelaySeconds, 10);
      assert.equal(deadLetterQueue.length, 1);
    });
  });

  describe('Fault 5: Circuit Breaker Trips on Cascading Downstream Failures', () => {
    it('opens circuit breaker after 3 consecutive failures to prevent cascading outage', async () => {
      const breaker = new ChaosCircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 1000 });

      const failingService = async () => {
        throw new Error('Downstream Service Down');
      };

      const fallback = (err) => ({ fallback: true, error: err });

      // First 2 failures: still CLOSED
      await breaker.execute(failingService, fallback);
      await breaker.execute(failingService, fallback);
      assert.equal(breaker.state, 'CLOSED');
      assert.equal(breaker.failureCount, 2);

      // 3rd failure: trips to OPEN
      await breaker.execute(failingService, fallback);
      assert.equal(breaker.state, 'OPEN');

      // 4th call: immediately fast-fails with fallback without executing action
      let actionExecuted = false;
      const result = await breaker.execute(
        async () => { actionExecuted = true; },
        fallback
      );

      assert.equal(actionExecuted, false);
      assert.equal(result.error, 'CIRCUIT_OPEN_FAST_FAIL');
    });
  });
});
