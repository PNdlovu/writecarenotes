import { prisma } from '@/lib/prisma'
import { 
  DietaryRequirement,
  DietaryRestriction,
  NutritionalGoal,
  MealType
} from '@prisma/client'
import { OpenAI } from 'openai'

interface MealRecommendation {
  name: string
  type: MealType
  calories: number
  nutrients: {
    [key: string]: number
  }
  ingredients: string[]
  preparation: string
  dietaryTags: string[]
  substitutions: {
    ingredient: string
    alternatives: string[]
  }[]
}

interface NutrientProfile {
  currentIntake: {
    [key: string]: number
  }
  goals: NutritionalGoal[]
  deficits: {
    [key: string]: number
  }
}

export class MealRecommendationService {
  private static instance: MealRecommendationService
  private openai: OpenAI

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  public static getInstance(): MealRecommendationService {
    if (!MealRecommendationService.instance) {
      MealRecommendationService.instance = new MealRecommendationService()
    }
    return MealRecommendationService.instance
  }

  // Main Recommendation Methods
  public async getPersonalizedRecommendations(
    residentId: string,
    mealType: MealType,
    count: number = 3
  ): Promise<MealRecommendation[]> {
    try {
      // Get resident's profile and preferences
      const profile = await this.getResidentProfile(residentId)
      
      // Calculate nutrient needs
      const nutrientProfile = await this.calculateNutrientNeeds(residentId)

      // Get meal history to avoid repetition
      const mealHistory = await this.getMealHistory(residentId)

      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        profile,
        nutrientProfile,
        mealType,
        mealHistory,
        count
      )

      // Score and rank recommendations
      const rankedRecommendations = this.rankRecommendations(
        recommendations,
        nutrientProfile,
        profile
      )

      return rankedRecommendations.slice(0, count)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      throw error
    }
  }

  public async generateWeeklyMealPlan(
    residentId: string
  ): Promise<{
    [key: string]: MealRecommendation[]
  }> {
    try {
      const weekPlan: { [key: string]: MealRecommendation[] } = {}
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      
      for (const day of daysOfWeek) {
        weekPlan[day] = []
        for (const mealType of ['BREAKFAST', 'LUNCH', 'DINNER']) {
          const recommendations = await this.getPersonalizedRecommendations(
            residentId,
            mealType as MealType,
            1
          )
          weekPlan[day].push(...recommendations)
        }
      }

      return weekPlan
    } catch (error) {
      console.error('Error generating weekly meal plan:', error)
      throw error
    }
  }

  // AI-Powered Recipe Generation
  public async generateCustomRecipe(
    requirements: DietaryRequirement[],
    restrictions: DietaryRestriction[],
    nutrientGoals: NutritionalGoal[],
    preferences: string[]
  ): Promise<MealRecommendation> {
    try {
      const prompt = this.buildRecipePrompt(
        requirements,
        restrictions,
        nutrientGoals,
        preferences
      )

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "You are a professional nutritionist and chef specializing in therapeutic and specialized diets."
        }, {
          role: "user",
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1000
      })

      return this.parseRecipeResponse(completion.choices[0].message.content)
    } catch (error) {
      console.error('Error generating custom recipe:', error)
      throw error
    }
  }

  // Utility Methods
  private async getResidentProfile(residentId: string) {
    return prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        dietaryRequirements: true,
        dietaryRestrictions: true,
        allergens: true,
        foodPreferences: true,
        nutritionalGoals: true
      }
    })
  }

  private async calculateNutrientNeeds(
    residentId: string
  ): Promise<NutrientProfile> {
    const resident = await this.getResidentProfile(residentId)
    if (!resident) throw new Error('Resident not found')

    // Get current intake from recent meals
    const currentIntake = await this.getCurrentIntake(residentId)

    // Calculate deficits
    const deficits: { [key: string]: number } = {}
    resident.nutritionalGoals.forEach(goal => {
      const current = currentIntake[goal.nutrientType] || 0
      deficits[goal.nutrientType] = goal.targetAmount - current
    })

    return {
      currentIntake,
      goals: resident.nutritionalGoals,
      deficits
    }
  }

  private async getCurrentIntake(residentId: string) {
    // Get meals from the last 24 hours
    const meals = await prisma.meal.findMany({
      where: {
        residentId,
        consumedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      include: {
        items: true
      }
    })

    // Calculate total nutrients
    const intake: { [key: string]: number } = {}
    meals.forEach(meal => {
      meal.items.forEach(item => {
        Object.entries(item.nutrients).forEach(([nutrient, amount]) => {
          intake[nutrient] = (intake[nutrient] || 0) + amount
        })
      })
    })

    return intake
  }

  private async getMealHistory(residentId: string) {
    return prisma.meal.findMany({
      where: {
        residentId,
        consumedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        items: true
      }
    })
  }

  private async generateRecommendations(
    profile: any,
    nutrientProfile: NutrientProfile,
    mealType: MealType,
    mealHistory: any[],
    count: number
  ): Promise<MealRecommendation[]> {
    // Get base recommendations from database
    const baseRecommendations = await prisma.mealTemplate.findMany({
      where: {
        type: mealType,
        AND: [
          {
            dietaryRequirements: {
              every: {
                id: {
                  in: profile.dietaryRequirements.map((r: any) => r.id)
                }
              }
            }
          },
          {
            NOT: {
              restrictions: {
                some: {
                  id: {
                    in: profile.dietaryRestrictions.map((r: any) => r.id)
                  }
                }
              }
            }
          }
        ]
      },
      take: count * 2 // Get more than needed for ranking
    })

    // Generate custom recipes if needed
    if (baseRecommendations.length < count) {
      const customRecipes = await Promise.all(
        Array(count - baseRecommendations.length).fill(0).map(() =>
          this.generateCustomRecipe(
            profile.dietaryRequirements,
            profile.dietaryRestrictions,
            profile.nutritionalGoals,
            profile.foodPreferences.map((p: any) => p.name)
          )
        )
      )
      return [...baseRecommendations, ...customRecipes]
    }

    return baseRecommendations
  }

  private rankRecommendations(
    recommendations: MealRecommendation[],
    nutrientProfile: NutrientProfile,
    profile: any
  ): MealRecommendation[] {
    return recommendations.sort((a, b) => {
      let scoreA = 0
      let scoreB = 0

      // Score based on nutrient match
      Object.entries(nutrientProfile.deficits).forEach(([nutrient, deficit]) => {
        const matchA = Math.min(1, a.nutrients[nutrient] / deficit)
        const matchB = Math.min(1, b.nutrients[nutrient] / deficit)
        scoreA += matchA
        scoreB += matchB
      })

      // Score based on dietary preferences
      profile.foodPreferences.forEach((pref: any) => {
        if (a.ingredients.some(i => i.includes(pref.name))) scoreA += 0.5
        if (b.ingredients.some(i => i.includes(pref.name))) scoreB += 0.5
      })

      return scoreB - scoreA
    })
  }

  private buildRecipePrompt(
    requirements: DietaryRequirement[],
    restrictions: DietaryRestriction[],
    nutrientGoals: NutritionalGoal[],
    preferences: string[]
  ): string {
    return `Generate a recipe that meets the following criteria:

Requirements:
${requirements.map(r => `- ${r.name}`).join('\n')}

Restrictions:
${restrictions.map(r => `- ${r.name}`).join('\n')}

Nutrient Goals:
${nutrientGoals.map(g => `- ${g.nutrientType}: ${g.targetAmount}${g.unit}`).join('\n')}

Preferences:
${preferences.map(p => `- ${p}`).join('\n')}

Please provide a recipe with:
1. Name
2. Ingredients with quantities
3. Nutritional information
4. Step-by-step preparation instructions
5. Possible substitutions for common allergens
6. Dietary tags`
  }

  private parseRecipeResponse(response: string): MealRecommendation {
    // Implement parsing logic for the AI response
    // This is a placeholder implementation
    return {
      name: '',
      type: 'BREAKFAST',
      calories: 0,
      nutrients: {},
      ingredients: [],
      preparation: '',
      dietaryTags: [],
      substitutions: []
    }
  }
}

export const mealRecommendationService = MealRecommendationService.getInstance()
