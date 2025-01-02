import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { Switch } from '@/components/ui/Switch';
import { Calendar } from '@/components/ui/Calendar';
import {
  CalendarIcon,
  Clock,
  Users,
  FileText,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { RecurringAssessmentConfig } from '../scheduling/RecurringAssessmentConfig';
import { Assessment, AssessmentType } from '../../types/assessment.types';
import { useAssessment } from '../../hooks/useAssessment';

interface AssessmentFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: number;
  participants: number;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
  attachments?: File[];
}

interface AssessmentFormProps {
  initialData?: Partial<AssessmentFormData>;
  onSubmit: (data: AssessmentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AssessmentForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: AssessmentFormProps) {
  const [formData, setFormData] = React.useState<AssessmentFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    date: initialData?.date || new Date(),
    time: initialData?.time || '09:00',
    duration: initialData?.duration || 60,
    participants: initialData?.participants || 1,
    isRecurring: initialData?.isRecurring || false,
    recurringPattern: initialData?.recurringPattern,
    attachments: [],
  });

  const [showCalendar, setShowCalendar] = React.useState(false);

  const handleInputChange = (
    field: keyof AssessmentFormData,
    value: string | number | boolean | Date
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRecurringPatternChange = (pattern: AssessmentFormData['recurringPattern']) => {
    setFormData((prev) => ({
      ...prev,
      recurringPattern: pattern,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData((prev) => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...files],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assessment Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter assessment title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter assessment description"
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowCalendar(!showCalendar)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, 'PPP')}
                </Button>
                {showCalendar && (
                  <div className="absolute z-50 mt-2 bg-background border rounded-md shadow-lg">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => {
                        date && handleInputChange('date', date);
                        setShowCalendar(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) =>
                  handleInputChange('duration', parseInt(e.target.value))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participants">Number of Participants</Label>
              <Input
                id="participants"
                type="number"
                min="1"
                value={formData.participants}
                onChange={(e) =>
                  handleInputChange('participants', parseInt(e.target.value))
                }
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) =>
                handleInputChange('isRecurring', checked)
              }
            />
            <Label htmlFor="recurring">Recurring Assessment</Label>
          </div>

          {formData.isRecurring && (
            <RecurringAssessmentConfig
              initialPattern={formData.recurringPattern}
              onConfigChange={handleRecurringPatternChange}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <Input
              id="attachments"
              type="file"
              onChange={handleFileChange}
              multiple
              className="cursor-pointer"
            />
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Update' : 'Create'} Assessment
        </Button>
      </div>
    </form>
  );
}


