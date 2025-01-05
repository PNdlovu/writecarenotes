export enum DietaryRestriction {
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
  DAIRY_FREE = 'DAIRY_FREE',
  NUT_FREE = 'NUT_FREE',
  HALAL = 'HALAL',
  KOSHER = 'KOSHER',
  LOW_SODIUM = 'LOW_SODIUM',
  DIABETIC = 'DIABETIC',
  SOFT_DIET = 'SOFT_DIET',
  PUREED = 'PUREED',
  THICKENED_LIQUIDS = 'THICKENED_LIQUIDS'
}

export enum MealType {
  BREAKFAST = 'BREAKFAST',
  MORNING_SNACK = 'MORNING_SNACK',
  LUNCH = 'LUNCH',
  AFTERNOON_SNACK = 'AFTERNOON_SNACK',
  DINNER = 'DINNER',
  EVENING_SNACK = 'EVENING_SNACK'
}

export enum NutritionGoal {
  WEIGHT_MAINTENANCE = 'WEIGHT_MAINTENANCE',
  WEIGHT_GAIN = 'WEIGHT_GAIN',
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  IMPROVED_HYDRATION = 'IMPROVED_HYDRATION',
  BLOOD_SUGAR_CONTROL = 'BLOOD_SUGAR_CONTROL',
  INCREASED_PROTEIN = 'INCREASED_PROTEIN'
}

export interface DietaryProfile {
  id: string;
  residentId: string;
  tenantId: string;
  restrictions: DietaryRestriction[];
  allergies: string[];
  preferences: {
    likes: string[];
    dislikes: string[];
  };
  nutritionGoals: NutritionGoal[];
  specialInstructions?: string;
  lastUpdated: Date;
  updatedBy: string;
}

export interface MealPlan {
  id: string;
  tenantId: string;
  facilityId: string;
  date: Date;
  mealType: MealType;
  menu: MenuItem[];
  alternatives: MenuItem[];
  nutritionInfo: NutritionInfo;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  restrictions: DietaryRestriction[];
  nutritionInfo: NutritionInfo;
  preparation?: string;
  servingSize: string;
  image?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  vitamins?: {
    [key: string]: number;
  };
  minerals?: {
    [key: string]: number;
  };
}

export interface MealService {
  id: string;
  mealPlanId: string;
  residentId: string;
  tenantId: string;
  dateServed: Date;
  mealType: MealType;
  itemsServed: {
    menuItemId: string;
    consumed: number; // percentage consumed (0-100)
    notes?: string;
  }[];
  hydrationAmount?: number; // in ml
  assistanceRequired: boolean;
  assistanceNotes?: string;
  servedBy: string;
}

export interface NutritionLog {
  id: string;
  residentId: string;
  tenantId: string;
  date: Date;
  weight?: number;
  bmi?: number;
  hydrationStatus: 'GOOD' | 'FAIR' | 'POOR';
  appetiteLevel: 'GOOD' | 'FAIR' | 'POOR';
  concerns?: string[];
  interventions?: string[];
  notes?: string;
  loggedBy: string;
}

export interface DietaryAlert {
  id: string;
  residentId: string;
  tenantId: string;
  type: 'ALLERGY' | 'RESTRICTION' | 'GOAL' | 'WEIGHT' | 'HYDRATION';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  active: boolean;
  createdAt: Date;
  createdBy: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}


