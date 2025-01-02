'use client'

import { useState } from 'react'
import { useOrganizationAnalytics } from '../../hooks/useOrganizationAnalytics'
import { Card } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#ca8a04', '#dc2626']

export function OrganizationAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month')
  const { data, isLoading, error } = useOrganizationAnalytics(timeRange)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error || !data) {
    return <div>Error loading analytics</div>
  }

  const occupancyData = data.historicalData.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    occupancy: item.metrics.averageOccupancy,
  }))

  const staffingData = data.careHomes.map(ch => ({
    name: ch.careHomeName,
    staff: ch.metrics.staff,
  }))

  const complianceData = Object.entries(data.compliance.categoryScores).map(
    ([category, score]) => ({
      category,
      score,
    })
  )

  const trendData = [
    {
      name: 'Improved',
      value: data.compliance.trendsLastMonth.improvement,
    },
    {
      name: 'Declined',
      value: data.compliance.trendsLastMonth.decline,
    },
    {
      name: 'Unchanged',
      value: data.compliance.trendsLastMonth.unchanged,
    },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analytics and insights for your organization
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value: 'day' | 'week' | 'month' | 'year') =>
            setTimeRange(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Average Occupancy
            </h3>
            <div className="mt-2">
              <p className="text-3xl font-semibold">
                {Math.round(data.metrics.averageOccupancy)}%
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Staff
            </h3>
            <div className="mt-2">
              <p className="text-3xl font-semibold">
                {data.metrics.totalStaff}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Compliance Score
            </h3>
            <div className="mt-2">
              <p className="text-3xl font-semibold">
                {Math.round(data.metrics.complianceScore)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="occupancy">
        <TabsList>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="occupancy">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Occupancy Trends</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="staffing">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Staff Distribution</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={staffingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="staff" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Compliance by Category
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" />
                      <Tooltip />
                      <Bar dataKey="score" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trendData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                      >
                        {trendData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


