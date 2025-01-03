import React from 'react'
import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress/Progress'

interface NutritionalMetricsProps {
  calories: number
  nutrients: {
    [key: string]: number
  }
  goals: {
    [key: string]: number
  }
}

export const NutritionalMetrics: React.FC<NutritionalMetricsProps> = ({
  calories,
  nutrients,
  goals
}) => {
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Daily Calories</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {Math.round(calories)} kcal
        </div>
        <Progress
          value={Math.min((calories / 2000) * 100, 100)}
          className="h-2"
        />
        <p className="text-sm text-gray-600 mt-2">
          Daily target: 2000 kcal
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(nutrients).map(([nutrient, value]) => {
          const goalProgress = goals[nutrient] || 0
          const isOnTrack = goalProgress >= 90 && goalProgress <= 110

          return (
            <Card
              key={nutrient}
              className={`p-4 ${
                isOnTrack ? 'bg-green-50' : 'bg-yellow-50'
              }`}
            >
              <h4 className="font-medium mb-2">
                {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
              </h4>
              <div className="text-2xl font-bold mb-2">
                {Math.round(value)}g
              </div>
              <Progress
                value={goalProgress}
                variant={isOnTrack ? 'success' : 'warning'}
                className="h-2"
              />
              <p className="text-sm text-gray-600 mt-2">
                {Math.round(goalProgress)}% of daily goal
              </p>
            </Card>
          )
        })}
      </div>

      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Nutrient Balance</h3>
        <div className="flex items-center gap-4">
          {Object.entries(nutrients).map(([nutrient, value]) => {
            const percentage = (value / Object.values(nutrients)
              .reduce((a, b) => a + b, 0)) * 100

            return (
              <div
                key={nutrient}
                className="flex-1 text-center"
              >
                <div
                  className="w-full bg-gray-100 rounded-full h-2 mb-2"
                  style={{
                    background: `linear-gradient(to right, 
                      var(--${nutrient}-color) ${percentage}%, 
                      #f3f4f6 ${percentage}%)`
                  }}
                />
                <div className="text-sm font-medium">
                  {Math.round(percentage)}%
                </div>
                <div className="text-xs text-gray-600">
                  {nutrient}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
