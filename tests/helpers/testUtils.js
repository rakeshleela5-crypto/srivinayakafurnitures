/**
 * OmniBuild OS™ — Resilient Anti-Flakiness Testing Utilities
 * Solves:
 * 1. React 19 Suspense lazy chunk loading race conditions
 * 2. Glassmorphism CSS modal backdrop animation delays
 * 3. 2.4G HID Laser Barcode Scanner timing buffers
 * 4. Microsecond state hydration lag
 */
import { expect } from '@playwright/test';

/**
 * Robustly logs into OmniBuild OS as Store Director Rakesh (PIN: 8899)
 */
export async function loginAsDirector(page) {
  await page.goto('/');
  
  // Wait for lock screen card
  const lockCard = page.locator('text=OmniBuild OS™');
  await expect(lockCard).toBeVisible({ timeout: 10000 });

  // Director quick-access role button or PIN entry
  const directorButton = page.locator('button:has-text("Naresh & Naren"), button:has-text("Store Director & Owner"), button:has-text("Rakesh")');
  if (await directorButton.isVisible()) {
    await directorButton.click();
  } else {
    // Enter 8-8-9-9 on numeric keypad
    for (const digit of ['8', '8', '9', '9']) {
      const keyBtn = page.getByRole('button', { name: digit, exact: true });
      await keyBtn.click();
    }
  }

  // Ensure header and main layout ribbon have fully hydrated
  await expect(page.locator('.app-header')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.tabs-ribbon')).toBeVisible({ timeout: 8000 });
}

/**
 * Logs in with a specific employee PIN
 */
export async function loginWithPin(page, pinString) {
  await page.goto('/');
  await expect(page.locator('text=OmniBuild OS™')).toBeVisible({ timeout: 10000 });

  for (const digit of pinString.split('')) {
    const keyBtn = page.getByRole('button', { name: digit, exact: true });
    await keyBtn.click();
  }
}

/**
 * Handles React 19 Suspense Lazy Chunk loading deterministically.
 * Waits for any "Loading Module..." fallback to resolve and target view container to mount.
 */
export async function navigateToTab(page, tabId, expectedHeaderSelector = null) {
  const tabButton = page.locator(`button[data-tab="${tabId}"], .tab-pill:has-text("${tabId}"), button:has-text("${tabId}")`).first();
  await tabButton.click();

  // Wait for React.lazy() loading spinner to disappear
  const loadingSpinner = page.locator('text=Loading Module...');
  if (await loadingSpinner.isVisible({ timeout: 500 }).catch(() => false)) {
    await expect(loadingSpinner).not.toBeVisible({ timeout: 12000 });
  }

  if (expectedHeaderSelector) {
    await expect(page.locator(expectedHeaderSelector).first()).toBeVisible({ timeout: 8000 });
  }
}

/**
 * Waits for Modal backdrop animation to stabilize before interacting with internal inputs.
 * Prevents "element click intercepted by backdrop" race conditions.
 */
export async function waitForModalReady(page, modalHeadingText) {
  const heading = page.locator(`h1, h2, h3, div`).filter({ hasText: modalHeadingText }).first();
  await expect(heading).toBeVisible({ timeout: 7000 });
  // Ensure animation frame completes
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

/**
 * Simulates a physical Bluetooth / USB HID Laser Barcode Scanner firing into window
 */
export async function simulateHardwareBarcodeScan(page, barcodeString) {
  await page.evaluate((code) => {
    // Dispatch sequential keydown events simulating scanner buffer
    for (const char of code) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
    }
    // Scanner sends Enter key as terminator
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  }, barcodeString);
}

/**
 * Deterministic input clearing and filling that verifies value persistence
 */
export async function safeFill(page, locator, text) {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  await locator.click();
  await locator.fill('');
  await locator.fill(String(text));
  await expect(locator).toHaveValue(String(text));
}
