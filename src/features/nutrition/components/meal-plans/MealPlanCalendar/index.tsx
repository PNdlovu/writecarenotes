import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { mealPlanningService } from '@/features/nutrition/services/meal-planning-service'
import { Calendar } from '@/components/ui/Calendar'

interface MealPlanCalendarProps {
  mealPlanId: string
  startDate: Date
  endDate: Date
}

export const MealPlanCalendar: React.FC<MealPlanCalendarProps> = ({
  mealPlanId,
  startDate,
  endDate
}) => {
  const { data: mealPlan, isLoading } = useQuery({
    queryKey: ['mealPlan', mealPlanId],
    queryFn: () => mealPlanningService.getMealPlan(mealPlanId)
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  const events = mealPlan?.schedule?.flatMap(schedule => 
    schedule.meals.map(meal => ({
      date: new Date(schedule.date),
      title: `${meal.type}: ${meal.items.map(item => item.name).join(', ')}`,
      calories: meal.totalCalories,
      nutrients: meal.totalNutrients
    }))
  ) || []

  return (
    <div className="space-y-4">
      <Calendar
        mode="range"
        selected={{
          from: startDate,
          to: endDate
        }}
        events={events}
        renderDay={(day, events) => (
          <div className="h-full">
            <div className="text-sm font-medium">
              {day.getDate()}
            </div>
            {events.map((event, index) => (
              <div
                key={index}
                className="text-xs p-1 bg-blue-50 rounded mt-1"
                title={event.title}
              >
                {event.title.length > 20
                  ? `${event.title.substring(0, 20)}...`
                  : event.title}
              </div>
            ))}
          </div>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {events
          .filter(event => 
            event.date.toDateString() === new Date().toDateString()
          )
          .map((event, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <h3 className="font-medium mb-2">{event.title}</h3>
              <p className="text-sm text-gray-600">
                Calories: {event.calories}
              </p>
              <div className="mt-2">
                <h4 className="text-sm font-medium">Nutrients:</h4>
                <ul className="text-sm text-gray-600">
                  {Object.entries(event.nutrients).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}g
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
