import { prisma } from '@/lib/prisma'
import { 
  MealPlan, 
  MealType, 
  DietaryRequirement, 
  DietaryRestriction,
  NutritionalGoal
} from '@prisma/client'

interface CreateMealPlanInput {
  residentId: string
  startDate: Date
  endDate: Date
  type: MealType
  dietaryRequirements: DietaryRequirement[]
  restrictions: DietaryRestriction[]
  goals: NutritionalGoal[]
  notes?: string
}

interface UpdateMealPlanInput extends Partial<CreateMealPlanInput> {
  id: string
}

interface MealItem {
  id: string
  name: string
  servingSize: string
  calories: number
  nutrients: {
    protein: number
    carbs: number
    fat: number
    fiber: number
    [key: string]: number
  }
  allergens: string[]
  restrictions: DietaryRestriction[]
}

interface MealSchedule {
  mealPlanId: string
  date: Date
  meals: {
    type: MealType
    items: MealItem[]
    totalCalories: number
    totalNutrients: {
      protein: number
      carbs: number
      fat: number
      fiber: number
      [key: string]: number
    }
  }[]
}

export class MealPlanningService {
  private static instance: MealPlanningService

  private constructor() {}

  public static getInstance(): MealPlanningService {
    if (!MealPlanningService.instance) {
      MealPlanningService.instance = new MealPlanningService()
    }
    return MealPlanningService.instance
  }

  // Meal Plan Management
  public async createMealPlan(input: CreateMealPlanInput): Promise<MealPlan> {
    try {
      // Validate resident exists
      const resident = await prisma.resident.findUnique({
        where: { id: input.residentId }
      })
      if (!resident) {
        throw new Error('Resident not found')
      }

      // Check for dietary conflicts
      this.validateDietaryRequirements(
        input.dietaryRequirements,
        input.restrictions
      )

      // Create meal plan
      const mealPlan = await prisma.mealPlan.create({
        data: {
          residentId: input.residentId,
          startDate: input.startDate,
          endDate: input.endDate,
          type: input.type,
          dietaryRequirements: {
            connect: input.dietaryRequirements.map(req => ({ id: req.id }))
          },
          restrictions: {
            connect: input.restrictions.map(res => ({ id: res.id }))
          },
          goals: {
            connect: input.goals.map(goal => ({ id: goal.id }))
          },
          notes: input.notes,
          status: 'ACTIVE'
        },
        include: {
          dietaryRequirements: true,
          restrictions: true,
          goals: true
        }
      })

      // Generate initial meal schedule
      await this.generateMealSchedule(mealPlan.id)

      return mealPlan
    } catch (error) {
      console.error('Error creating meal plan:', error)
      throw error
    }
  }

  public async updateMealPlan(input: UpdateMealPlanInput): Promise<MealPlan> {
    try {
      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: input.id }
      })
      if (!mealPlan) {
        throw new Error('Meal plan not found')
      }

      if (input.dietaryRequirements || input.restrictions) {
        this.validateDietaryRequirements(
          input.dietaryRequirements || [],
          input.restrictions || []
        )
      }

      const updatedMealPlan = await prisma.mealPlan.update({
        where: { id: input.id },
        data: {
          startDate: input.startDate,
          endDate: input.endDate,
          type: input.type,
          dietaryRequirements: input.dietaryRequirements ? {
            set: input.dietaryRequirements.map(req => ({ id: req.id }))
          } : undefined,
          restrictions: input.restrictions ? {
            set: input.restrictions.map(res => ({ id: res.id }))
          } : undefined,
          goals: input.goals ? {
            set: input.goals.map(goal => ({ id: goal.id }))
          } : undefined,
          notes: input.notes
        },
        include: {
          dietaryRequirements: true,
          restrictions: true,
          goals: true
        }
      })

      // Regenerate meal schedule if requirements changed
      if (input.dietaryRequirements || input.restrictions) {
        await this.generateMealSchedule(updatedMealPlan.id)
      }

      return updatedMealPlan
    } catch (error) {
      console.error('Error updating meal plan:', error)
      throw error
    }
  }

  public async getMealPlan(id: string): Promise<MealPlan | null> {
    return prisma.mealPlan.findUnique({
      where: { id },
      include: {
        dietaryRequirements: true,
        restrictions: true,
        goals: true,
        schedule: {
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
  }

  public async getResidentMealPlans(residentId: string): Promise<MealPlan[]> {
    return prisma.mealPlan.findMany({
      where: {
        residentId,
        status: 'ACTIVE'
      },
      include: {
        dietaryRequirements: true,
        restrictions: true,
        goals: true
      }
    })
  }

  // Meal Schedule Management
  private async generateMealSchedule(mealPlanId: string): Promise<void> {
    const mealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        dietaryRequirements: true,
        restrictions: true,
        goals: true
      }
    })
    if (!mealPlan) throw new Error('Meal plan not found')

    // Delete existing schedule
    await prisma.mealSchedule.deleteMany({
      where: { mealPlanId }
    })

    // Generate schedule for each day
    const days = this.getDaysBetweenDates(mealPlan.startDate, mealPlan.endDate)
    for (const date of days) {
      const meals = await this.generateMealsForDay(
        date,
        mealPlan.dietaryRequirements,
        mealPlan.restrictions,
        mealPlan.goals
      )

      await prisma.mealSchedule.create({
        data: {
          mealPlanId,
          date,
          meals: {
            create: meals.map(meal => ({
              type: meal.type,
              items: {
                create: meal.items.map(item => ({
                  name: item.name,
                  servingSize: item.servingSize,
                  calories: item.calories,
                  nutrients: item.nutrients,
                  allergens: item.allergens
                }))
              },
              totalCalories: meal.totalCalories,
              totalNutrients: meal.totalNutrients
            }))
          }
        }
      })
    }
  }

  private async generateMealsForDay(
    date: Date,
    requirements: DietaryRequirement[],
    restrictions: DietaryRestriction[],
    goals: NutritionalGoal[]
  ): Promise<MealSchedule['meals']> {
    // Implement meal generation logic based on:
    // 1. Dietary requirements
    // 2. Restrictions
    // 3. Nutritional goals
    // 4. Time of day
    // This is a placeholder implementation
    return [
      {
        type: 'BREAKFAST',
        items: [],
        totalCalories: 0,
        totalNutrients: {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        }
      },
      {
        type: 'LUNCH',
        items: [],
        totalCalories: 0,
        totalNutrients: {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        }
      },
      {
        type: 'DINNER',
        items: [],
        totalCalories: 0,
        totalNutrients: {
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0
        }
      }
    ]
  }

  // Utility Functions
  private validateDietaryRequirements(
    requirements: DietaryRequirement[],
    restrictions: DietaryRestriction[]
  ): void {
    // Check for conflicts between requirements and restrictions
    for (const req of requirements) {
      for (const res of restrictions) {
        if (this.hasConflict(req, res)) {
          throw new Error(
            `Conflict between requirement ${req.name} and restriction ${res.name}`
          )
        }
      }
    }
  }

  private hasConflict(
    requirement: DietaryRequirement,
    restriction: DietaryRestriction
  ): boolean {
    // Implement conflict checking logic
    // This is a placeholder implementation
    return false
  }

  private getDaysBetweenDates(start: Date, end: Date): Date[] {
    const days: Date[] = []
    let current = new Date(start)
    while (current <= end) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    return days
  }
}

export const mealPlanningService = MealPlanningService.getInstance()
