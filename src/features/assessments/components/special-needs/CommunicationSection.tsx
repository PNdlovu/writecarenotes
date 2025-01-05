import { CommunicationNeeds } from './types';
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

interface CommunicationSectionProps {
  data: CommunicationNeeds;
  onChange: (data: CommunicationNeeds) => void;
}

const COMMUNICATION_METHODS = [
  'Verbal',
  'Sign Language',
  'Picture Exchange',
  'Augmentative and Alternative Communication (AAC)',
  'Written',
  'Gestures',
  'Other',
] as const;

export function CommunicationSection({ data, onChange }: CommunicationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Communication Needs</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Primary Communication Method</Label>
            <Select
              value={data.primaryMethod}
              onValueChange={(value) =>
                onChange({ ...data, primaryMethod: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select primary method" />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alternative Communication Methods</Label>
            <Textarea
              value={data.alternativeMethods.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  alternativeMethods: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each alternative method on a new line"
              rows={4}
            />
          </div>

          <div>
            <Label>Assistive Technology</Label>
            <Textarea
              value={data.assistiveTechnology.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  assistiveTechnology: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each assistive technology on a new line"
              rows={4}
            />
          </div>

          <div>
            <Label>Communication Preferences</Label>
            <Textarea
              value={data.communicationPreferences.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  communicationPreferences: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each communication preference on a new line"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
