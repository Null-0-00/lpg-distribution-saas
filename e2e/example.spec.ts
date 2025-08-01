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

test('dashboard requires authentication', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for any redirects or authentication checks to complete
  await page.waitForLoadState('networkidle');

  const currentUrl = page.url();

  // Either should redirect to auth page OR not show protected dashboard content
  if (currentUrl.includes('/auth')) {
    // Successfully redirected to auth page
    await expect(page.url()).toContain('/auth');
  } else {
    // Still on dashboard URL, but should not show protected content
    // The dashboard page returns null for unauthenticated users, so sensitive content should not be visible
    const hasSensitiveContent = await Promise.all([
      page.locator('text=Revenue').count(),
      page.locator('text=Sales Management').count(),
      page.locator('text=Quick Actions').count(),
      page.locator('text=Recent Activity').count(),
    ]);

    const totalSensitiveElements = hasSensitiveContent.reduce(
      (sum, count) => sum + count,
      0
    );

    // Should not show sensitive dashboard content to unauthenticated users
    expect(totalSensitiveElements).toBe(0);
  }
});
