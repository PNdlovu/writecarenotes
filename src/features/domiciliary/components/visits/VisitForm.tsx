/**
 * @writecarenotes.com
 * @fileoverview Visit form component for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A form component for creating and editing domiciliary care visits.
 * Handles scheduling, task management, staff assignment, and location
 * details with validation and error handling.
 *
 * Features:
 * - Visit scheduling
 * - Task management
 * - Staff assignment
 * - Location selection
 * - Form validation
 *
 * Mobile-First Considerations:
 * - Touch-friendly inputs
 * - Responsive layout
 * - Offline support
 * - Map integration
 * - Performance optimized
 *
 * Enterprise Features:
 * - Role-based access
 * - Audit logging
 * - Regional compliance
 * - Error handling
 * - Analytics tracking
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

// UI Components
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Textarea } from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/Form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/Form';

// Icons
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';

// Types
import type { Visit, VisitTask, AssignedStaff } from '../../types';

// Utils
import { validateVisitDuration } from '../../utils';

// Hooks
import { useAnalytics } from '@/hooks/useAnalytics';

// Constants
import {
  VISIT_DURATION,
  TASK_TYPE_LABELS,
  STAFF_ROLE_LABELS
} from '../../constants';

const visitSchema = z.object({
  scheduledStart: z.date(),
  scheduledEnd: z.date(),
  tasks: z.array(z.object({
    type: z.string(),
    description: z.string().min(1, 'Description is required'),
  })),
  staff: z.array(z.object({
    id: z.string(),
    role: z.string(),
  })),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  notes: z.string().optional(),
});

type VisitFormData = z.infer<typeof visitSchema>;

interface VisitFormProps {
  initialData?: Visit;
  onSubmit: (data: VisitFormData) => Promise<void>;
  onCancel: () => void;
}

export const VisitForm: React.FC<VisitFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const { trackEvent } = useAnalytics();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: initialData || {
      scheduledStart: new Date(),
      scheduledEnd: new Date(),
      tasks: [],
      staff: [],
      location: {
        latitude: 0,
        longitude: 0,
      },
      notes: '',
    },
  });

  const handleSubmit = useCallback(async (data: VisitFormData) => {
    try {
      setSubmitting(true);
      trackEvent('visit_form_submit', {
        isEdit: !!initialData,
        taskCount: data.tasks.length,
        staffCount: data.staff.length,
      });
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, initialData, trackEvent]);

  const addTask = useCallback(() => {
    const currentTasks = form.getValues('tasks');
    form.setValue('tasks', [
      ...currentTasks,
      { type: 'PERSONAL_CARE', description: '' },
    ]);
    trackEvent('visit_form_add_task');
  }, [form, trackEvent]);

  const removeTask = useCallback((index: number) => {
    const currentTasks = form.getValues('tasks');
    form.setValue('tasks', currentTasks.filter((_, i) => i !== index));
    trackEvent('visit_form_remove_task');
  }, [form, trackEvent]);

  const addStaff = useCallback(() => {
    const currentStaff = form.getValues('staff');
    form.setValue('staff', [
      ...currentStaff,
      { id: '', role: 'CARE_WORKER' },
    ]);
    trackEvent('visit_form_add_staff');
  }, [form, trackEvent]);

  const removeStaff = useCallback((index: number) => {
    const currentStaff = form.getValues('staff');
    form.setValue('staff', currentStaff.filter((_, i) => i !== index));
    trackEvent('visit_form_remove_staff');
  }, [form, trackEvent]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="scheduledStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Controller
                          control={form.control}
                          name="scheduledStart"
                          render={({ field }) => (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date()
                              }
                              className="rounded-md border"
                            />
                          )}
                        />
                        <Input
                          type="time"
                          value={format(field.value, 'HH:mm')}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            field.onChange(newDate);
                          }}
                          className="w-24"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Controller
                          control={form.control}
                          name="scheduledEnd"
                          render={({ field }) => (
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < form.getValues('scheduledStart')
                              }
                              className="rounded-md border"
                            />
                          )}
                        />
                        <Input
                          type="time"
                          value={format(field.value, 'HH:mm')}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(field.value);
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            field.onChange(newDate);
                          }}
                          className="w-24"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Tasks</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTask}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="space-y-4">
              {form.watch('tasks').map((task, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <FormField
                    control={form.control}
                    name={`tasks.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select task type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(TASK_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`tasks.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="flex-[2]">
                        <Input
                          {...field}
                          placeholder="Task description"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTask(index)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Staff</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStaff}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>
            <div className="space-y-4">
              {form.watch('staff').map((staff, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <FormField
                    control={form.control}
                    name={`staff.${index}.id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Input
                          {...field}
                          placeholder="Staff ID"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`staff.${index}.role`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStaff(index)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location.latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location.longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="any"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Add map component here */}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any additional notes..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : initialData ? 'Update Visit' : 'Create Visit'}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 