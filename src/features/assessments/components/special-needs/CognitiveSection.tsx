import { CognitiveNeeds } from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

interface CognitiveSectionProps {
  data: CognitiveNeeds;
  onChange: (data: CognitiveNeeds) => void;
}

const COMPREHENSION_LEVELS = [
  'Advanced',
  'Intermediate',
  'Basic',
  'Limited',
  'Needs Full Support',
] as const;

const LEARNING_STYLES = [
  'Visual',
  'Auditory',
  'Kinesthetic',
  'Reading/Writing',
  'Multimodal',
] as const;

export function CognitiveSection({ data, onChange }: CognitiveSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Cognitive Needs</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Comprehension Level</Label>
            <Select
              value={data.comprehensionLevel}
              onValueChange={(value) =>
                onChange({ ...data, comprehensionLevel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select comprehension level" />
              </SelectTrigger>
              <SelectContent>
                {COMPREHENSION_LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Memory Supports</Label>
            <Textarea
              value={data.memorySupports.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  memorySupports: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each memory support strategy on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: Visual reminders, Written instructions, Memory aids, Routine charts
            </p>
          </div>

          <div>
            <Label>Learning Style</Label>
            <Select
              value={data.learningStyle}
              onValueChange={(value) =>
                onChange({ ...data, learningStyle: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select learning style" />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Learning Adaptations</Label>
            <Textarea
              value={data.adaptations.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  adaptations: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each learning adaptation on a new line"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              Examples: Break tasks into smaller steps, Use visual aids, Provide extra time, Use repetition
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
