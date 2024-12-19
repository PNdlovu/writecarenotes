import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { addMonths } from 'date-fns';

interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  endDate?: Date;
}

interface RecurringAssessmentConfigProps {
  initialPattern?: RecurringPattern;
  onConfigChange: (pattern: RecurringPattern) => void;
}

export function RecurringAssessmentConfig({
  initialPattern,
  onConfigChange,
}: RecurringAssessmentConfigProps) {
  const [pattern, setPattern] = useState<RecurringPattern>(() => ({
    frequency: initialPattern?.frequency || 'weekly',
    interval: initialPattern?.interval || 1,
    endDate: initialPattern?.endDate || addMonths(new Date(), 3),
  }));

  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    onConfigChange(pattern);
  }, [pattern, onConfigChange]);

  const handleFrequencyChange = (value: 'daily' | 'weekly' | 'monthly') => {
    setPattern((prev) => ({
      ...prev,
      frequency: value,
      // Reset interval to 1 when changing frequency to prevent invalid configurations
      interval: 1,
    }));
  };

  const handleIntervalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (value > 0) {
      setPattern((prev) => ({
        ...prev,
        interval: value,
      }));
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setPattern((prev) => ({
      ...prev,
      endDate: date,
    }));
    setShowEndDatePicker(false);
  };

  const getFrequencyLabel = () => {
    switch (pattern.frequency) {
      case 'daily':
        return pattern.interval === 1 ? 'day' : 'days';
      case 'weekly':
        return pattern.interval === 1 ? 'week' : 'weeks';
      case 'monthly':
        return pattern.interval === 1 ? 'month' : 'months';
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Repeat Every</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min="1"
            value={pattern.interval}
            onChange={handleIntervalChange}
            className="w-20"
          />
          <Select
            value={pattern.frequency}
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Days</SelectItem>
              <SelectItem value="weekly">Weeks</SelectItem>
              <SelectItem value="monthly">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>End Date</Label>
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowEndDatePicker(!showEndDatePicker)}
            className="w-full justify-start text-left font-normal"
          >
            {pattern.endDate
              ? pattern.endDate.toLocaleDateString()
              : 'Select end date'}
          </Button>
          {showEndDatePicker && (
            <div className="absolute z-50 mt-2 bg-background border rounded-md shadow-lg">
              <Calendar
                mode="single"
                selected={pattern.endDate}
                onSelect={handleEndDateChange}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 text-sm text-muted-foreground">
        This assessment will repeat every {pattern.interval} {getFrequencyLabel()}{' '}
        until {pattern.endDate?.toLocaleDateString()}
      </div>
    </div>
  );
}


