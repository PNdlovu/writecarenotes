import { SensoryNeeds } from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

interface SensorySectionProps {
  data: SensoryNeeds;
  onChange: (data: SensoryNeeds) => void;
}

export function SensorySection({ data, onChange }: SensorySectionProps) {
  const updateVisual = (field: keyof SensoryNeeds['visual'], value: string[]) => {
    onChange({
      ...data,
      visual: {
        ...data.visual,
        [field]: value,
      },
    });
  };

  const updateAuditory = (field: keyof SensoryNeeds['auditory'], value: string[]) => {
    onChange({
      ...data,
      auditory: {
        ...data.auditory,
        [field]: value,
      },
    });
  };

  const updateTactile = (field: keyof SensoryNeeds['tactile'], value: string[]) => {
    onChange({
      ...data,
      tactile: {
        ...data.tactile,
        [field]: value,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Sensory Needs</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Visual Needs</h4>
            <div>
              <Label>Visual Impairments</Label>
              <Textarea
                value={data.visual.impairments.join('\n')}
                onChange={(e) =>
                  updateVisual('impairments', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each visual impairment on a new line"
                rows={3}
              />
            </div>
            <div>
              <Label>Visual Aids</Label>
              <Textarea
                value={data.visual.aids.join('\n')}
                onChange={(e) =>
                  updateVisual('aids', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each visual aid on a new line"
                rows={3}
              />
            </div>
            <div>
              <Label>Visual Accommodations</Label>
              <Textarea
                value={data.visual.accommodations.join('\n')}
                onChange={(e) =>
                  updateVisual('accommodations', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each visual accommodation on a new line"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Auditory Needs</h4>
            <div>
              <Label>Auditory Impairments</Label>
              <Textarea
                value={data.auditory.impairments.join('\n')}
                onChange={(e) =>
                  updateAuditory('impairments', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each auditory impairment on a new line"
                rows={3}
              />
            </div>
            <div>
              <Label>Auditory Aids</Label>
              <Textarea
                value={data.auditory.aids.join('\n')}
                onChange={(e) =>
                  updateAuditory('aids', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each auditory aid on a new line"
                rows={3}
              />
            </div>
            <div>
              <Label>Auditory Accommodations</Label>
              <Textarea
                value={data.auditory.accommodations.join('\n')}
                onChange={(e) =>
                  updateAuditory('accommodations', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each auditory accommodation on a new line"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Tactile Needs</h4>
            <div>
              <Label>Tactile Sensitivities</Label>
              <Textarea
                value={data.tactile.sensitivities.join('\n')}
                onChange={(e) =>
                  updateTactile('sensitivities', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each tactile sensitivity on a new line"
                rows={3}
              />
            </div>
            <div>
              <Label>Tactile Preferences</Label>
              <Textarea
                value={data.tactile.preferences.join('\n')}
                onChange={(e) =>
                  updateTactile('preferences', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each tactile preference on a new line"
                rows={3}
              />
            </div>
            <div>
              <Label>Tactile Accommodations</Label>
              <Textarea
                value={data.tactile.accommodations.join('\n')}
                onChange={(e) =>
                  updateTactile('accommodations', e.target.value.split('\n').filter(Boolean))
                }
                placeholder="Enter each tactile accommodation on a new line"
                rows={3}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
