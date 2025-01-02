/**
 * WriteCareNotes.com
 * @fileoverview Dietary Validation Utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import type { DietaryRequirement, MealPlan, DietaryType, Meal } from '../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDietaryRequirement(data: Partial<DietaryRequirement>): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.type) errors.push('Dietary type is required');
  if (!data.details) errors.push('Details are required');
  if (!data.reviewDate) errors.push('Review date is required');

  // Type validation
  if (data.type && !isValidDietaryType(data.type)) {
    errors.push('Invalid dietary type');
  }

  // Arrays validation
  if (data.restrictions && !Array.isArray(data.restrictions)) {
    errors.push('Restrictions must be an array');
  }
  if (data.allergies && !Array.isArray(data.allergies)) {
    errors.push('Allergies must be an array');
  }
  if (data.preferences && !Array.isArray(data.preferences)) {
    errors.push('Preferences must be an array');
  }

  // Date validation
  if (data.reviewDate && !isValidDate(data.reviewDate)) {
    errors.push('Invalid review date format');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateMealPlan(data: Partial<MealPlan>): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.date) errors.push('Date is required');
  if (!data.meals) errors.push('Meals are required');

  // Date validation
  if (data.date && !isValidDate(data.date)) {
    errors.push('Invalid date format');
  }

  // Meals validation
  if (data.meals) {
    if (data.meals.breakfast && !isValidMeal(data.meals.breakfast)) {
      errors.push('Invalid breakfast data');
    }
    if (data.meals.lunch && !isValidMeal(data.meals.lunch)) {
      errors.push('Invalid lunch data');
    }
    if (data.meals.dinner && !isValidMeal(data.meals.dinner)) {
      errors.push('Invalid dinner data');
    }
    if (data.meals.snacks) {
      if (!Array.isArray(data.meals.snacks)) {
        errors.push('Snacks must be an array');
      } else {
        data.meals.snacks.forEach((snack, index) => {
          if (!isValidMeal(snack)) {
            errors.push(`Invalid snack data at index ${index}`);
          }
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidDietaryType(type: string): type is DietaryType {
  const validTypes = [
    'REGULAR',
    'SOFT',
    'PUREED',
    'LIQUID',
    'DIABETIC',
    'LOW_SODIUM',
    'GLUTEN_FREE',
    'DAIRY_FREE',
    'VEGETARIAN',
    'VEGAN',
    'HALAL',
    'KOSHER',
    'CUSTOM'
  ];
  return validTypes.includes(type);
}

function isValidMeal(meal: Meal): boolean {
  if (!meal.type || !meal.items || !Array.isArray(meal.items)) {
    return false;
  }

  const validTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  if (!validTypes.includes(meal.type)) {
    return false;
  }

  return meal.items.every(item => 
    item.name && 
    item.portion &&
    (!item.nutritionalInfo || typeof item.nutritionalInfo === 'object') &&
    (!item.alternatives || Array.isArray(item.alternatives))
  );
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
} 