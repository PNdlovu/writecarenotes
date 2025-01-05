import { useState } from 'react';
import { EndOfLifeCare } from '../../types/clinical.types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Slider } from '@/components/ui/Slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

interface EndOfLifeCareFormProps {
  initialData?: EndOfLifeCare;
  onSave: (data: EndOfLifeCare) => void;
  onCancel: () => void;
}

const EFFECTIVENESS_OPTIONS = [
  'Very Effective',
  'Moderately Effective',
  'Slightly Effective',
  'Not Effective',
];

export function EndOfLifeCareForm({
  initialData,
  onSave,
  onCancel,
}: EndOfLifeCareFormProps) {
  const [data, setData] = useState<EndOfLifeCare>(
    initialData || {
      palliativeCare: {
        preferences: [],
        directives: [],
        comfortMeasures: [],
      },
      painManagement: {
        level: 0,
        location: [],
        interventions: [],
        effectiveness: '',
      },
      symptomControl: {
        symptoms: [],
        interventions: [],
        effectiveness: '',
      },
    }
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Palliative Care Preferences</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Care Preferences</Label>
              <Textarea
                value={data.palliativeCare.preferences.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    palliativeCare: {
                      ...data.palliativeCare,
                      preferences: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each care preference on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Advanced Directives</Label>
              <Textarea
                value={data.palliativeCare.directives.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    palliativeCare: {
                      ...data.palliativeCare,
                      directives: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each directive on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Comfort Measures</Label>
              <Textarea
                value={data.palliativeCare.comfortMeasures.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    palliativeCare: {
                      ...data.palliativeCare,
                      comfortMeasures: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each comfort measure on a new line"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pain Management</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Pain Level (0-10)</Label>
              <Slider
                value={[data.painManagement.level]}
                onValueChange={([value]) =>
                  setData({
                    ...data,
                    painManagement: {
                      ...data.painManagement,
                      level: value,
                    },
                  })
                }
                max={10}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Pain Location</Label>
              <Textarea
                value={data.painManagement.location.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    painManagement: {
                      ...data.painManagement,
                      location: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each pain location on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Pain Interventions</Label>
              <Textarea
                value={data.painManagement.interventions.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    painManagement: {
                      ...data.painManagement,
                      interventions: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each intervention on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Intervention Effectiveness</Label>
              <Select
                value={data.painManagement.effectiveness}
                onValueChange={(value) =>
                  setData({
                    ...data,
                    painManagement: {
                      ...data.painManagement,
                      effectiveness: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select effectiveness" />
                </SelectTrigger>
                <SelectContent>
                  {EFFECTIVENESS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Symptom Control</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Current Symptoms</Label>
              <Textarea
                value={data.symptomControl.symptoms.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    symptomControl: {
                      ...data.symptomControl,
                      symptoms: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each symptom on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Symptom Interventions</Label>
              <Textarea
                value={data.symptomControl.interventions.join('\n')}
                onChange={(e) =>
                  setData({
                    ...data,
                    symptomControl: {
                      ...data.symptomControl,
                      interventions: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
                placeholder="Enter each intervention on a new line"
                rows={4}
              />
            </div>

            <div>
              <Label>Intervention Effectiveness</Label>
              <Select
                value={data.symptomControl.effectiveness}
                onValueChange={(value) =>
                  setData({
                    ...data,
                    symptomControl: {
                      ...data.symptomControl,
                      effectiveness: value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select effectiveness" />
                </SelectTrigger>
                <SelectContent>
                  {EFFECTIVENESS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
