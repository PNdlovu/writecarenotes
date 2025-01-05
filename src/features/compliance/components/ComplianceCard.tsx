import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Progress } from "@/components/ui/Progress/Progress"
import { Badge } from "@/components/ui/Badge/Badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip"

interface ComplianceCardProps {
  title: string
  metrics: Record<string, number>
  thresholds: Record<string, number>
  evaluation: {
    score: number
    status: 'compliant' | 'warning' | 'non-compliant'
    details: string[]
  }
}

export function ComplianceCard({ title, metrics, thresholds, evaluation }: ComplianceCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'non-compliant':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Badge className={getStatusColor(evaluation.status)}>
          {evaluation.score}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mt-4 space-y-2">
          <Progress value={evaluation.score} className="h-2" />
          
          <div className="space-y-1">
            {Object.entries(metrics).map(([key, value]) => (
              <Tooltip key={key}>
                <TooltipTrigger className="flex items-center justify-between text-sm">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className={value >= (thresholds[key] || 0) ? 'text-green-600' : 'text-red-600'}>
                    {value}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Threshold: {thresholds[key]}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {evaluation.details.length > 0 && (
            <div className="mt-4 text-sm text-gray-500">
              <h4 className="font-semibold mb-1">Details:</h4>
              <ul className="list-disc list-inside space-y-1">
                {evaluation.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
