import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress/Progress"
import { Badge } from "@/components/ui/Badge/Badge"
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react"
import { ComplianceData } from '../types'

interface ComplianceStatsProps {
  stats: ComplianceData
}

export function ComplianceStats({ stats }: ComplianceStatsProps) {
  const getTrendIcon = (score: number, threshold: number) => {
    if (score > threshold + 5) return <ArrowUpIcon className="h-4 w-4 text-green-500" />
    if (score < threshold - 5) return <ArrowDownIcon className="h-4 w-4 text-red-500" />
    return <MinusIcon className="h-4 w-4 text-yellow-500" />
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
          {getTrendIcon(stats.overall_score, 80)}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.overall_score}%</div>
          <Progress value={stats.overall_score} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Category Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.category_scores).map(([category, score]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm capitalize">{category.replace(/_/g, ' ')}</span>
                <Badge variant={score >= 80 ? "success" : score >= 60 ? "warning" : "destructive"}>
                  {score}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Improvement Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.improvement_areas.map((area, index) => (
              <div key={index} className="text-sm text-red-500">
                • {area}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Changes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.recent_changes.slice(0, 3).map((change, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{change.item}</div>
                <div className="text-gray-500">
                  {new Date(change.date).toLocaleDateString()} • {change.user}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
