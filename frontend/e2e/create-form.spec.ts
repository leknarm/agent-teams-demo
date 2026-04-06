import { test, expect } from '@playwright/test';

test.describe('Create Form', () => {
  test('opens dialog and creates a new form', async ({ page }) => {
    await page.goto('/forms');

    // Wait for page load
    await expect(page.locator('h1')).toHaveText('My Forms', { timeout: 10000 });

    // Click "New Form" button
    const newFormBtn = page.getByRole('button', { name: 'New Form' });
    await expect(newFormBtn).toBeVisible();
    await newFormBtn.click();

    // Verify dialog appears
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Create New Form')).toBeVisible();

    // Type form name
    const nameInput = page.getByLabel('Form Name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test Form from Playwright');

    // Verify input has the value
    await expect(nameInput).toHaveValue('Test Form from Playwright');

    await page.screenshot({ path: 'e2e/screenshots/create-form-dialog.png' });

    // Click Create Form button
    const createBtn = page.getByRole('button', { name: 'Create Form' });
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Wait for navigation to form edit page
    await page.waitForURL(/\/forms\/[a-f0-9-]+\/edit/, { timeout: 15000 });

    // Verify we're on the edit page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/forms\/[a-f0-9-]+\/edit/);

    await page.screenshot({ path: 'e2e/screenshots/create-form-after.png' });
  });

  test('shows validation error when name is empty', async ({ page }) => {
    await page.goto('/forms');
    await expect(page.locator('h1')).toHaveText('My Forms', { timeout: 10000 });

    await page.getByRole('button', { name: 'New Form' }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 });

    // Click create without filling name
    await page.getByRole('button', { name: 'Create Form' }).click();

    // Should show validation error
    await expect(page.getByText('Name is required')).toBeVisible({ timeout: 3000 });
  });
});
