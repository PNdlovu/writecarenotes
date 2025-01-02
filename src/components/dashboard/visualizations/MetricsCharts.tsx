// Dashboard metrics charts
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { LineChartComponent, BarChartComponent, PieChartComponent } from './ChartTypes'
import { VisualizationProps } from './types'
import { COLORS } from '@/lib/constants'
import { useTheme } from 'next-themes'

export const MetricsOverview = ({ data }: VisualizationProps) => {
  const { theme } = useTheme()
  const colors = COLORS[theme === 'dark' ? 'dark' : 'light']

  const messageVolumeConfig = {
    type: 'line',
    title: 'Message Volume',
    description: 'Message volume over time',
    dataKey: 'count',
    category: 'metrics'
  }

  const costDistributionConfig = {
    type: 'pie',
    title: 'Cost Distribution',
    description: 'Costs by category',
    dataKey: 'value',
    category: 'financial'
  }

  const performanceConfig = {
    type: 'bar',
    title: 'Performance Metrics',
    description: 'Key performance indicators',
    dataKey: 'value',
    category: 'performance'
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Message Volume Trend</CardTitle>
          <CardDescription>Message volume over time with forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <LineChartComponent 
            data={data.volumeTrend} 
            config={messageVolumeConfig}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution</CardTitle>
            <CardDescription>Cost breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent 
              data={data.costsByCategory} 
              config={costDistributionConfig}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent 
              data={data.performanceMetrics} 
              config={performanceConfig}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const MetricsDetails = ({ data }: VisualizationProps) => {
  // Implementation for detailed metrics view
  return (
    <div>
      {/* Detailed metrics implementation */}
    </div>
  )
} 


