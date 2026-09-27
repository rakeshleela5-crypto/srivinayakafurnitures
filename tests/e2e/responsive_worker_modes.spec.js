import { test, expect } from '@playwright/test';
import { loginAsDirector } from '../helpers/testUtils';

test.describe('Responsive Views & Mobile Worker Terminals (#18)', () => {
  test('Direct URL hash #inward boots Dock 1 Inward Scanner terminal with mobile header', async ({ page }) => {
    // Navigate with worker hash
    await page.goto('/#inward');

    // If locked, authenticate
    const lockCard = page.locator('text=OmniBuild OS™');
    if (await lockCard.isVisible()) {
      await page.locator('button:has-text("Rakesh (Store Director & Owner)"), button:has-text("Santosh")').first().click();
    }

    // Verify Mobile Worker App Header appears
    await expect(page.locator('.mobile-worker-app-header')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=DOCK 1: INWARD SCANNER')).toBeVisible();

    // Verify "Full Desktop OS" button exists
    const desktopSwitch = page.locator('button:has-text("Full Desktop OS")');
    await expect(desktopSwitch).toBeVisible();

    // Clicking Full Desktop OS restores standard ribbons
    await desktopSwitch.click();
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.tabs-ribbon')).toBeVisible();
  });

  test('Direct URL hash #logistics boots Driver ePOD terminal with mobile header', async ({ page }) => {
    await page.goto('/#logistics');

    const lockCard = page.locator('text=OmniBuild OS™');
    if (await lockCard.isVisible()) {
      await page.locator('button:has-text("Tophan Gouda"), button:has-text("Rakesh")').first().click();
    }

    await expect(page.locator('.mobile-worker-app-header')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=DELIVERY ePOD')).toBeVisible();
  });

  test('Responsive viewports: Layout adapts across Mobile, Tablet, and Ultra-Wide Desktop', async ({ page }) => {
    await page.goto('/');
    await loginAsDirector(page);

    // 1. Mobile Viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    let clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

    // 2. Tablet Viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.tabs-ribbon')).toBeVisible();

    // 3. Desktop Viewport (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('.bottom-dock')).toBeVisible();
  });
});
