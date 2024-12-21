import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface Step {
  title: string;
  description: string;
  status: 'complete' | 'current' | 'pending' | 'error';
}

export function SafetyVerification() {
  const steps: Step[] = [
    {
      title: 'Patient Identification',
      description: 'Verify patient identity using two identifiers',
      status: 'complete'
    },
    {
      title: 'Medication Check',
      description: 'Confirm medication details and dosage',
      status: 'current'
    },
    {
      title: 'Allergy Verification',
      description: 'Check for any known allergies or contraindications',
      status: 'pending'
    },
    {
      title: 'Administration Time',
      description: 'Verify correct timing for medication',
      status: 'pending'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Safety Verification</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Complete all safety checks before administering medication
            </AlertDescription>
          </Alert>

          <div className="relative">
            {steps.map((step, index) => (
              <div key={step.title} className="mb-8 last:mb-0">
                <div className="flex items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border">
                    {step.status === 'complete' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {step.status === 'current' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                    {step.status === 'error' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {step.status === 'pending' && (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute h-[calc(100%-32px)] w-px bg-gray-200 left-4 top-8" />
                  )}
                  <div className="ml-4">
                    <h3 className="font-medium leading-none">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <Button variant="outline">Back</Button>
            <Button>Continue</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
