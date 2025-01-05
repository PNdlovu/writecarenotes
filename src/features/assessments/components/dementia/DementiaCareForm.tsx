import { useState } from 'react';
import { DementiaCareAssessment } from '../../types/clinical.types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';

interface DementiaCareFormProps {
  initialData?: DementiaCareAssessment;
  onSave: (data: DementiaCareAssessment) => void;
  onCancel: () => void;
}

const RISK_LEVELS = ['High', 'Medium', 'Low'] as const;
const FREQUENCY_OPTIONS = [
  'Multiple times daily',
  'Daily',
  'Several times per week',
  'Weekly',
  'Rarely',
  'Never',
];

export function DementiaCareForm({
  initialData,
  onSave,
  onCancel,
}: DementiaCareFormProps) {
  const [data, setData] = useState<DementiaCareAssessment>(
    initialData || {
      cognitiveStatus: {
        orientation: 0,
        memory: 0,
        communication: 0,
        judgment: 0,
      },
      wanderingRisk: {
        riskLevel: 'Low',
        history: [],
        preventiveMeasures: [],
      },
      sundowning: {
        frequency: 'Never',
        symptoms: [],
        triggers: [],
        interventions: [],
      },
    }
  );

  const updateCognitiveScore = (field: keyof typeof data.cognitiveStatus, value: number) => {
    setData({
      ...data,
      cognitiveStatus: {
        ...data.cognitiveStatus,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Cognitive Assessment</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label>Orientation (0-10)</Label>
              <Slider
                value={[data.cognitiveStatus.orientation]}
                onValueChange={([value]) => updateCognitiveScore('orientation', value)}
                max={10}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Awareness of time, place, and person
              </p>
            </div>

            <div>
              <Label>Memory (0-10)</Label>
              <Slider
                value={[data.cognitiveStatus.memory]}
                onValueChange={([value]) => updateCognitiveScore('memory', value)}
                max={10}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Short-term and long-term memory function
              </p>
            </div>

            <div>
              <Label>Communication (0-10)</Label>
              <Slider
                value={[data.cognitiveStatus.communication]}
                onValueChange={([value]) => updateCognitiveScore('communication', value)}
                max={10}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Ability to express needs and understand others
              </p>
            </div>

            <div>
              <Label>Judgment (0-10)</Label>
              <Slider
                value={[data.cognitiveStatus.judgment]}
                onValueChange={([value]) => updateCognitiveScore('judgment', value)}
                max={10}
                step={1}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Decision-making ability and safety awareness
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Wandering Risk Assessment</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Risk Level</Label>
              <Select
                value={data.wanderingRisk.riskLevel}
                onValueChange={(value: typeof RISK_LEVELS[number]) =>
                  setData({
                    ...data,
                    wanderingRisk: {
                      ...data.wanderingRisk,
                      riskLevel: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Wandering History</Label>
              <Textarea
                value={data.wanderingRisk.history.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    wanderingRisk: {
                      ...data.wanderingRisk,
                      history: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each wandering incident on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Preventive Measures</Label>
              <Textarea
                value={data.wanderingRisk.preventiveMeasures.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    wanderingRisk: {
                      ...data.wanderingRisk,
                      preventiveMeasures: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each preventive measure on a new line"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Sundowning Assessment</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Frequency</Label>
              <Select
                value={data.sundowning.frequency}
                onValueChange={(value) =>
                  setData({
                    ...data,
                    sundowning: {
                      ...data.sundowning,
                      frequency: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <SelectItem key={freq} value={freq}>
                      {freq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Symptoms</Label>
              <Textarea
                value={data.sundowning.symptoms.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    sundowning: {
                      ...data.sundowning,
                      symptoms: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each symptom on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Triggers</Label>
              <Textarea
                value={data.sundowning.triggers.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    sundowning: {
                      ...data.sundowning,
                      triggers: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each trigger on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Interventions</Label>
              <Textarea
                value={data.sundowning.interventions.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    sundowning: {
                      ...data.sundowning,
                      interventions: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each intervention on a new line"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(data)}>Save Assessment</Button>
      </div>
    </div>
  );
}
