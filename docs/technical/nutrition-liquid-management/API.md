# Nutrition and Liquid Management API Documentation

## Overview
This document provides comprehensive documentation for the Nutrition and Liquid Management module's API endpoints, services, and components.

## Table of Contents
1. [API Endpoints](#api-endpoints)
2. [Services](#services)
3. [Components](#components)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)

## API Endpoints

### Meal Planning

#### GET /api/nutrition/meal-plans
Get all meal plans for a resident.

**Query Parameters:**
- `residentId` (string, required): ID of the resident
- `startDate` (ISO date, optional): Start date for filtering
- `endDate` (ISO date, optional): End date for filtering

**Response:**
```json
{
  "mealPlans": [
    {
      "id": "string",
      "name": "string",
      "type": "REGULAR | THERAPEUTIC | SPECIAL",
      "meals": [...],
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

#### POST /api/nutrition/meal-plans
Create a new meal plan.

**Request Body:**
```json
{
  "residentId": "string",
  "name": "string",
  "type": "REGULAR | THERAPEUTIC | SPECIAL",
  "meals": [
    {
      "name": "string",
      "type": "BREAKFAST | LUNCH | DINNER | SNACK",
      "calories": number,
      "nutrients": {
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }
  ]
}
```

### Liquid Intake

#### POST /api/nutrition/liquid-intake
Record liquid intake.

**Request Body:**
```json
{
  "residentId": "string",
  "type": "WATER | JUICE | TEA | COFFEE | MILK | SOUP | OTHER",
  "amount": number,
  "timestamp": "ISO date",
  "notes": "string"
}
```

#### GET /api/nutrition/liquid-intake/stats
Get liquid intake statistics.

**Query Parameters:**
- `residentId` (string, required)
- `date` (ISO date, required)

**Response:**
```json
{
  "total": number,
  "byType": {
    "WATER": number,
    "JUICE": number,
    ...
  },
  "progress": number,
  "remainingTarget": number
}
```

## Services

### MealPlanningService
Service for managing meal plans and schedules.

```typescript
interface MealPlanningService {
  createMealPlan(data: MealPlanData): Promise<MealPlan>
  updateMealPlan(id: string, data: Partial<MealPlanData>): Promise<MealPlan>
  deleteMealPlan(id: string): Promise<void>
  getMealPlan(id: string): Promise<MealPlan>
  listMealPlans(residentId: string): Promise<MealPlan[]>
}
```

### LiquidIntakeService
Service for tracking and analyzing liquid intake.

```typescript
interface LiquidIntakeService {
  recordIntake(data: LiquidIntakeData): Promise<LiquidIntake>
  batchRecordIntake(data: LiquidIntakeData[]): Promise<LiquidIntake[]>
  getDailyIntakeStats(residentId: string, date: Date): Promise<DailyIntakeStats>
  getWeeklyIntakeReport(residentId: string, startDate: Date): Promise<WeeklyReport>
}
```

## Components

### MealPlanDashboard
Main dashboard component for meal planning.

**Props:**
```typescript
interface MealPlanDashboardProps {
  residentId: string
  onUpdate?: () => void
}
```

### LiquidIntakeTracker
Component for tracking liquid intake.

**Props:**
```typescript
interface LiquidIntakeTrackerProps {
  residentId: string
}
```

## Data Models

### MealPlan
```typescript
interface MealPlan {
  id: string
  residentId: string
  name: string
  type: MealPlanType
  meals: Meal[]
  createdAt: Date
  updatedAt: Date
  version: number
}
```

### LiquidIntake
```typescript
interface LiquidIntake {
  id: string
  residentId: string
  type: LiquidType
  amount: number
  timestamp: Date
  notes?: string
}
```

## Error Handling

### Common Error Codes
- `400`: Bad Request - Invalid input data
- `404`: Not Found - Resource not found
- `409`: Conflict - Version conflict
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```
