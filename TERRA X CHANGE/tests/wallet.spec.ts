import { test, expect } from '@playwright/test';

test('wallet creation', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Go to Wallet');
  await page.click('text=Create Wallet');
  await expect(page.locator('text=Balance')).toBeVisible();
});