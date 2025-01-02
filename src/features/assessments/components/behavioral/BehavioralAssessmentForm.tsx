import { useState } from 'react';
import { BehavioralAssessment } from '../../types/clinical.types';
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

interface BehavioralAssessmentFormProps {
  initialData?: BehavioralAssessment;
  onSave: (data: BehavioralAssessment) => void;
  onCancel: () => void;
}

const MOOD_OPTIONS = [
  'Calm',
  'Agitated',
  'Depressed',
  'Anxious',
  'Angry',
  'Happy',
  'Withdrawn',
];

const BEHAVIOR_TYPES = [
  'Aggression',
  'Wandering',
  'Resistance to Care',
  'Social Isolation',
  'Sleep Disturbance',
  'Repetitive Behaviors',
];

const FREQUENCY_OPTIONS = [
  'Multiple times per day',
  'Daily',
  'Several times per week',
  'Weekly',
  'Monthly',
  'Rarely',
];

export function BehavioralAssessmentForm({
  initialData,
  onSave,
  onCancel,
}: BehavioralAssessmentFormProps) {
  const [data, setData] = useState<BehavioralAssessment>(
    initialData || {
      mood: {
        current: '',
        triggers: [],
        interventions: [],
      },
      behaviors: [],
      crisisPlans: [],
    }
  );

  const addBehavior = () => {
    setData({
      ...data,
      behaviors: [
        ...data.behaviors,
        {
          type: '',
          frequency: '',
          intensity: 1,
          triggers: [],
          interventions: [],
        },
      ],
    });
  };

  const addCrisisPlan = () => {
    setData({
      ...data,
      crisisPlans: [
        ...data.crisisPlans,
        {
          trigger: '',
          earlyWarning: [],
          interventions: [],
          emergencyContacts: [],
        },
      ],
    });
  };

  const updateBehavior = (index: number, field: string, value: any) => {
    const newBehaviors = [...data.behaviors];
    newBehaviors[index] = { ...newBehaviors[index], [field]: value };
    setData({ ...data, behaviors: newBehaviors });
  };

  const updateCrisisPlan = (index: number, field: string, value: any) => {
    const newCrisisPlans = [...data.crisisPlans];
    newCrisisPlans[index] = { ...newCrisisPlans[index], [field]: value };
    setData({ ...data, crisisPlans: newCrisisPlans });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Mood Assessment</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Current Mood</Label>
              <Select
                value={data.mood.current}
                onValueChange={(value) =>
                  setData({
                    ...data,
                    mood: { ...data.mood, current: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((mood) => (
                    <SelectItem key={mood} value={mood}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Mood Triggers</Label>
              <Textarea
                value={data.mood.triggers.join(', ')}
                onChange={(e) =>
                  setData({
                    ...data,
                    mood: {
                      ...data.mood,
                      triggers: e.target.value.split(',').map((t) => t.trim()),
                    },
                  })
                }
                placeholder="Enter triggers, separated by commas"
              />
            </div>

            <div>
              <Label>Successful Interventions</Label>
              <Textarea
                value={data.mood.interventions.join(', ')}
                onChange={(e) =>
                  setData({
                    ...data,
                    mood: {
                      ...data.mood,
                      interventions: e.target.value.split(',').map((i) => i.trim()),
                    },
                  })
                }
                placeholder="Enter interventions, separated by commas"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Behavioral Tracking</h3>
        </CardHeader>
        <CardContent>
          {data.behaviors.map((behavior, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Behavior Type</Label>
                  <Select
                    value={behavior.type}
                    onValueChange={(value) => updateBehavior(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select behavior type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BEHAVIOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={behavior.frequency}
                    onValueChange={(value) =>
                      updateBehavior(index, 'frequency', value)
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
                  <Label>Intensity (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={behavior.intensity}
                    onChange={(e) =>
                      updateBehavior(index, 'intensity', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Triggers</Label>
                <Textarea
                  value={behavior.triggers.join(', ')}
                  onChange={(e) =>
                    updateBehavior(
                      index,
                      'triggers',
                      e.target.value.split(',').map((t) => t.trim())
                    )
                  }
                  placeholder="Enter triggers, separated by commas"
                />
              </div>

              <div className="mt-4">
                <Label>Interventions</Label>
                <Textarea
                  value={behavior.interventions.join(', ')}
                  onChange={(e) =>
                    updateBehavior(
                      index,
                      'interventions',
                      e.target.value.split(',').map((i) => i.trim())
                    )
                  }
                  placeholder="Enter interventions, separated by commas"
                />
              </div>
            </div>
          ))}

          <Button onClick={addBehavior} className="mt-4">
            Add Behavior
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Crisis Plans</h3>
        </CardHeader>
        <CardContent>
          {data.crisisPlans.map((plan, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <div>
                <Label>Crisis Trigger</Label>
                <Input
                  value={plan.trigger}
                  onChange={(e) =>
                    updateCrisisPlan(index, 'trigger', e.target.value)
                  }
                  placeholder="Describe the crisis trigger"
                />
              </div>

              <div className="mt-4">
                <Label>Early Warning Signs</Label>
                <Textarea
                  value={plan.earlyWarning.join(', ')}
                  onChange={(e) =>
                    updateCrisisPlan(
                      index,
                      'earlyWarning',
                      e.target.value.split(',').map((w) => w.trim())
                    )
                  }
                  placeholder="Enter early warning signs, separated by commas"
                />
              </div>

              <div className="mt-4">
                <Label>Crisis Interventions</Label>
                <Textarea
                  value={plan.interventions.join(', ')}
                  onChange={(e) =>
                    updateCrisisPlan(
                      index,
                      'interventions',
                      e.target.value.split(',').map((i) => i.trim())
                    )
                  }
                  placeholder="Enter interventions, separated by commas"
                />
              </div>

              <div className="mt-4">
                <Label>Emergency Contacts</Label>
                <Textarea
                  value={plan.emergencyContacts.join(', ')}
                  onChange={(e) =>
                    updateCrisisPlan(
                      index,
                      'emergencyContacts',
                      e.target.value.split(',').map((c) => c.trim())
                    )
                  }
                  placeholder="Enter emergency contacts, separated by commas"
                />
              </div>
            </div>
          ))}

          <Button onClick={addCrisisPlan} className="mt-4">
            Add Crisis Plan
          </Button>
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
