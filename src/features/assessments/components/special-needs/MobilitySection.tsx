import { MobilityNeeds } from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

interface MobilitySectionProps {
  data: MobilityNeeds;
  onChange: (data: MobilityNeeds) => void;
}

const TRANSFER_ASSISTANCE_LEVELS = [
  'Independent',
  'Minimal Assistance',
  'Moderate Assistance',
  'Maximum Assistance',
  'Total Assistance',
] as const;

export function MobilitySection({ data, onChange }: MobilitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Mobility Needs</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Mobility Aids</Label>
            <Textarea
              value={data.mobilityAids.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  mobilityAids: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each mobility aid on a new line"
              rows={4}
            />
          </div>

          <div>
            <Label>Transfer Assistance Level</Label>
            <Select
              value={data.transferAssistance}
              onValueChange={(value) =>
                onChange({ ...data, transferAssistance: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assistance level" />
              </SelectTrigger>
              <SelectContent>
                {TRANSFER_ASSISTANCE_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Environmental Modifications</Label>
            <Textarea
              value={data.environmentalModifications.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  environmentalModifications: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each modification on a new line"
              rows={4}
            />
          </div>

          <div>
            <Label>Safety Considerations</Label>
            <Textarea
              value={data.safetyConsiderations.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  safetyConsiderations: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each safety consideration on a new line"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
