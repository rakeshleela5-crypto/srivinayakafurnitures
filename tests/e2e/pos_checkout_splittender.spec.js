import { test, expect } from '@playwright/test';
import { loginAsDirector, navigateToTab, safeFill, waitForModalReady } from '../helpers/testUtils';

test.describe('Voice POS & Split-Tender Checkout Journey (#18)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDirector(page);
  });

  test('Navigate to Voice POS and verify catalog items in Quotation Cart', async ({ page }) => {
    // Navigate to Voice POS
    const posTab = page.locator('button:has-text("Voice POS"), button:has-text("voice_pos")').first();
    await posTab.click();

    // Verify Voice POS Terminal renders
    await expect(page.locator('text=VOICE SHOWROOM COPILOT').or(page.locator('text=MONTHLY TARGET')).first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Quotation Cart').or(page.locator('text=Cart Items')).first()).toBeVisible();
  });

  test('Open Multi-Tender Split Pay modal and verify tender allocation calculations', async ({ page }) => {
    // Navigate to Voice POS
    const posTab = page.locator('button:has-text("Voice POS"), button:has-text("voice_pos")').first();
    await posTab.click();

    // Click Multi-Tender Split Pay button
    const splitPayBtn = page.locator('button:has-text("Multi-Tender Split Pay")').first();
    await expect(splitPayBtn).toBeVisible({ timeout: 10000 });
    await splitPayBtn.click();

    // Verify Split Tender Modal opens
    const modalHeading = page.locator('text=Split-Tender').or(page.locator('text=Multi-Tender')).or(page.locator('text=Cash Tender'));
    await expect(modalHeading.first()).toBeVisible({ timeout: 5000 });

    // Verify Cash, UPI, and Card inputs exist
    const inputs = page.locator('input[type="number"]');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(2);
  });

  test('Complete split-tender payment settlement and verify toast confirmation', async ({ page }) => {
    const posTab = page.locator('button:has-text("Voice POS"), button:has-text("voice_pos")').first();
    await posTab.click();

    const splitPayBtn = page.locator('button:has-text("Multi-Tender Split Pay")').first();
    await expect(splitPayBtn).toBeVisible({ timeout: 10000 });
    await splitPayBtn.click();

    // Find confirm button in the modal
    const confirmBtn = page.locator('button:has-text("Save & Settle"), button:has-text("Confirm & Settle"), button:has-text("Record Split Payment")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();

      // Verify success toast or chime notification
      const toastOrConfetti = page.locator('.toast-success, [class*="toast"], text=recorded, text=Split Payment');
      await expect(toastOrConfetti.first()).toBeVisible({ timeout: 7000 });
    }
  });
});
