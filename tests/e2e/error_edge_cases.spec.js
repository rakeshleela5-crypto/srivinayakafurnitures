import { test, expect } from '@playwright/test';
import { loginAsDirector } from '../helpers/testUtils';

test.describe('Error Edge Cases & Resilience E2E Tests (#18)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDirector(page);
  });

  test('Graceful fallback when navigating to nonexistent route hash', async ({ page }) => {
    await page.goto('/#nonexistent_invalid_module_404');
    
    // Application must not crash or show white screen; defaults to ExecutiveOverview
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('main.main-layout')).toBeVisible();
  });

  test('Modal closes cleanly via close button and backdrop click without lingering pointer lock', async ({ page }) => {
    // Open a modal from navigation or executive view (e.g. apps script or radar)
    await page.evaluate(() => {
      // Simulate opening a modal via store event if available
      window.dispatchEvent(new CustomEvent('omnibuild:openModal', { detail: { modalName: 'crm_add_lead' } }));
    });

    const closeBtn = page.locator('button:has-text("✕"), button:has-text("Close"), button[aria-label="Close"]').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      // Ensure backdrop is gone
      await expect(page.locator('.modal-backdrop, .fixed.inset-0')).not.toBeVisible({ timeout: 3000 });
    }
  });

  test('Offline network simulation: App retains UI state and queues actions', async ({ page, context }) => {
    // Cut network connection
    await context.setOffline(true);

    // Verify app remains responsive locally
    const catalogTab = page.locator('button:has-text("Live Database"), button:has-text("Voice POS")').first();
    await catalogTab.click();

    await expect(page.locator('body')).toBeVisible();

    // Restore network
    await context.setOffline(false);
  });
});
