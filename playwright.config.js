import { defineConfig, devices } from '@playwright/test';

/**
 * OmniBuild OS™ — Playwright End-to-End Test Suite Configuration
 * Built according to Playwright Pro standards:
 * - Deterministic locator rules
 * - Auto-retrying assertions (Zero waitForTimeout)
 * - Trace on first retry
 * - WebServer auto-booting Vite on localhost:5173
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 7000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 15000,
    viewport: { width: 1440, height: 900 }
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      },
    },
    {
      name: 'Mobile Showroom Worker (Pixel 7)',
      use: { 
        ...devices['Pixel 7'],
        isMobile: true
      },
    },
    {
      name: 'Customer Concierge (iPhone 14)',
      use: { 
        ...devices['iPhone 14'],
        isMobile: true
      },
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30000
  }
});
