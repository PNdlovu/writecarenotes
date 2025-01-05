/**
 * @fileoverview Medication E2E Tests
 * @version 1.0.0
 * @created 2024-03-22
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { test, expect } from '@playwright/test';
import { mockPharmacyAPI } from './mocks/pharmacyAPI';
import { generateTestData } from './helpers/testData';

test.describe('Medication Management', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks
    await mockPharmacyAPI(page);

    // Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Navigate to medications
    await page.goto('/medications');
  });

  test('should display medication list', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Medications');
    await expect(page.locator('[data-testid="medication-list"]')).toBeVisible();
  });

  test('should create new medication', async ({ page }) => {
    // Click create button
    await page.click('[data-testid="create-medication"]');

    // Fill form
    await page.fill('[data-testid="medication-name"]', 'Test Medication');
    await page.fill('[data-testid="medication-dosage"]', '10mg');
    await page.selectOption('[data-testid="medication-route"]', 'Oral');
    await page.selectOption('[data-testid="medication-type"]', 'REGULAR');
    await page.fill('[data-testid="medication-stock"]', '100');

    // Submit form
    await page.click('[data-testid="submit-medication"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="medication-list"]')).toContainText('Test Medication');
  });

  test('should record medication administration', async ({ page }) => {
    // Create test medication
    const medication = await generateTestData.medication();

    // Navigate to administration page
    await page.click(`[data-testid="administer-${medication.id}"]`);

    // Scan barcode
    await page.click('[data-testid="scan-barcode"]');
    await page.fill('[data-testid="barcode-input"]', medication.barcode);

    // Enter PIN
    await page.fill('[data-testid="pin-input"]', '1234');

    // Confirm administration
    await page.click('[data-testid="confirm-administration"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="administration-history"]')).toContainText('Administered');
  });

  test('should handle offline mode', async ({ page, context }) => {
    // Create test medication
    const medication = await generateTestData.medication();

    // Go offline
    await context.setOffline(true);

    // Record administration
    await page.click(`[data-testid="administer-${medication.id}"]`);
    await page.fill('[data-testid="pin-input"]', '1234');
    await page.click('[data-testid="confirm-administration"]');

    // Verify offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

    // Go online
    await context.setOffline(false);

    // Verify sync
    await expect(page.locator('[data-testid="sync-status"]')).toHaveText('Synced');
  });

  test('should manage controlled drugs', async ({ page }) => {
    // Create controlled medication
    const medication = await generateTestData.controlledMedication();

    // Navigate to controlled drugs page
    await page.click('[data-testid="controlled-drugs"]');

    // Verify witness requirement
    await page.click(`[data-testid="administer-${medication.id}"]`);
    await page.fill('[data-testid="pin-input"]', '1234');
    await expect(page.locator('[data-testid="witness-required"]')).toBeVisible();

    // Enter witness PIN
    await page.fill('[data-testid="witness-pin"]', '5678');

    // Complete administration
    await page.click('[data-testid="confirm-administration"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should handle PRN medications', async ({ page }) => {
    // Create PRN medication
    const medication = await generateTestData.prnMedication();

    // Navigate to PRN page
    await page.click('[data-testid="prn-medications"]');

    // Record PRN administration
    await page.click(`[data-testid="administer-${medication.id}"]`);
    await page.fill('[data-testid="reason"]', 'Pain relief requested');
    await page.fill('[data-testid="pain-score"]', '7');
    await page.fill('[data-testid="pin-input"]', '1234');
    await page.click('[data-testid="confirm-administration"]');

    // Verify effectiveness tracking
    await page.click('[data-testid="record-effectiveness"]');
    await page.fill('[data-testid="effectiveness-score"]', '3');
    await page.fill('[data-testid="notes"]', 'Pain reduced');
    await page.click('[data-testid="submit-effectiveness"]');

    await expect(page.locator('[data-testid="effectiveness-history"]')).toContainText('Pain reduced');
  });

  test('should manage stock levels', async ({ page }) => {
    // Create test medication
    const medication = await generateTestData.medication();

    // Navigate to stock management
    await page.click('[data-testid="stock-management"]');
    await page.click(`[data-testid="manage-stock-${medication.id}"]`);

    // Record stock receipt
    await page.click('[data-testid="record-stock"]');
    await page.fill('[data-testid="quantity"]', '50');
    await page.fill('[data-testid="batch-number"]', 'BATCH123');
    await page.fill('[data-testid="expiry-date"]', '2025-12-31');
    await page.click('[data-testid="submit-stock"]');

    // Verify stock update
    await expect(page.locator('[data-testid="current-stock"]')).toHaveText('150');
  });

  test('should generate reports', async ({ page }) => {
    // Navigate to reports
    await page.click('[data-testid="reports"]');

    // Set date range
    await page.fill('[data-testid="start-date"]', '2024-01-01');
    await page.fill('[data-testid="end-date"]', '2024-03-31');

    // Generate report
    await page.click('[data-testid="generate-report"]');
    await page.click('[data-testid="download-pdf"]');

    // Verify download
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('medication-report');
  });

  test('should handle pharmacy integration', async ({ page }) => {
    // Navigate to pharmacy orders
    await page.click('[data-testid="pharmacy-orders"]');

    // Create order
    await page.click('[data-testid="create-order"]');
    await page.fill('[data-testid="medication-search"]', 'Paracetamol');
    await page.click('[data-testid="select-medication"]');
    await page.fill('[data-testid="order-quantity"]', '100');
    await page.click('[data-testid="submit-order"]');

    // Verify order status
    await expect(page.locator('[data-testid="order-status"]')).toHaveText('Pending');
  });

  test('should perform medication review', async ({ page }) => {
    // Create test medication
    const medication = await generateTestData.medication();

    // Navigate to reviews
    await page.click('[data-testid="medication-reviews"]');
    await page.click(`[data-testid="review-${medication.id}"]`);

    // Complete review
    await page.selectOption('[data-testid="review-outcome"]', 'CONTINUE');
    await page.fill('[data-testid="review-notes"]', 'Medication effective, continue as prescribed');
    await page.click('[data-testid="submit-review"]');

    // Verify review record
    await expect(page.locator('[data-testid="review-history"]')).toContainText('Medication effective');
  });
}); 