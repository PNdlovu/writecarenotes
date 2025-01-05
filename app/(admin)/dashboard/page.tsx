'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { costOptimizationService } from '@/services/cost-optimization'
import { usageAnalyticsService } from '@/services/usage-analytics'

export default function AdminDashboard() {
  const [costReport, setCostReport] = React.useState<any>(null)
  const [usageReport, setUsageReport] = React.useState<any>(null)
  const [selectedTimeRange, setSelectedTimeRange] = React.useState('24h')
  const [selectedMetric, setSelectedMetric] = React.useState('costs')

  React.useEffect(() => {
    const fetchReports = async () => {
      const [cost, usage] = await Promise.all([
        costOptimizationService.generateCostReport(),
        usageAnalyticsService.generateUsageReport()
      ])
      setCostReport(cost)
      setUsageReport(usage)
    }

    fetchReports()
    const interval = setInterval(fetchReports, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  if (!costReport || !usageReport) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="rounded-lg border-gray-300"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="rounded-lg border-gray-300"
          >
            <option value="costs">Costs</option>
            <option value="usage">Usage</option>
            <option value="performance">Performance</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Cost Overview</h3>
          <div className="text-3xl font-bold text-blue-600">
            ${costReport.costs.total.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500">
            Projected: ${costReport.costs.projected.toFixed(2)}/month
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <div className="text-3xl font-bold text-green-600">
            {usageReport.overview.activeUsers.daily}
          </div>
          <p className="text-sm text-gray-500">
            Monthly: {usageReport.overview.activeUsers.monthly}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-2">System Health</h3>
          <div className="text-3xl font-bold text-indigo-600">
            {usageReport.overview.overallHealth.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-500">
            Error Rate: {usageReport.performance.current.errorRate.toFixed(2)}%
          </p>
        </motion.div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">
          {selectedMetric === 'costs' ? 'Cost Trends' :
           selectedMetric === 'usage' ? 'Usage Patterns' :
           'Performance Metrics'}
        </h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'costs' ? (
              <LineChart data={costReport.costs.breakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563EB"
                  name="Total Cost"
                />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#7C3AED"
                  name="Token Cost"
                />
                <Line
                  type="monotone"
                  dataKey="api"
                  stroke="#10B981"
                  name="API Cost"
                />
              </LineChart>
            ) : selectedMetric === 'usage' ? (
              <BarChart data={usageReport.features.usage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563EB" name="Usage Count" />
              </BarChart>
            ) : (
              <LineChart data={usageReport.performance.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgDuration"
                  stroke="#2563EB"
                  name="Avg Response Time"
                />
                <Line
                  type="monotone"
                  dataKey="p95Duration"
                  stroke="#DC2626"
                  name="P95 Response Time"
                />
                <Line
                  type="monotone"
                  dataKey="errorRate"
                  stroke="#FCD34D"
                  name="Error Rate"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Optimization Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Cost Optimization</h3>
          <div className="space-y-4">
            {costReport.optimization.suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-500">
                Potential Savings: ${costReport.optimization.potentialSavings.toFixed(2)}/month
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-6 bg-white rounded-lg shadow-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Usage Recommendations</h3>
          <div className="space-y-4">
            {usageReport.recommendations.map((recommendation: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Top Features</h3>
          <div className="space-y-4">
            {usageReport.features.topFeatures.map((feature: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{feature.feature}</span>
                <span className="text-blue-600 font-medium">{feature.usage}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Avg Response Time</span>
              <span className="text-blue-600 font-medium">
                {usageReport.performance.current.averageResponseTime.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">P95 Response Time</span>
              <span className="text-blue-600 font-medium">
                {usageReport.performance.current.p95ResponseTime.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Error Rate</span>
              <span className="text-blue-600 font-medium">
                {usageReport.performance.current.errorRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Token Usage</span>
              <span className="text-blue-600 font-medium">
                {((costReport.limits.tokenUsage.used / costReport.limits.tokenUsage.daily) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">API Calls</span>
              <span className="text-blue-600 font-medium">
                {((costReport.limits.apiCalls.used / costReport.limits.apiCalls.daily) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Storage Used</span>
              <span className="text-blue-600 font-medium">
                {usageReport.overview.storageUsed}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
