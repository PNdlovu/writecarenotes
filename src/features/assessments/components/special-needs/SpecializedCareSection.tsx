import { SpecializedCare } from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';

interface SpecializedCareSectionProps {
  data: SpecializedCare;
  onChange: (data: SpecializedCare) => void;
}

export function SpecializedCareSection({
  data,
  onChange,
}: SpecializedCareSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Specialized Care Requirements</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label>Medical Procedures</Label>
            <Alert className="mb-2" variant="warning">
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                List all medical procedures that require special training or certification
              </AlertDescription>
            </Alert>
            <Textarea
              value={data.medicalProcedures.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  medicalProcedures: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each medical procedure on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Include procedure name, frequency, and any specific requirements
            </p>
          </div>

          <div>
            <Label>Equipment Needs</Label>
            <Alert className="mb-2">
              <AlertTitle>Equipment Details</AlertTitle>
              <AlertDescription>
                Specify all medical equipment and assistive devices required
              </AlertDescription>
            </Alert>
            <Textarea
              value={data.equipmentNeeds.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  equipmentNeeds: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each piece of equipment on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Include equipment name, maintenance requirements, and backup procedures
            </p>
          </div>

          <div>
            <Label>Dietary Requirements</Label>
            <Alert className="mb-2">
              <AlertTitle>Dietary Specifications</AlertTitle>
              <AlertDescription>
                Document all dietary restrictions, requirements, and preferences
              </AlertDescription>
            </Alert>
            <Textarea
              value={data.dietaryRequirements.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  dietaryRequirements: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each dietary requirement on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Include allergies, restrictions, texture modifications, and feeding protocols
            </p>
          </div>

          <div>
            <Label>Emergency Protocols</Label>
            <Alert className="mb-2" variant="destructive">
              <AlertTitle>Critical Information</AlertTitle>
              <AlertDescription>
                Detail specific emergency procedures and responses
              </AlertDescription>
            </Alert>
            <Textarea
              value={data.emergencyProtocols.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  emergencyProtocols: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each emergency protocol on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Include emergency contacts, specific response procedures, and contraindications
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
