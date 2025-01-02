/**
 * @writecarenotes.com
 * @fileoverview Visit scheduler component for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Interactive visit scheduler component that integrates with the visit service
 * and provides a calendar interface for managing domiciliary care visits.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar } from '@/components/ui/Calendar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage 
} from '@/components/ui/Form/Form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Form/Select';
import { StaffSelect } from '@/components/staff/StaffSelect';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { VisitService } from '../../services';
import type { Visit } from '../../types';

interface VisitSchedulerProps {
  clientId: string;
  carePlanId: string;
  onVisitScheduled?: (visit: Visit) => void;
}

interface VisitFormData {
  date: Date;
  duration: string;
  staffAssigned: string[];
}

export const VisitScheduler = ({
  clientId,
  carePlanId,
  onVisitScheduled
}: VisitSchedulerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<VisitFormData>({
    defaultValues: {
      date: new Date(),
      duration: '60',
      staffAssigned: []
    }
  });

  const onSubmit = async (data: VisitFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const visit = await VisitService.getInstance().scheduleVisit({
        clientId,
        carePlanId,
        scheduledTime: data.date,
        duration: parseInt(data.duration, 10),
        staffAssigned: data.staffAssigned,
        tasks: [], // Would be populated from care plan
        status: { status: 'SCHEDULED' },
        location: { latitude: 0, longitude: 0 } // Would be populated from client address
      });

      onVisitScheduled?.(visit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule visit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Visit</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Calendar
                      selected={field.value}
                      onSelect={field.onChange}
                      mode="single"
                      className="rounded-md border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="staffAssigned"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Staff</FormLabel>
                  <FormControl>
                    <StaffSelect
                      selected={field.value}
                      onSelect={field.onChange}
                      multiple
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Schedule Visit
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}; 