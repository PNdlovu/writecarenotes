import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer
} from 'recharts'
import { Card } from '@/components/ui/Card'

interface CalorieData {
  date: string
  calories: number
  target: number
  breakfast: number
  lunch: number
  dinner: number
  snacks: number
}

interface CalorieProgressChartProps {
  data: CalorieData[]
  title?: string
}

export const CalorieProgressChart: React.FC<CalorieProgressChartProps> = ({
  data,
  title = 'Calorie Progress'
}) => {
  const maxCalories = Math.max(
    ...data.map(d => Math.max(d.calories, d.target))
  )

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => new Date(date).toLocaleDateString()}
            />
            <YAxis domain={[0, maxCalories * 1.1]} />
            <Tooltip
              labelFormatter={(date) => new Date(date).toLocaleDateString()}
              formatter={(value: number) => [`${value} kcal`, '']}
            />
            <Legend />
            <Bar
              dataKey="breakfast"
              stackId="a"
              fill="#16a34a"
              name="Breakfast"
            />
            <Bar
              dataKey="lunch"
              stackId="a"
              fill="#2563eb"
              name="Lunch"
            />
            <Bar
              dataKey="dinner"
              stackId="a"
              fill="#9333ea"
              name="Dinner"
            />
            <Bar
              dataKey="snacks"
              stackId="a"
              fill="#ca8a04"
              name="Snacks"
            />
            <ReferenceLine
              y={data[0]?.target}
              label="Target"
              stroke="#dc2626"
              strokeDasharray="3 3"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.slice(-1).map((day, index) => (
          <React.Fragment key={index}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-700">Breakfast</div>
              <div className="text-2xl font-bold text-green-600">
                {day.breakfast} kcal
              </div>
              <div className="text-sm text-green-500">
                {((day.breakfast / day.target) * 100).toFixed(1)}% of target
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-700">Lunch</div>
              <div className="text-2xl font-bold text-blue-600">
                {day.lunch} kcal
              </div>
              <div className="text-sm text-blue-500">
                {((day.lunch / day.target) * 100).toFixed(1)}% of target
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-700">Dinner</div>
              <div className="text-2xl font-bold text-purple-600">
                {day.dinner} kcal
              </div>
              <div className="text-sm text-purple-500">
                {((day.dinner / day.target) * 100).toFixed(1)}% of target
              </div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-sm font-medium text-yellow-700">Snacks</div>
              <div className="text-2xl font-bold text-yellow-600">
                {day.snacks} kcal
              </div>
              <div className="text-sm text-yellow-500">
                {((day.snacks / day.target) * 100).toFixed(1)}% of target
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}
