import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts'
import { Card } from '@/components/ui/Card'

interface NutrientData {
  name: string
  value: number
  color: string
}

interface NutrientDistributionChartProps {
  data: {
    [key: string]: number
  }
  title?: string
}

const COLORS = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#ca8a04', // yellow
  '#9333ea', // purple
  '#0891b2', // cyan
  '#ea580c', // orange
  '#4f46e5', // indigo
  '#be185d'  // pink
]

export const NutrientDistributionChart: React.FC<NutrientDistributionChartProps> = ({
  data,
  title = 'Nutrient Distribution'
}) => {
  const chartData: NutrientData[] = Object.entries(data).map(
    ([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length]
    })
  )

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [
                `${value}g (${((value / total) * 100).toFixed(1)}%)`,
                ''
              ]}
            />
            <Legend
              formatter={(value: string) => 
                value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {chartData.map(item => (
          <div
            key={item.name}
            className="text-center p-2 rounded-lg"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <div className="text-sm font-medium mb-1">
              {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
            </div>
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.value}g
            </div>
            <div className="text-sm text-gray-500">
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
