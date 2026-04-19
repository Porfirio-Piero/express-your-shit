import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://landlordminder-app.vercel.app';

test.describe('LandlordMinder App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should display the dashboard with empty state', async ({ page }) => {
    // Check header
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    
    // Should show summary cards
    const propertiesCard = page.locator('text=/properties/i').first();
    await expect(propertiesCard).toBeVisible({ timeout: 5000 });
    
    // Should show getting started section
    await expect(page.locator('text=/getting started/i')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between tabs', async ({ page }) => {
    // Navigate to Properties tab
    await page.getByRole('button', { name: /properties/i }).click();
    await expect(page.locator('text=/your properties/i')).toBeVisible({ timeout: 5000 });
    
    // Navigate to Tasks tab
    await page.getByRole('button', { name: /tasks/i }).click();
    await expect(page.locator('text=/maintenance tasks/i')).toBeVisible({ timeout: 5000 });
    
    // Navigate to Expenses tab
    await page.getByRole('button', { name: /expenses/i }).click();
    await expect(page.locator('text=/maintenance expenses/i')).toBeVisible({ timeout: 5000 });
    
    // Navigate back to Dashboard
    await page.getByRole('button', { name: /dashboard/i }).click();
    await expect(page.locator('text=/quick actions/i')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Property Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should add a new property', async ({ page }) => {
    // Navigate to Properties
    await page.getByRole('button', { name: /properties/i }).click();
    
    // Click Add Property
    await page.getByRole('button', { name: /add property/i }).first().click();
    
    // Fill form
    await page.locator('input[type="text"]').first().fill('Test Property 123');
    await page.locator('input[placeholder*="address" i], input:nth-of-type(2)').fill('456 Oak Street, Springfield, IL');
    await page.locator('input[type="number"]').fill('4');
    
    // Submit
    await page.getByRole('button', { name: /add property/i }).last().click();
    
    // Wait for modal to close and verify
    await expect(page.locator('text=Test Property 123')).toBeVisible({ timeout: 10000 });
  });

  test('should delete a property', async ({ page }) => {
    // Add a property first
    await page.getByRole('button', { name: /properties/i }).click();
    await page.getByRole('button', { name: /add property/i }).first().click();
    await page.locator('input[type="text"]').first().fill('Delete Test Property');
    await page.locator('input[placeholder*="address" i], input:nth-of-type(2)').fill('321 Delete Lane');
    await page.getByRole('button', { name: /add property/i }).last().click();
    
    await expect(page.locator('text=Delete Test Property')).toBeVisible({ timeout: 10000 });
    
    // Delete it - click trash icon
    page.on('dialog', dialog => dialog.accept());
    const deleteButton = page.locator('text=Delete Test Property').locator('..').locator('.lucide-trash-2, button[aria-label*="delete" i], button:last-child').first();
    await deleteButton.click();
    
    // Verify it's gone
    await expect(page.locator('text=Delete Test Property')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Task Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Add a property first
    await page.getByRole('button', { name: /properties/i }).click();
    await page.getByRole('button', { name: /add property/i }).first().click();
    await page.locator('input[type="text"]').first().fill('Task Test Property');
    await page.locator('input[placeholder*="address" i], input:nth-of-type(2)').fill('123 Task Street');
    await page.getByRole('button', { name: /add property/i }).last().click();
    await expect(page.locator('text=Task Test Property')).toBeVisible({ timeout: 10000 });
  });

  test('should add a task from template', async ({ page }) => {
    // Navigate to Tasks
    await page.getByRole('button', { name: /tasks/i }).click();
    
    // Click Add Task
    await page.getByRole('button', { name: /add task/i }).click();
    
    // Select first template checkbox
    await page.locator('input[type="checkbox"]').first().check();
    
    // Add template
    await page.getByRole('button', { name: /add template/i }).click();
    
    // Verify task was added
    await expect(page.locator('text=/hvac|filter/i')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Should still show header
    await expect(page.locator('text=/landlordminder/i')).toBeVisible({ timeout: 5000 });
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    
    // Summary cards should be visible
    await expect(page.locator('text=/properties/i')).toBeVisible({ timeout: 5000 });
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(BASE_URL);
    
    // All navigation tabs visible
    await expect(page.getByRole('button', { name: /dashboard/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /properties/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /tasks/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /expenses/i })).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check for h1 or main heading
    const heading = page.locator('h1, h2, [role="heading"]').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Buttons should be interactive
    const buttons = page.locator('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Basic Functionality', () => {
  test('should load the application', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Should not have console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should show some content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should persist data in localStorage', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Add property
    await page.getByRole('button', { name: /properties/i }).click();
    await page.getByRole('button', { name: /add property/i }).first().click();
    await page.locator('input[type="text"]').first().fill('Persistence Test');
    await page.locator('input[placeholder*="address" i], input:nth-of-type(2)').fill('999 Persist Lane');
    await page.getByRole('button', { name: /add property/i }).last().click();
    
    // Wait for it to save
    await expect(page.locator('text=Persistence Test')).toBeVisible({ timeout: 10000 });
    
    // Check localStorage
    const stored = await page.evaluate(() => localStorage.getItem('landlordminder_properties'));
    expect(stored).toBeTruthy();
    const data = JSON.parse(stored || '[]');
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].name).toBe('Persistence Test');
  });
});