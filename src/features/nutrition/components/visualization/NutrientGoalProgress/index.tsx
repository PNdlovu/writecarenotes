import React from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { Card } from '@/components/ui/Card'

interface NutrientGoal {
  nutrient: string
  current: number
  target: number
  percentage: number
}

interface NutrientGoalProgressProps {
  goals: NutrientGoal[]
  title?: string
}

export const NutrientGoalProgress: React.FC<NutrientGoalProgressProps> = ({
  goals,
  title = 'Nutrient Goal Progress'
}) => {
  const chartData = goals.map(goal => ({
    nutrient: goal.nutrient,
    percentage: goal.percentage,
    current: goal.current,
    target: goal.target
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="nutrient"
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
            />
            <Radar
              name="Current"
              dataKey="percentage"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.6}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `${value}% (${props.payload.current}/${props.payload.target})`,
                name
              ]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {goals.map(goal => (
          <div
            key={goal.nutrient}
            className={`p-4 rounded-lg ${
              goal.percentage >= 90 && goal.percentage <= 110
                ? 'bg-green-50'
                : goal.percentage < 90
                ? 'bg-yellow-50'
                : 'bg-red-50'
            }`}
          >
            <div className="text-sm font-medium mb-1">
              {goal.nutrient}
            </div>
            <div className="text-2xl font-bold">
              {goal.percentage}%
            </div>
            <div className="text-sm text-gray-600">
              {goal.current}/{goal.target}
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  goal.percentage >= 90 && goal.percentage <= 110
                    ? 'bg-green-500'
                    : goal.percentage < 90
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(goal.percentage, 100)}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Status Summary</h4>
        <div className="space-y-2 text-sm">
          {goals.map(goal => {
            let status = ''
            let color = ''

            if (goal.percentage >= 90 && goal.percentage <= 110) {
              status = 'On Track'
              color = 'text-green-600'
            } else if (goal.percentage < 90) {
              status = 'Below Target'
              color = 'text-yellow-600'
            } else {
              status = 'Above Target'
              color = 'text-red-600'
            }

            return (
              <div
                key={goal.nutrient}
                className="flex justify-between items-center"
              >
                <span>{goal.nutrient}</span>
                <span className={color}>{status}</span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
