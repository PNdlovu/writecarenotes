'use client'

import { Card } from '@/components/ui/card'
import { OrganizationMetrics } from '../../repositories/analyticsRepository'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MetricsOverviewProps {
  metrics: OrganizationMetrics
  historicalData: {
    date: Date
    metrics: OrganizationMetrics
  }[]
}

export function MetricsOverview({ metrics, historicalData }: MetricsOverviewProps) {
  const chartData = historicalData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    occupancy: item.metrics.averageOccupancy,
    compliance: item.metrics.complianceScore,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Care Homes
          </h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold">
              {metrics.totalCareHomes}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Residents
          </h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold">
              {metrics.totalResidents}
            </p>
            <p className="ml-2 text-sm text-muted-foreground">
              across all homes
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Occupancy
          </h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold">
              {Math.round(metrics.averageOccupancy)}%
            </p>
          </div>
        </div>
      </Card>

      <Card className="col-span-full">
        <div className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">
            Trends
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  name="Occupancy %"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="compliance"
                  name="Compliance Score"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  )
}


