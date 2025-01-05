import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Organization Module Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/organization/test-org');
  });

  test('should have no accessibility violations on dashboard', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Analytics' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeFocused();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check main landmark
    await expect(page.getByRole('main')).toHaveAttribute('aria-label', 'Organization Dashboard');

    // Check navigation
    await expect(page.getByRole('tablist')).toHaveAttribute('aria-label', 'Organization Sections');

    // Check content sections
    await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby');
  });

  test('should maintain color contrast', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Test loading state announcement
    await page.getByRole('tab', { name: 'Analytics' }).click();
    await expect(page.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });
});


