import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('navigates from dashboard to form detail and back', async ({ page }) => {
    await page.goto('/forms');

    // Wait for forms to load
    await expect(page.locator('h1')).toHaveText('My Forms', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Find the first form card link and click it
    const firstFormLink = page.locator('.grid a[href^="/forms/"]').first();
    await expect(firstFormLink).toBeVisible({ timeout: 10000 });

    const formName = await firstFormLink.textContent();
    await firstFormLink.click();

    // Wait for navigation to form detail page
    await page.waitForURL(/\/forms\/[a-f0-9-]+$/, { timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify form detail page loaded — should show the form name
    if (formName) {
      const trimmedName = formName.trim();
      await expect(page.getByText(trimmedName)).toBeVisible({ timeout: 10000 });
    }

    await page.screenshot({ path: 'e2e/screenshots/form-detail.png' });

    // Navigate back to /forms
    await page.goto('/forms');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify we're back on dashboard
    await expect(page.locator('h1')).toHaveText('My Forms', { timeout: 10000 });
    await page.screenshot({ path: 'e2e/screenshots/back-to-dashboard.png' });
  });

  test('root URL redirects to /forms', async ({ page }) => {
    await page.goto('/');
    // Should redirect to /forms
    await page.waitForURL(/\/forms/, { timeout: 10000 });
    await expect(page.locator('h1')).toHaveText('My Forms', { timeout: 10000 });
  });

  test('form edit page is accessible via /forms/[id]/edit', async ({ page }) => {
    // Get a form ID from API first
    const response = await page.request.get('http://localhost:8080/api/v1/forms?size=1');
    const data = await response.json();
    const formId = data.content[0]?.id;

    expect(formId).toBeTruthy();

    await page.goto(`/forms/${formId}/edit`);
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Verify the builder loaded — check for palette
    await expect(page.getByText('Add Fields')).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'e2e/screenshots/form-edit-page.png' });
  });
});
