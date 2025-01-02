import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { mealPlanningService } from '../../services/meal-planning-service'
import { nutritionalAnalysisService } from '../../services/nutritional-analysis-service'
import { liquidIntakeService } from '../../services/liquid-intake-service'
import { mealRecommendationService } from '../../services/meal-recommendation-service'
import {
  createTestResident,
  createTestMealPlan,
  createTestDietaryProfile
} from '../../../test/helpers/nutrition-helpers'

describe('Nutrition Services Integration Tests', () => {
  let residentId: string
  let mealPlanId: string

  beforeAll(async () => {
    const resident = await createTestResident()
    residentId = resident.id
    const mealPlan = await createTestMealPlan(residentId)
    mealPlanId = mealPlan.id
  })

  afterAll(async () => {
    await prisma.mealPlan.deleteMany({
      where: { residentId }
    })
    await prisma.resident.delete({
      where: { id: residentId }
    })
  })

  describe('MealPlanningService', () => {
    it('should create and update meal plans', async () => {
      // Create meal plan
      const plan = await mealPlanningService.createMealPlan({
        residentId,
        name: 'Test Plan',
        type: 'REGULAR'
      })
      expect(plan.name).toBe('Test Plan')

      // Update meal plan
      const updated = await mealPlanningService.updateMealPlan(plan.id, {
        name: 'Updated Plan'
      })
      expect(updated.name).toBe('Updated Plan')

      // Verify in database
      const stored = await prisma.mealPlan.findUnique({
        where: { id: plan.id }
      })
      expect(stored?.name).toBe('Updated Plan')
    })

    it('should handle meal plan conflicts', async () => {
      // Create overlapping meal plans
      await expect(
        Promise.all([
          mealPlanningService.createMealPlan({
            residentId,
            name: 'Plan 1',
            type: 'REGULAR'
          }),
          mealPlanningService.createMealPlan({
            residentId,
            name: 'Plan 2',
            type: 'REGULAR'
          })
        ])
      ).rejects.toThrow()
    })
  })

  describe('NutritionalAnalysisService', () => {
    it('should analyze nutritional data', async () => {
      // Record some meals
      await mealPlanningService.recordMeal(mealPlanId, {
        name: 'Test Meal',
        calories: 500,
        nutrients: {
          protein: 20,
          carbs: 60,
          fat: 15
        }
      })

      // Analyze nutrition
      const analysis = await nutritionalAnalysisService.analyzeDailyNutrition(
        residentId,
        new Date()
      )
      expect(analysis.totalCalories).toBe(500)
      expect(analysis.nutrients.protein).toBe(20)
    })

    it('should track goal progress', async () => {
      const progress = await nutritionalAnalysisService.trackGoalProgress(
        residentId,
        new Date(),
        new Date()
      )
      expect(progress).toHaveProperty('goals')
      expect(progress).toHaveProperty('progress')
    })
  })

  describe('LiquidIntakeService', () => {
    it('should track liquid intake', async () => {
      // Record intake
      const intake = await liquidIntakeService.recordIntake({
        residentId,
        type: 'WATER',
        amount: 250,
        timestamp: new Date()
      })
      expect(intake.amount).toBe(250)

      // Get daily stats
      const stats = await liquidIntakeService.getDailyIntakeStats(
        residentId,
        new Date()
      )
      expect(stats.total).toBe(250)
      expect(stats.byType.WATER).toBe(250)
    })

    it('should handle batch operations', async () => {
      const intakes = await liquidIntakeService.batchRecordIntake([
        {
          residentId,
          type: 'WATER',
          amount: 200,
          timestamp: new Date()
        },
        {
          residentId,
          type: 'JUICE',
          amount: 150,
          timestamp: new Date()
        }
      ])
      expect(intakes).toHaveLength(2)
      expect(intakes[0].amount).toBe(200)
      expect(intakes[1].amount).toBe(150)
    })
  })

  describe('MealRecommendationService', () => {
    it('should generate personalized recommendations', async () => {
      const recommendations = await mealRecommendationService
        .getPersonalizedRecommendations(residentId, 'BREAKFAST', 3)
      expect(recommendations).toHaveLength(3)
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('name')
        expect(rec).toHaveProperty('calories')
        expect(rec).toHaveProperty('nutrients')
      })
    })

    it('should consider dietary restrictions', async () => {
      // Add dietary restriction
      await createTestDietaryProfile(residentId, {
        restrictions: ['GLUTEN_FREE']
      })

      const recommendations = await mealRecommendationService
        .getPersonalizedRecommendations(residentId, 'LUNCH', 3)
      recommendations.forEach(rec => {
        expect(rec.dietaryTags).toContain('GLUTEN_FREE')
      })
    })
  })

  describe('Cross-service Integration', () => {
    it('should maintain data consistency across services', async () => {
      // Create meal plan
      const plan = await mealPlanningService.createMealPlan({
        residentId,
        name: 'Integration Test Plan',
        type: 'REGULAR'
      })

      // Record meal
      await mealPlanningService.recordMeal(plan.id, {
        name: 'Test Meal',
        calories: 600,
        nutrients: {
          protein: 25,
          carbs: 70,
          fat: 20
        }
      })

      // Verify in nutritional analysis
      const analysis = await nutritionalAnalysisService.analyzeDailyNutrition(
        residentId,
        new Date()
      )
      expect(analysis.totalCalories).toBe(600)

      // Get recommendations
      const recommendations = await mealRecommendationService
        .getPersonalizedRecommendations(residentId, 'DINNER', 1)
      expect(recommendations[0].calories)
        .toBeLessThanOrEqual(2000 - analysis.totalCalories)
    })

    it('should handle concurrent operations', async () => {
      // Simulate concurrent operations
      await Promise.all([
        mealPlanningService.updateMealPlan(mealPlanId, {
          name: 'Concurrent Update 1'
        }),
        mealPlanningService.updateMealPlan(mealPlanId, {
          name: 'Concurrent Update 2'
        })
      ]).catch(error => {
        expect(error.message).toContain('Version conflict')
      })
    })
  })
})
