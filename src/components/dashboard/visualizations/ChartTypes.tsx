import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  ScatterChart, Scatter, ZAxis, Brush, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Area, Treemap
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTheme } from 'next-themes'
import { COLORS } from '@/lib/constants'
import { ChartConfig } from './types'

interface BaseChartProps {
  data: any[]
  config: ChartConfig
  height?: number
}

export const LineChartComponent = ({ data, config, height = 300 }: BaseChartProps) => {
  const { theme } = useTheme()
  const colors = COLORS[theme === 'dark' ? 'dark' : 'light']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey={config.dataKey}
          stroke={colors[0]}
          activeDot={{ r: 8 }}
          animationDuration={1000}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export const BarChartComponent = ({ data, config, height = 300 }: BaseChartProps) => {
  const { theme } = useTheme()
  const colors = COLORS[theme === 'dark' ? 'dark' : 'light']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={config.dataKey} fill={colors[0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const PieChartComponent = ({ data, config, height = 300 }: BaseChartProps) => {
  const { theme } = useTheme()
  const colors = COLORS[theme === 'dark' ? 'dark' : 'light']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={config.dataKey}
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export const RadarChartComponent = ({ data, config, height = 300 }: BaseChartProps) => {
  const { theme } = useTheme()
  const colors = COLORS[theme === 'dark' ? 'dark' : 'light']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar
          name={config.title}
          dataKey={config.dataKey}
          stroke={colors[0]}
          fill={colors[0]}
          fillOpacity={0.6}
        />
        <Tooltip />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export const ComposedChartComponent = ({ data, config, height = 300 }: BaseChartProps) => {
  const { theme } = useTheme()
  const colors = COLORS[theme === 'dark' ? 'dark' : 'light']

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={config.dataKey} fill={colors[0]} />
        <Line type="monotone" dataKey={config.dataKey} stroke={colors[1]} />
        <Area type="monotone" dataKey={config.dataKey} fill={colors[2]} stroke={colors[2]} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}


