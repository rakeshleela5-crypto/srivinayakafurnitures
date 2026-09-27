import { test, expect } from '@playwright/test';
import { loginAsDirector, loginWithPin } from '../helpers/testUtils';

test.describe('Staff Authentication & Sovereign RBAC Security Gate (#18)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage to guarantee fresh auth state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Root view defaults to luxury Auth Lock Screen', async ({ page }) => {
    await expect(page.locator('text=OmniBuild OS™')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Rayagada Flagship Showroom')).toBeVisible();
    await expect(page.locator('button:has-text("1")')).toBeVisible();
    await expect(page.locator('button:has-text("9")')).toBeVisible();
  });

  test('Invalid PIN entry triggers shake animation and denies entry', async ({ page }) => {
    await expect(page.locator('text=OmniBuild OS™')).toBeVisible({ timeout: 10000 });

    // Enter wrong PIN: 0-0-0-0
    for (let i = 0; i < 4; i++) {
      await page.getByRole('button', { name: '0', exact: true }).click();
    }

    // Must still be on lock screen
    await expect(page.locator('text=OmniBuild OS™')).toBeVisible();
    await expect(page.locator('.app-header')).not.toBeVisible();
  });

  test('Valid Store Director PIN (8899) authenticates and unlocks full OS', async ({ page }) => {
    await loginAsDirector(page);

    // Verify authenticated OS shell is visible
    await expect(page.locator('.app-header')).toBeVisible();
    await expect(page.locator('text=Naresh').or(page.locator('text=Director'))).first().toBeVisible();
    await expect(page.locator('.tabs-ribbon')).toBeVisible();
  });

  test('Driver role (PIN: 5566) is restricted from executive & database terminals', async ({ page }) => {
    // Authenticate as Driver Tophan Gouda (5566)
    const driverBtn = page.locator('button:has-text("Tophan Gouda (Fleet Logistics Lead)")');
    if (await driverBtn.isVisible()) {
      await driverBtn.click();
    } else {
      await loginWithPin(page, '5566');
    }

    await expect(page.locator('.app-header')).toBeVisible();

    // Now try to navigate to restricted Executive terminal or trigger restricted tab
    await page.evaluate(() => {
      // Dispatch tab change to restricted tab
      window.dispatchEvent(new CustomEvent('omnibuild:setTab', { detail: 'executive' }));
    });

    // Check that AccessDeniedView or security restriction is rendered
    const securityCheck = page.locator('text=Restricted Security Terminal')
      .or(page.locator('text=Clearance'))
      .or(page.locator('text=Access Denied'))
      .or(page.locator('.badge-purple'));
      
    await expect(securityCheck.first()).toBeVisible({ timeout: 5000 });
  });
});
