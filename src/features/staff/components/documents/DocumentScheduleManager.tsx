import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/Dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { Input } from '@/components/ui/Input/Input';
import { Calendar } from '@/components/ui/Calendar';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';

const scheduleFormSchema = z.object({
  reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL']),
  expirationDate: z.date().optional(),
  warningDays: z.number().min(1).optional(),
  reviewers: z.array(z.string()).min(1, 'At least one reviewer is required'),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface DocumentScheduleManagerProps {
  documentId: string;
  documentType: string;
  staffId: string;
}

export function DocumentScheduleManager({
  documentId,
  documentType,
  staffId,
}: DocumentScheduleManagerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      reviewFrequency: 'QUARTERLY',
      warningDays: 30,
      reviewers: [],
    },
  });

  // Fetch available reviewers based on document type
  const { data: availableReviewers, isLoading: loadingReviewers } = useQuery({
    queryKey: ['reviewers', documentType],
    queryFn: async () => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/reviewers?type=${documentType}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch reviewers');
      }
      return response.json();
    },
  });

  // Fetch current schedule
  const { data: currentSchedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ['schedule', documentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}/schedule`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      return response.json();
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}/schedule`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', documentId] });
      setIsOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: ScheduleFormValues) => {
    updateSchedule.mutate(data);
  };

  if (loadingSchedule || loadingReviewers) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Document Schedule</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Update Schedule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Document Schedule</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="reviewFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                          <SelectItem value="SEMI_ANNUAL">Semi-Annual</SelectItem>
                          <SelectItem value="ANNUAL">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expirationDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiration Date (Optional)</FormLabel>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warningDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warning Days Before Expiration</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviewers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reviewers</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange([...field.value, value])
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reviewers" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableReviewers?.map((reviewer: any) => (
                            <SelectItem key={reviewer.id} value={reviewer.id}>
                              {reviewer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {field.value.map((reviewerId) => {
                          const reviewer = availableReviewers?.find(
                            (r: any) => r.id === reviewerId
                          );
                          return (
                            <Badge
                              key={reviewerId}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {reviewer?.name}
                              <button
                                type="button"
                                onClick={() =>
                                  field.onChange(
                                    field.value.filter((id) => id !== reviewerId)
                                  )
                                }
                                className="ml-1"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateSchedule.isPending}>
                    {updateSchedule.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Save Schedule
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {currentSchedule && (
        <div className="grid gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Current Schedule</h4>
            <div className="space-y-2">
              <p className="text-sm">
                Review Frequency:{' '}
                <span className="font-medium">
                  {currentSchedule.reviewFrequency.toLowerCase()}
                </span>
              </p>
              {currentSchedule.nextReviewDate && (
                <p className="text-sm">
                  Next Review:{' '}
                  <span className="font-medium">
                    {format(
                      new Date(currentSchedule.nextReviewDate),
                      'MMM d, yyyy'
                    )}
                  </span>
                </p>
              )}
              {currentSchedule.expirationDate && (
                <p className="text-sm">
                  Expires:{' '}
                  <span className="font-medium">
                    {format(
                      new Date(currentSchedule.expirationDate),
                      'MMM d, yyyy'
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Reviewers</h4>
            <div className="flex flex-wrap gap-2">
              {currentSchedule.reviewers.map((reviewer: any) => (
                <Badge key={reviewer.id} variant="secondary">
                  {reviewer.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


