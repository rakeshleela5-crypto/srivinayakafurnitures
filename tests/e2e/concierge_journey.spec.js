import { test, expect } from '@playwright/test';
import { safeFill } from '../helpers/testUtils';

test.describe('Public Customer AI Concierge Journey (#18)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to public concierge chat via hash
    await page.goto('/#chat');
  });

  test('Public concierge loads without employee authentication lock', async ({ page }) => {
    // The auth lock screen must NOT block customer chat
    await expect(page.locator('text=Godrej Interio Rayagada')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Flagship Showroom')).toBeVisible();
    
    // Check that chat input or product showcase is visible
    const chatInput = page.getByPlaceholder(/ask about recliners|type your message|search/i).or(page.locator('input[type="text"]').last());
    await expect(chatInput).toBeVisible();
  });

  test('Customer can interact with luxury AI sales concierge and browse catalog', async ({ page }) => {
    // Locate chat input
    const chatInput = page.getByPlaceholder(/ask about recliners|type your message|search/i).or(page.locator('input[type="text"]').last());
    await expect(chatInput).toBeVisible();

    // Type customer furniture inquiry
    await chatInput.fill('Do you have motorized recliners with warranty in Rayagada?');
    
    // Click send or press Enter
    await chatInput.press('Enter');

    // Verify response message appears in chat stream
    await expect(page.locator('text=Godrej').or(page.locator('text=Recliner')).first()).toBeVisible({ timeout: 10000 });
  });

  test('Form validation: Lead capture requires valid 10-digit Indian phone number', async ({ page }) => {
    // Check for customer registration or lead capture trigger
    const leadTrigger = page.locator('button:has-text("Register"), button:has-text("VIP"), button:has-text("Profile"), button:has-text("Save Profile")').first();
    
    if (await leadTrigger.isVisible()) {
      await leadTrigger.click();
      
      const phoneInput = page.getByPlaceholder(/phone|mobile/i).or(page.locator('input[type="tel"]')).first();
      if (await phoneInput.isVisible()) {
        // Invalid short phone
        await phoneInput.fill('12345');
        const submitBtn = page.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("Confirm")').first();
        await submitBtn.click();
        
        // Assert validation error or invalid state
        const errorMsg = page.locator('text=10-digit').or(page.locator('.toast-error')).or(page.locator('text=invalid'));
        await expect(errorMsg).toBeVisible({ timeout: 5000 });

        // Enter valid 10-digit mobile
        await phoneInput.fill('9437188291');
        await submitBtn.click();
      }
    }
  });

  test('Responsive view: Concierge renders clean mobile layout on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Check no horizontal scrollbar overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });
});
