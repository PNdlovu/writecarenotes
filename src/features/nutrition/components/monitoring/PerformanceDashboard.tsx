import React, { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { monitoringSystem } from '../../utils/monitoring'
import { format } from 'date-fns'

interface DashboardData {
  metrics: Record<string, any[]>
  alerts: any[]
  performance: any
  resources: any
}

interface MetricCard {
  title: string
  value: number
  unit: string
  change?: number
  status: 'success' | 'warning' | 'error'
}

const PerformanceDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [timeRange, setTimeRange] = useState('1h')
  const [selectedMetric, setSelectedMetric] = useState('api_response_time')

  useEffect(() => {
    const fetchData = async () => {
      const dashboardData = await monitoringSystem.getDashboardData()
      setData(dashboardData)
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (!data) return <div>Loading...</div>

  const metricCards: MetricCard[] = [
    {
      title: 'API Response Time',
      value: data.performance.api.averageDuration,
      unit: 'ms',
      status:
        data.performance.api.averageDuration > 1000
          ? 'error'
          : data.performance.api.averageDuration > 500
          ? 'warning'
          : 'success'
    },
    {
      title: 'Error Rate',
      value: data.performance.api.errorRate * 100,
      unit: '%',
      status:
        data.performance.api.errorRate > 0.1
          ? 'error'
          : data.performance.api.errorRate > 0.05
          ? 'warning'
          : 'success'
    },
    {
      title: 'Active Connections',
      value: data.performance.realTime.activeConnections,
      unit: '',
      status: 'success'
    },
    {
      title: 'Memory Usage',
      value:
        (data.resources.memory.heapUsed /
          data.resources.memory.heapTotal) *
        100,
      unit: '%',
      status:
        data.resources.memory.heapUsed /
          data.resources.memory.heapTotal >
        0.9
          ? 'error'
          : data.resources.memory.heapUsed /
              data.resources.memory.heapTotal >
            0.7
          ? 'warning'
          : 'success'
    }
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Performance Dashboard
      </h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow ${
              card.status === 'error'
                ? 'bg-red-100'
                : card.status === 'warning'
                ? 'bg-yellow-100'
                : 'bg-green-100'
            }`}
          >
            <h3 className="text-sm font-medium text-gray-500">
              {card.title}
            </h3>
            <div className="mt-1">
              <span className="text-2xl font-semibold">
                {card.value.toFixed(2)}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                {card.unit}
              </span>
            </div>
            {card.change !== undefined && (
              <div
                className={`mt-1 ${
                  card.change >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {/* Metric Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Response Time Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">
            API Response Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.metrics.api_response_time}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={tick =>
                  format(tick, 'HH:mm:ss')
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={label =>
                  format(label, 'HH:mm:ss')
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Error Rate Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Error Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.metrics.error_rate}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={tick =>
                  format(tick, 'HH:mm:ss')
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={label =>
                  format(label, 'HH:mm:ss')
                }
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#82ca9d"
                name="Error Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-4">Recent Alerts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.alerts.map((alert, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(alert.timestamp, 'HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {alert.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {alert.message}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.severity === 'error'
                          ? 'bg-red-100 text-red-800'
                          : alert.severity === 'warning'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PerformanceDashboard
