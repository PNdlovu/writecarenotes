import { BehavioralSupports } from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';

interface BehavioralSectionProps {
  data: BehavioralSupports;
  onChange: (data: BehavioralSupports) => void;
}

export function BehavioralSection({ data, onChange }: BehavioralSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Behavioral Supports</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Triggers</Label>
            <Alert className="mb-2">
              Identify situations, environments, or interactions that may cause distress
            </Alert>
            <Textarea
              value={data.triggers.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  triggers: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each trigger on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: Loud noises, Crowded spaces, Changes in routine, Specific sensory inputs
            </p>
          </div>

          <div>
            <Label>Calming Strategies</Label>
            <Alert className="mb-2">
              List effective methods for reducing anxiety or distress
            </Alert>
            <Textarea
              value={data.calmingStrategies.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  calmingStrategies: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each calming strategy on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: Deep breathing, Quiet space, Favorite activity, Sensory tools
            </p>
          </div>

          <div>
            <Label>Daily Routines</Label>
            <Alert className="mb-2">
              Document important routines that help maintain stability
            </Alert>
            <Textarea
              value={data.routines.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  routines: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each routine on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: Morning routine, Mealtime preferences, Transition strategies
            </p>
          </div>

          <div>
            <Label>Positive Reinforcements</Label>
            <Alert className="mb-2">
              List effective rewards and motivators
            </Alert>
            <Textarea
              value={data.reinforcements.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  reinforcements: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each reinforcement on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: Verbal praise, Preferred activities, Token systems, Special privileges
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
