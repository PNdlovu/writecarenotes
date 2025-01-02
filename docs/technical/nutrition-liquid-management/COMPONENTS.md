# Nutrition and Liquid Management Components Documentation

## Overview
This document provides detailed documentation for all React components in the Nutrition and Liquid Management module.

## Table of Contents
1. [Meal Planning Components](#meal-planning-components)
2. [Liquid Intake Components](#liquid-intake-components)
3. [Visualization Components](#visualization-components)
4. [Form Components](#form-components)
5. [Utility Components](#utility-components)

## Meal Planning Components

### MealPlanDashboard
Main dashboard component for meal planning.

```typescript
import { MealPlanDashboard } from '@/features/nutrition/components/meal-plans/MealPlanDashboard'

// Usage
<MealPlanDashboard
  residentId="resident-id"
  onUpdate={() => {}}
/>
```

**Features:**
- Overview of all meal plans
- Quick actions for common tasks
- Real-time updates
- Responsive design

### MealPlanForm
Form component for creating and editing meal plans.

```typescript
import { MealPlanForm } from '@/features/nutrition/components/meal-plans/MealPlanForm'

// Usage
<MealPlanForm
  residentId="resident-id"
  initialData={mealPlanData}
  onSubmit={(data) => {}}
/>
```

**Validation Rules:**
- Name is required
- At least one meal required
- Valid nutritional values

## Liquid Intake Components

### LiquidIntakeTracker
Component for tracking daily liquid intake.

```typescript
import { LiquidIntakeTracker } from '@/features/nutrition/components/liquid-intake/LiquidIntakeTracker'

// Usage
<LiquidIntakeTracker
  residentId="resident-id"
/>
```

**Features:**
- Quick add buttons
- Type selection
- Progress tracking
- Daily breakdown

### BatchIntakeForm
Form for recording multiple liquid intakes.

```typescript
import { BatchIntakeForm } from '@/features/nutrition/components/batch-operations/BatchIntakeForm'

// Usage
<BatchIntakeForm
  residentId="resident-id"
  onSuccess={() => {}}
/>
```

**Features:**
- Multiple entry support
- Bulk validation
- Time selection
- Notes field

## Visualization Components

### NutrientDistributionChart
Pie chart showing nutrient distribution.

```typescript
import { NutrientDistributionChart } from '@/features/nutrition/components/visualization/NutrientDistributionChart'

// Usage
<NutrientDistributionChart
  data={{
    protein: 20,
    carbs: 50,
    fat: 30
  }}
  title="Nutrient Distribution"
/>
```

**Features:**
- Interactive tooltips
- Custom colors
- Responsive sizing
- Legend support

### CalorieProgressChart
Bar chart showing calorie intake progress.

```typescript
import { CalorieProgressChart } from '@/features/nutrition/components/visualization/CalorieProgressChart'

// Usage
<CalorieProgressChart
  data={calorieData}
  title="Calorie Progress"
/>
```

**Features:**
- Daily breakdown
- Target line
- Meal-specific data
- Interactive elements

## Form Components

### DietaryRequirementSelect
Multi-select component for dietary requirements.

```typescript
import { DietaryRequirementSelect } from '@/features/nutrition/components/meal-plans/DietaryRequirementSelect'

// Usage
<DietaryRequirementSelect
  value={selectedRequirements}
  onChange={(requirements) => {}}
/>
```

**Features:**
- Search functionality
- Category grouping
- Clear selection
- Validation

### NutritionalGoalInput
Input component for setting nutritional goals.

```typescript
import { NutritionalGoalInput } from '@/features/nutrition/components/meal-plans/NutritionalGoalInput'

// Usage
<NutritionalGoalInput
  value={goals}
  onChange={(goals) => {}}
/>
```

**Features:**
- Unit conversion
- Range validation
- Preset values
- Custom goals

## Utility Components

### AdvancedIntakeFilter
Component for filtering intake data.

```typescript
import { AdvancedIntakeFilter } from '@/features/nutrition/components/filters/AdvancedIntakeFilter'

// Usage
<AdvancedIntakeFilter
  onFilter={(filters) => {}}
  initialFilters={filters}
/>
```

**Features:**
- Date range selection
- Type filtering
- Amount range
- Sort options

## Best Practices

### Performance Optimization
1. Use React.memo for pure components
2. Implement virtualization for long lists
3. Lazy load components when possible
4. Optimize re-renders with useMemo and useCallback

### Accessibility
1. Proper ARIA labels
2. Keyboard navigation
3. Color contrast
4. Screen reader support

### Error Handling
1. Form validation feedback
2. Error boundaries
3. Loading states
4. Fallback UI

### State Management
1. Use React Query for server state
2. Local state for UI-only data
3. Context for shared state
4. Optimistic updates

## Component Architecture

### Directory Structure
```
src/features/nutrition/components/
├── meal-plans/
│   ├── MealPlanDashboard/
│   ├── MealPlanForm/
│   └── ...
├── liquid-intake/
│   ├── LiquidIntakeTracker/
│   └── ...
├── visualization/
│   ├── NutrientDistributionChart/
│   └── ...
└── filters/
    └── AdvancedIntakeFilter/
```

### Component Guidelines
1. Single responsibility principle
2. Consistent prop naming
3. Default prop values
4. TypeScript interfaces
5. Styled components organization
6. Test coverage
