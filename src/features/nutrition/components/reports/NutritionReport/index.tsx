import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button/Button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { nutritionalAnalysisService } from '@/features/nutrition/services/nutritional-analysis-service'

interface NutritionReportProps {
  mealPlanId: string
  initialStartDate?: Date
  initialEndDate?: Date
}

export const NutritionReport: React.FC<NutritionReportProps> = ({
  mealPlanId,
  initialStartDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  initialEndDate = new Date()
}) => {
  const [dateRange, setDateRange] = React.useState({
    from: initialStartDate,
    to: initialEndDate
  })

  const { data: report, isLoading } = useQuery({
    queryKey: ['nutritionReport', mealPlanId, dateRange],
    queryFn: () =>
      nutritionalAnalysisService.trackGoalProgress(
        mealPlanId,
        dateRange.from,
        dateRange.to
      )
  })

  const downloadReport = async () => {
    try {
      const response = await fetch(
        `/api/nutrition/reports/download?` +
        new URLSearchParams({
          mealPlanId,
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString()
        })
      )
      if (!response.ok) throw new Error('Failed to download report')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nutrition-report-${dateRange.from.toISOString().split('T')[0]}-${dateRange.to.toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading report:', error)
    }
  }

  if (isLoading) {
    return <div>Loading report...</div>
  }

  if (!report) {
    return <div>No data available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        <Button
          variant="outline"
          onClick={downloadReport}
        >
          Download Report
        </Button>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Caloric Intake</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => 
                  new Date(date).toLocaleDateString()
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => 
                  new Date(date).toLocaleDateString()
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#2563eb"
                name="Calories"
              />
              <Line
                type="monotone"
                dataKey="targetCalories"
                stroke="#dc2626"
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">
            Nutrient Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => 
                    new Date(date).toLocaleDateString()
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => 
                    new Date(date).toLocaleDateString()
                  }
                />
                <Legend />
                {Object.keys(report.averageNutrients).map((nutrient, index) => (
                  <Line
                    key={nutrient}
                    type="monotone"
                    dataKey={`nutrients.${nutrient}`}
                    stroke={`hsl(${index * 45}, 70%, 50%)`}
                    name={nutrient}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Goal Progress</h3>
          <div className="space-y-4">
            {Object.entries(report.goalProgress).map(([goal, progress]) => (
              <div key={goal}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{goal}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      progress >= 90 && progress <= 110
                        ? 'bg-green-500'
                        : progress < 90
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {report.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-blue-500">•</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
