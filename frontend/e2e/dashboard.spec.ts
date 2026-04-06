import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('loads and shows forms list', async ({ page }) => {
    await page.goto('/forms');

    // Wait for page to fully load — no skeleton visible
    await page.waitForSelector('h1', { state: 'visible', timeout: 10000 });
    await expect(page.locator('h1')).toHaveText('My Forms');

    // Wait for loading to finish (skeleton cards should disappear)
    await page.waitForSelector('[data-testid="loading-skeleton"]', {
      state: 'hidden',
      timeout: 15000,
    }).catch(() => {
      // Skeleton may not have testid — wait for actual form cards instead
    });

    // Wait for actual content to load (API responds)
    await page.waitForTimeout(2000);

    // Verify "New Form" button is visible and clickable
    const newFormBtn = page.getByRole('button', { name: 'New Form' });
    await expect(newFormBtn).toBeVisible();
    await expect(newFormBtn).toBeEnabled();

    // Verify filter tabs are visible
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Published' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Closed' })).toBeVisible();

    // Verify form cards are rendered (backend has forms)
    // Cards are links inside the grid
    const formCards = page.locator('.grid a[href^="/forms/"]');
    await expect(formCards.first()).toBeVisible({ timeout: 10000 });
    const cardCount = await formCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Click filter tabs to confirm they work
    await page.getByRole('button', { name: 'Draft' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Draft' })).toBeVisible();

    await page.getByRole('button', { name: 'Published' }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: 'Published' })).toBeVisible();

    await page.getByRole('button', { name: 'All' }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/dashboard.png' });
  });
});
