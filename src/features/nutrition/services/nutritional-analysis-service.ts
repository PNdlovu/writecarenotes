import { prisma } from '@/lib/prisma'
import { 
  NutritionalGoal,
  MealPlan,
  DietaryRequirement,
  NutrientType
} from '@prisma/client'

interface NutrientAnalysis {
  type: NutrientType
  target: number
  current: number
  unit: string
  status: 'BELOW_TARGET' | 'ON_TARGET' | 'ABOVE_TARGET'
}

interface DailyNutrition {
  date: Date
  calories: number
  nutrients: {
    [key in NutrientType]: number
  }
  meals: {
    type: string
    calories: number
    nutrients: {
      [key in NutrientType]: number
    }
  }[]
}

interface NutritionalReport {
  startDate: Date
  endDate: Date
  averageCalories: number
  averageNutrients: {
    [key in NutrientType]: number
  }
  goalProgress: {
    [key: string]: number // percentage
  }
  recommendations: string[]
}

export class NutritionalAnalysisService {
  private static instance: NutritionalAnalysisService

  private constructor() {}

  public static getInstance(): NutritionalAnalysisService {
    if (!NutritionalAnalysisService.instance) {
      NutritionalAnalysisService.instance = new NutritionalAnalysisService()
    }
    return NutritionalAnalysisService.instance
  }

  // Nutrient Analysis
  public async analyzeNutrients(
    mealPlanId: string,
    date: Date
  ): Promise<NutrientAnalysis[]> {
    try {
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        include: {
          goals: true,
          schedule: {
            where: { date },
            include: {
              meals: {
                include: {
                  items: true
                }
              }
            }
          }
        }
      })
      if (!mealPlan) throw new Error('Meal plan not found')

      const dailyNutrition = await this.calculateDailyNutrition(
        mealPlan,
        date
      )

      return this.compareWithGoals(dailyNutrition, mealPlan.goals)
    } catch (error) {
      console.error('Error analyzing nutrients:', error)
      throw error
    }
  }

  // Daily Nutrition Calculation
  private async calculateDailyNutrition(
    mealPlan: MealPlan,
    date: Date
  ): Promise<DailyNutrition> {
    const schedule = mealPlan.schedule[0] // For the specified date
    if (!schedule) {
      throw new Error('No meal schedule found for the specified date')
    }

    const meals = schedule.meals.map(meal => ({
      type: meal.type,
      calories: meal.totalCalories,
      nutrients: meal.totalNutrients
    }))

    return {
      date,
      calories: meals.reduce((sum, meal) => sum + meal.calories, 0),
      nutrients: this.aggregateNutrients(meals),
      meals
    }
  }

  // Goal Progress Tracking
  public async trackGoalProgress(
    mealPlanId: string,
    startDate: Date,
    endDate: Date
  ): Promise<NutritionalReport> {
    try {
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        include: {
          goals: true,
          schedule: {
            where: {
              date: {
                gte: startDate,
                lte: endDate
              }
            },
            include: {
              meals: {
                include: {
                  items: true
                }
              }
            }
          }
        }
      })
      if (!mealPlan) throw new Error('Meal plan not found')

      const dailyNutrition: DailyNutrition[] = []
      for (const schedule of mealPlan.schedule) {
        dailyNutrition.push(await this.calculateDailyNutrition(
          mealPlan,
          schedule.date
        ))
      }

      return this.generateNutritionalReport(
        dailyNutrition,
        mealPlan.goals,
        startDate,
        endDate
      )
    } catch (error) {
      console.error('Error tracking goal progress:', error)
      throw error
    }
  }

  // Compliance Checking
  public async checkDietaryCompliance(
    mealPlanId: string,
    date: Date
  ): Promise<boolean> {
    try {
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
        include: {
          dietaryRequirements: true,
          restrictions: true,
          schedule: {
            where: { date },
            include: {
              meals: {
                include: {
                  items: true
                }
              }
            }
          }
        }
      })
      if (!mealPlan) throw new Error('Meal plan not found')

      return this.validateCompliance(
        mealPlan.schedule[0]?.meals || [],
        mealPlan.dietaryRequirements,
        mealPlan.restrictions
      )
    } catch (error) {
      console.error('Error checking dietary compliance:', error)
      throw error
    }
  }

  // Utility Functions
  private compareWithGoals(
    daily: DailyNutrition,
    goals: NutritionalGoal[]
  ): NutrientAnalysis[] {
    return goals.map(goal => {
      const current = daily.nutrients[goal.nutrientType] || 0
      const target = goal.targetAmount

      let status: NutrientAnalysis['status'] = 'ON_TARGET'
      if (current < target * 0.9) status = 'BELOW_TARGET'
      if (current > target * 1.1) status = 'ABOVE_TARGET'

      return {
        type: goal.nutrientType,
        target,
        current,
        unit: goal.unit,
        status
      }
    })
  }

  private aggregateNutrients(
    meals: DailyNutrition['meals']
  ): DailyNutrition['nutrients'] {
    const nutrients: DailyNutrition['nutrients'] = {} as any

    meals.forEach(meal => {
      Object.entries(meal.nutrients).forEach(([type, amount]) => {
        nutrients[type as NutrientType] = 
          (nutrients[type as NutrientType] || 0) + amount
      })
    })

    return nutrients
  }

  private generateNutritionalReport(
    dailyNutrition: DailyNutrition[],
    goals: NutritionalGoal[],
    startDate: Date,
    endDate: Date
  ): NutritionalReport {
    const averageCalories = this.calculateAverage(
      dailyNutrition.map(d => d.calories)
    )

    const averageNutrients: NutritionalReport['averageNutrients'] = {} as any
    const goalProgress: NutritionalReport['goalProgress'] = {}

    // Calculate averages for each nutrient
    Object.keys(dailyNutrition[0].nutrients).forEach(nutrient => {
      const values = dailyNutrition.map(d => 
        d.nutrients[nutrient as NutrientType]
      )
      averageNutrients[nutrient as NutrientType] = this.calculateAverage(values)
    })

    // Calculate goal progress
    goals.forEach(goal => {
      const average = averageNutrients[goal.nutrientType]
      const progress = (average / goal.targetAmount) * 100
      goalProgress[goal.nutrientType] = progress
    })

    return {
      startDate,
      endDate,
      averageCalories,
      averageNutrients,
      goalProgress,
      recommendations: this.generateRecommendations(goalProgress, goals)
    }
  }

  private calculateAverage(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private validateCompliance(
    meals: any[],
    requirements: DietaryRequirement[],
    restrictions: any[]
  ): boolean {
    // Implement compliance validation logic
    // This is a placeholder implementation
    return true
  }

  private generateRecommendations(
    progress: NutritionalReport['goalProgress'],
    goals: NutritionalGoal[]
  ): string[] {
    const recommendations: string[] = []

    goals.forEach(goal => {
      const goalProgress = progress[goal.nutrientType]
      if (goalProgress < 90) {
        recommendations.push(
          `Increase ${goal.nutrientType.toLowerCase()} intake to meet daily target`
        )
      } else if (goalProgress > 110) {
        recommendations.push(
          `Reduce ${goal.nutrientType.toLowerCase()} intake to stay within target`
        )
      }
    })

    return recommendations
  }
}

export const nutritionalAnalysisService = NutritionalAnalysisService.getInstance()
