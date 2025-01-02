import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { mealPlanningService } from '@/features/nutrition/services/meal-planning-service'
import { nutritionalAnalysisService } from '@/features/nutrition/services/nutritional-analysis-service'
import { MealPlanCalendar } from '../MealPlanCalendar'
import { NutritionalMetrics } from '../../shared/NutritionalMetrics'
import { DietaryCompliance } from '../DietaryCompliance'

interface MealPlanDashboardProps {
  residentId: string
}

export const MealPlanDashboard: React.FC<MealPlanDashboardProps> = ({
  residentId
}) => {
  const { data: mealPlans, isLoading: isLoadingMealPlans } = useQuery({
    queryKey: ['mealPlans', residentId],
    queryFn: () => mealPlanningService.getResidentMealPlans(residentId)
  })

  const { data: nutritionReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['nutritionReport', residentId],
    queryFn: async () => {
      if (!mealPlans?.[0]) return null
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      return nutritionalAnalysisService.trackGoalProgress(
        mealPlans[0].id,
        startDate,
        now
      )
    },
    enabled: !!mealPlans?.[0]
  })

  if (isLoadingMealPlans || isLoadingReport) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Active Meal Plans</h2>
          {mealPlans?.map(plan => (
            <div
              key={plan.id}
              className="border-b border-gray-200 last:border-0 py-4"
            >
              <h3 className="font-medium">{plan.type}</h3>
              <p className="text-sm text-gray-600">
                {new Date(plan.startDate).toLocaleDateString()} -{' '}
                {new Date(plan.endDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Nutritional Overview</h2>
          {nutritionReport && (
            <NutritionalMetrics
              calories={nutritionReport.averageCalories}
              nutrients={nutritionReport.averageNutrients}
              goals={nutritionReport.goalProgress}
            />
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Meal Calendar</h2>
        {mealPlans?.[0] && (
          <MealPlanCalendar
            mealPlanId={mealPlans[0].id}
            startDate={new Date(mealPlans[0].startDate)}
            endDate={new Date(mealPlans[0].endDate)}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dietary Compliance</h2>
        {mealPlans?.[0] && (
          <DietaryCompliance
            mealPlanId={mealPlans[0].id}
            recommendations={nutritionReport?.recommendations || []}
          />
        )}
      </div>
    </div>
  )
}
