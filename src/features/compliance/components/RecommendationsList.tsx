import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert"
import { InfoIcon, AlertTriangleIcon, AlertCircleIcon } from "lucide-react"

interface Recommendation {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: string
  dueDate?: string
}

interface RecommendationsListProps {
  recommendations: Recommendation[]
}

export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircleIcon className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <InfoIcon className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50'
      case 'low':
        return 'border-blue-200 bg-blue-50'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation) => (
        <Alert key={recommendation.id} className={getPriorityClass(recommendation.priority)}>
          <div className="flex items-start">
            {getPriorityIcon(recommendation.priority)}
            <div className="ml-3 flex-1">
              <AlertTitle className="text-sm font-medium">
                {recommendation.title}
              </AlertTitle>
              <AlertDescription className="mt-1 text-sm">
                {recommendation.description}
              </AlertDescription>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span className="capitalize">{recommendation.category}</span>
                {recommendation.dueDate && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Due by: {recommendation.dueDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  )
}
