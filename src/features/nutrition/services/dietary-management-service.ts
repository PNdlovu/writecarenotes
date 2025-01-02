import { prisma } from '@/lib/prisma'
import { 
  DietaryRequirement,
  DietaryRestriction,
  Allergen,
  FoodPreference
} from '@prisma/client'

interface DietaryProfile {
  requirements: DietaryRequirement[]
  restrictions: DietaryRestriction[]
  allergens: Allergen[]
  preferences: FoodPreference[]
}

interface MenuCustomization {
  originalItem: string
  substitutions: string[]
  reason: string
}

export class DietaryManagementService {
  private static instance: DietaryManagementService

  private constructor() {}

  public static getInstance(): DietaryManagementService {
    if (!DietaryManagementService.instance) {
      DietaryManagementService.instance = new DietaryManagementService()
    }
    return DietaryManagementService.instance
  }

  // Dietary Profile Management
  public async createDietaryProfile(
    residentId: string,
    profile: Omit<DietaryProfile, 'id'>
  ): Promise<DietaryProfile> {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId }
      })
      if (!resident) throw new Error('Resident not found')

      // Validate requirements and restrictions
      this.validateDietaryCompatibility(
        profile.requirements,
        profile.restrictions,
        profile.allergens
      )

      // Create or update profile
      const updatedResident = await prisma.resident.update({
        where: { id: residentId },
        data: {
          dietaryRequirements: {
            connect: profile.requirements.map(req => ({ id: req.id }))
          },
          dietaryRestrictions: {
            connect: profile.restrictions.map(res => ({ id: res.id }))
          },
          allergens: {
            connect: profile.allergens.map(allergen => ({ id: allergen.id }))
          },
          foodPreferences: {
            connect: profile.preferences.map(pref => ({ id: pref.id }))
          }
        },
        include: {
          dietaryRequirements: true,
          dietaryRestrictions: true,
          allergens: true,
          foodPreferences: true
        }
      })

      return {
        requirements: updatedResident.dietaryRequirements,
        restrictions: updatedResident.dietaryRestrictions,
        allergens: updatedResident.allergens,
        preferences: updatedResident.foodPreferences
      }
    } catch (error) {
      console.error('Error creating dietary profile:', error)
      throw error
    }
  }

  public async getDietaryProfile(residentId: string): Promise<DietaryProfile> {
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        dietaryRequirements: true,
        dietaryRestrictions: true,
        allergens: true,
        foodPreferences: true
      }
    })
    if (!resident) throw new Error('Resident not found')

    return {
      requirements: resident.dietaryRequirements,
      restrictions: resident.dietaryRestrictions,
      allergens: resident.allergens,
      preferences: resident.foodPreferences
    }
  }

  // Menu Customization
  public async customizeMenu(
    residentId: string,
    menuItems: string[]
  ): Promise<MenuCustomization[]> {
    try {
      const profile = await this.getDietaryProfile(residentId)
      const customizations: MenuCustomization[] = []

      for (const item of menuItems) {
        const customization = await this.findSubstitutions(item, profile)
        if (customization) {
          customizations.push(customization)
        }
      }

      return customizations
    } catch (error) {
      console.error('Error customizing menu:', error)
      throw error
    }
  }

  // Allergen Management
  public async addAllergen(
    residentId: string,
    allergenId: string
  ): Promise<void> {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: {
          allergens: true,
          dietaryRestrictions: true
        }
      })
      if (!resident) throw new Error('Resident not found')

      // Check if allergen already exists
      if (resident.allergens.some(a => a.id === allergenId)) {
        return
      }

      // Add allergen and corresponding restrictions
      await prisma.resident.update({
        where: { id: residentId },
        data: {
          allergens: {
            connect: { id: allergenId }
          },
          dietaryRestrictions: {
            connect: { id: this.getAllergenRestriction(allergenId) }
          }
        }
      })
    } catch (error) {
      console.error('Error adding allergen:', error)
      throw error
    }
  }

  public async removeAllergen(
    residentId: string,
    allergenId: string
  ): Promise<void> {
    try {
      await prisma.resident.update({
        where: { id: residentId },
        data: {
          allergens: {
            disconnect: { id: allergenId }
          },
          dietaryRestrictions: {
            disconnect: { id: this.getAllergenRestriction(allergenId) }
          }
        }
      })
    } catch (error) {
      console.error('Error removing allergen:', error)
      throw error
    }
  }

  // Food Preferences
  public async updateFoodPreferences(
    residentId: string,
    preferences: FoodPreference[]
  ): Promise<FoodPreference[]> {
    try {
      const resident = await prisma.resident.update({
        where: { id: residentId },
        data: {
          foodPreferences: {
            set: preferences.map(pref => ({ id: pref.id }))
          }
        },
        include: {
          foodPreferences: true
        }
      })

      return resident.foodPreferences
    } catch (error) {
      console.error('Error updating food preferences:', error)
      throw error
    }
  }

  // Utility Functions
  private validateDietaryCompatibility(
    requirements: DietaryRequirement[],
    restrictions: DietaryRestriction[],
    allergens: Allergen[]
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

    // Check for allergen-related conflicts
    for (const allergen of allergens) {
      for (const req of requirements) {
        if (this.hasAllergenConflict(allergen, req)) {
          throw new Error(
            `Conflict between allergen ${allergen.name} and requirement ${req.name}`
          )
        }
      }
    }
  }

  private async findSubstitutions(
    item: string,
    profile: DietaryProfile
  ): Promise<MenuCustomization | null> {
    // Implement substitution logic based on dietary profile
    // This is a placeholder implementation
    return null
  }

  private hasConflict(
    requirement: DietaryRequirement,
    restriction: DietaryRestriction
  ): boolean {
    // Implement conflict checking logic
    // This is a placeholder implementation
    return false
  }

  private hasAllergenConflict(
    allergen: Allergen,
    requirement: DietaryRequirement
  ): boolean {
    // Implement allergen conflict checking logic
    // This is a placeholder implementation
    return false
  }

  private getAllergenRestriction(allergenId: string): string {
    // Map allergen to corresponding restriction
    // This is a placeholder implementation
    return allergenId
  }
}

export const dietaryManagementService = DietaryManagementService.getInstance()
