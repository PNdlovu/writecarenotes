import { test, expect } from '@playwright/test';
import { mockOrganization } from '../../__mocks__/organization.mock';

test.describe('Organization Module E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment
    await page.goto('/organization/test-org');
  });

  test('should display organization dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Organization Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Analytics' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible();
  });

  test('should handle offline mode', async ({ page }) => {
    await page.evaluate(() => {
      // @ts-ignore
      window.navigator.onLine = false;
      window.dispatchEvent(new Event('offline'));
    });

    await expect(page.getByTestId('offline-indicator')).toBeVisible();
  });

  test('should enforce security policies', async ({ page }) => {
    // Test restricted access
    await page.goto('/organization/test-org/settings');
    await expect(page.getByText('Restricted Access')).toBeVisible();
  });

  test('should maintain data integrity during sync', async ({ page }) => {
    // Simulate offline changes
    await page.evaluate(() => {
      localStorage.setItem('pendingChanges', JSON.stringify([
        { type: 'UPDATE', data: { id: 'test', name: 'Updated Name' } }
      ]));
    });

    // Go online and check sync
    await page.evaluate(() => {
      // @ts-ignore
      window.navigator.onLine = true;
      window.dispatchEvent(new Event('online'));
    });

    await expect(page.getByText('Syncing changes...')).toBeVisible();
    await expect(page.getByText('All changes synced')).toBeVisible();
  });
});


