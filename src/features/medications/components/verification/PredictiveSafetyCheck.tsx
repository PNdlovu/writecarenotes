import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert/Alert";
import { Progress } from "@/components/ui/Progress/Progress";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface PredictiveSafetyCheckProps {
  residentId: string;
  medicationId: string;
  staffId: string;
  onAnalysisComplete: () => void;
}

export function PredictiveSafetyCheck({
  residentId,
  medicationId,
  staffId,
  onAnalysisComplete
}: PredictiveSafetyCheckProps) {
  // This would be replaced with actual API calls and state management
  const safetyScore = 85;
  const warnings = [
    {
      type: 'moderate',
      message: 'Similar medication administered 4 hours ago'
    },
    {
      type: 'low',
      message: 'Slight deviation from usual administration time'
    }
  ];
  const recommendations = [
    'Double-check dosage against prescription',
    'Verify last administration time',
    'Monitor for potential side effects'
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Predictive Safety Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Safety Score</h3>
              <span className="text-sm font-medium">{safetyScore}%</span>
            </div>
            <Progress value={safetyScore} className="h-2" />
          </div>

          <div className="space-y-4">
            {warnings.map((warning, index) => (
              <Alert key={index} variant={warning.type === 'moderate' ? 'warning' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="font-medium">
                  {warning.type === 'moderate' ? 'Warning' : 'Notice'}
                </AlertTitle>
                <AlertDescription>{warning.message}</AlertDescription>
              </Alert>
            ))}
          </div>

          <div>
            <h3 className="font-medium mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
