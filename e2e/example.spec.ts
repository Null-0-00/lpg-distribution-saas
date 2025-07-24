import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  // Check that the page loads without major errors
  await expect(page).toHaveTitle(/LPG/);

  // Basic navigation test
  await expect(page.locator('body')).toBeVisible();
});

test('login page is accessible', async ({ page }) => {
  await page.goto('/auth/login');

  // Check login form elements
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
});

test('dashboard redirects when not authenticated', async ({ page }) => {
  await page.goto('/dashboard');

  // Should redirect to login or show auth error
  await expect(page.url()).toContain('/auth');
});
