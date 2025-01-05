/**
 * WriteCareNotes.com
 * @fileoverview Dietary Feature Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface DietaryRequirement {
  id: string;
  residentId: string;
  type: DietaryType;
  details: string;
  restrictions: string[];
  allergies: string[];
  preferences: string[];
  specialInstructions?: string;
  reviewDate: string;
  status: 'ACTIVE' | 'ARCHIVED';
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
  };
}

export type DietaryType = 
  | 'REGULAR'
  | 'SOFT'
  | 'PUREED'
  | 'LIQUID'
  | 'DIABETIC'
  | 'LOW_SODIUM'
  | 'GLUTEN_FREE'
  | 'DAIRY_FREE'
  | 'VEGETARIAN'
  | 'VEGAN'
  | 'HALAL'
  | 'KOSHER'
  | 'CUSTOM';

export interface MealPlan {
  id: string;
  residentId: string;
  date: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    snacks?: Meal[];
  };
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
  };
}

export interface Meal {
  id: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  items: MenuItem[];
  servingTime?: string;
  consumptionStatus?: 'NOT_STARTED' | 'PARTIAL' | 'COMPLETED' | 'REFUSED';
  notes?: string;
}

export interface MenuItem {
  name: string;
  portion: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
  };
  alternatives?: string[];
}

export interface DietaryFilter {
  residentId?: string;
  type?: DietaryType;
  status?: DietaryRequirement['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
} 