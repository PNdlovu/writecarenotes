import { test, expect } from '@playwright/test'
import { prisma } from '@/lib/prisma'
import {
  createTestResident,
  createTestMealPlan,
  createTestDietaryProfile
} from '../../../test/helpers/nutrition-helpers'

test.describe('Nutrition Management E2E Tests', () => {
  let residentId: string
  let mealPlanId: string

  test.beforeAll(async () => {
    // Setup test data
    const resident = await createTestResident()
    residentId = resident.id
    const mealPlan = await createTestMealPlan(residentId)
    mealPlanId = mealPlan.id
  })

  test.afterAll(async () => {
    // Cleanup test data
    await prisma.mealPlan.deleteMany({
      where: { residentId }
    })
    await prisma.resident.delete({
      where: { id: residentId }
    })
  })

  test('complete meal planning workflow', async ({ page }) => {
    // Login and navigate
    await page.goto('/nutrition/meal-plans')
    await expect(page).toHaveTitle(/Meal Plans/)

    // Create meal plan
    await test.step('create meal plan', async () => {
      await page.click('button:text("Create Meal Plan")')
      await page.fill('[name="name"]', 'Test Meal Plan')
      await page.selectOption('[name="type"]', 'REGULAR')
      await page.click('button:text("Save")')
      await expect(page.locator('text=Test Meal Plan')).toBeVisible()
    })

    // Add meals
    await test.step('add meals', async () => {
      await page.click('text=Test Meal Plan')
      await page.click('button:text("Add Meal")')
      await page.fill('[name="name"]', 'Breakfast')
      await page.fill('[name="calories"]', '500')
      await page.click('button:text("Save Meal")')
      await expect(page.locator('text=Breakfast')).toBeVisible()
    })

    // Track nutrition
    await test.step('track nutrition', async () => {
      await page.click('text=Nutrition Tracking')
      await expect(page.locator('text=Daily Calories')).toBeVisible()
      await expect(page.locator('text=500')).toBeVisible()
    })
  })

  test('liquid intake tracking workflow', async ({ page }) => {
    await page.goto('/nutrition/liquid-intake')
    
    // Record intake
    await test.step('record liquid intake', async () => {
      await page.selectOption('[name="type"]', 'WATER')
      await page.fill('[name="amount"]', '250')
      await page.click('button:text("Add")')
      await expect(page.locator('text=250 ml')).toBeVisible()
    })

    // View progress
    await test.step('check progress', async () => {
      await expect(page.locator('text=Daily Progress')).toBeVisible()
      await expect(page.locator('text=250 ml')).toBeVisible()
    })
  })

  test('dietary management workflow', async ({ page }) => {
    await page.goto('/nutrition/dietary-management')

    // Set dietary requirements
    await test.step('set dietary requirements', async () => {
      await page.click('button:text("Edit Requirements")')
      await page.click('text=Vegetarian')
      await page.click('button:text("Save")')
      await expect(page.locator('text=Vegetarian')).toBeVisible()
    })

    // Set allergens
    await test.step('set allergens', async () => {
      await page.click('button:text("Add Allergen")')
      await page.fill('[name="allergen"]', 'Peanuts')
      await page.click('button:text("Save")')
      await expect(page.locator('text=Peanuts')).toBeVisible()
    })
  })

  test('nutritional analysis workflow', async ({ page }) => {
    await page.goto('/nutrition/analysis')

    // Generate report
    await test.step('generate report', async () => {
      await page.click('button:text("Generate Report")')
      await expect(page.locator('text=Nutritional Report')).toBeVisible()
      await expect(page.locator('text=Daily Intake')).toBeVisible()
    })

    // Export data
    await test.step('export data', async () => {
      await page.click('button:text("Export")')
      await page.click('text=CSV')
      // Verify download
      const download = await page.waitForEvent('download')
      expect(download.suggestedFilename()).toContain('nutrition-report')
    })
  })

  test('error handling and edge cases', async ({ page }) => {
    // Invalid input handling
    await test.step('handle invalid input', async () => {
      await page.goto('/nutrition/meal-plans')
      await page.click('button:text("Create Meal Plan")')
      await page.click('button:text("Save")')
      await expect(page.locator('text=Name is required')).toBeVisible()
    })

    // Concurrent modifications
    await test.step('handle concurrent modifications', async () => {
      // Simulate concurrent modification
      await prisma.mealPlan.update({
        where: { id: mealPlanId },
        data: { version: { increment: 1 } }
      })

      await page.goto(`/nutrition/meal-plans/${mealPlanId}`)
      await page.click('button:text("Edit")')
      await page.fill('[name="name"]', 'Modified Plan')
      await page.click('button:text("Save")')
      await expect(page.locator('text=Version conflict')).toBeVisible()
    })

    // Network error handling
    await test.step('handle network errors', async () => {
      await page.route('**/api/nutrition/**', route => route.abort())
      await page.goto('/nutrition/meal-plans')
      await expect(page.locator('text=Failed to load')).toBeVisible()
    })
  })

  test('performance benchmarks', async ({ page }) => {
    // Page load time
    await test.step('measure page load time', async () => {
      const start = Date.now()
      await page.goto('/nutrition/meal-plans')
      const loadTime = Date.now() - start
      expect(loadTime).toBeLessThan(3000) // 3s threshold
    })

    // Data fetching performance
    await test.step('measure data fetching', async () => {
      const [response] = await Promise.all([
        page.waitForResponse('**/api/nutrition/meal-plans'),
        page.click('button:text("Refresh")')
      ])
      expect(response.status()).toBe(200)
      const responseTime = await response.timing().responseEnd
      expect(responseTime).toBeLessThan(1000) // 1s threshold
    })

    // Rendering performance
    await test.step('measure rendering performance', async () => {
      const metrics = await page.evaluate(() => {
        const paint = performance
          .getEntriesByType('paint')
          .find(entry => entry.name === 'first-contentful-paint')
        return { fcp: paint?.startTime }
      })
      expect(metrics.fcp).toBeLessThan(1000) // 1s threshold
    })
  })
})
