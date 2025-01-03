'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Badge } from '@/components/ui/Badge/Badge'
import { Progress } from '@/components/ui/Progress/Progress'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

interface ComplianceOverviewProps {
  compliance: {
    categoryScores: Record<string, number>
    riskAreas: { name: string; count: number }[]
    trendsLastMonth: {
      improvement: number
      decline: number
      unchanged: number
    }
  }
}

const COLORS = ['#16a34a', '#dc2626', '#ca8a04']

export function ComplianceOverview({ compliance }: ComplianceOverviewProps) {
  const trendData = [
    { name: 'Improved', value: compliance.trendsLastMonth.improvement },
    { name: 'Declined', value: compliance.trendsLastMonth.decline },
    { name: 'Unchanged', value: compliance.trendsLastMonth.unchanged },
  ]

  const topRisks = compliance.riskAreas
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Monthly Trends
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={trendData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
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
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Category Scores
        </h3>
        <div className="space-y-4">
          {Object.entries(compliance.categoryScores).map(([category, score]) => (
            <div key={category}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{category}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(score)}%
                </span>
              </div>
              <Progress value={score} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Top Risk Areas
        </h3>
        <div className="space-y-2">
          {topRisks.map(risk => (
            <div
              key={risk.name}
              className="flex justify-between items-center p-2 bg-muted rounded-md"
            >
              <span className="text-sm">{risk.name}</span>
              <Badge variant="secondary">{risk.count} issues</Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex justify-center mb-1">
              <ArrowUp className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-semibold">
              {compliance.trendsLastMonth.improvement}
            </div>
            <div className="text-xs text-muted-foreground">Improved</div>
          </div>
          <div>
            <div className="flex justify-center mb-1">
              <ArrowDown className="h-4 w-4 text-red-600" />
            </div>
            <div className="text-2xl font-semibold">
              {compliance.trendsLastMonth.decline}
            </div>
            <div className="text-xs text-muted-foreground">Declined</div>
          </div>
          <div>
            <div className="flex justify-center mb-1">
              <Minus className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="text-2xl font-semibold">
              {compliance.trendsLastMonth.unchanged}
            </div>
            <div className="text-xs text-muted-foreground">Unchanged</div>
          </div>
        </div>
      </div>
    </div>
  )
}


