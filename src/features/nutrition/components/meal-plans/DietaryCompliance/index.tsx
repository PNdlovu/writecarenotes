import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { nutritionalAnalysisService } from '@/features/nutrition/services/nutritional-analysis-service'
import { Alert } from '@/components/ui/Alert'
import { Progress } from '@/components/ui/Progress'

interface DietaryComplianceProps {
  mealPlanId: string
  recommendations: string[]
}

export const DietaryCompliance: React.FC<DietaryComplianceProps> = ({
  mealPlanId,
  recommendations
}) => {
  const { data: complianceCheck } = useQuery({
    queryKey: ['dietaryCompliance', mealPlanId],
    queryFn: () => 
      nutritionalAnalysisService.checkDietaryCompliance(
        mealPlanId,
        new Date()
      )
  })

  const { data: nutrientAnalysis } = useQuery({
    queryKey: ['nutrientAnalysis', mealPlanId],
    queryFn: () => 
      nutritionalAnalysisService.analyzeNutrients(
        mealPlanId,
        new Date()
      )
  })

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Compliance Status</h3>
        <Alert
          variant={complianceCheck ? 'success' : 'warning'}
          className="mb-4"
        >
          {complianceCheck
            ? 'Current meal plan is compliant with dietary requirements'
            : 'Some dietary requirements may not be met'}
        </Alert>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Nutrient Analysis</h3>
        <div className="space-y-4">
          {nutrientAnalysis?.map(analysis => (
            <div key={analysis.type} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {analysis.type}
                </span>
                <span className="text-sm text-gray-600">
                  {analysis.current}/{analysis.target} {analysis.unit}
                </span>
              </div>
              <Progress
                value={(analysis.current / analysis.target) * 100}
                variant={
                  analysis.status === 'ON_TARGET'
                    ? 'default'
                    : analysis.status === 'BELOW_TARGET'
                    ? 'warning'
                    : 'error'
                }
              />
            </div>
          ))}
        </div>
      </div>

      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="text-blue-500">•</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
