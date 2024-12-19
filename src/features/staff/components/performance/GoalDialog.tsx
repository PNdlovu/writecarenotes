import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { GoalStatus } from '@/features/staff/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['PROFESSIONAL', 'PERSONAL', 'ORGANIZATIONAL']),
  status: z.nativeEnum(GoalStatus),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  startDate: z.string(),
  targetDate: z.string(),
  metrics: z.array(z.object({
    name: z.string(),
    target: z.number(),
    current: z.number(),
    unit: z.string(),
  })).optional(),
  milestones: z.array(z.object({
    title: z.string(),
    dueDate: z.string(),
    status: z.nativeEnum(GoalStatus),
  })).optional(),
  notes: z.string().optional(),
});

interface GoalDialogProps {
  staffId: string;
  goal?: any;
  trigger?: React.ReactNode;
}

const GoalDialog: React.FC<GoalDialogProps> = ({ staffId, goal, trigger }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: goal || {
      title: '',
      description: '',
      category: 'PROFESSIONAL',
      status: GoalStatus.NOT_STARTED,
      priority: 'MEDIUM',
      startDate: new Date().toISOString().split('T')[0],
      targetDate: new Date().toISOString().split('T')[0],
      metrics: [],
      milestones: [],
      notes: '',
    },
  });

  const { fields: metricFields, append: appendMetric, remove: removeMetric } = 
    useFieldArray({
      control: form.control,
      name: 'metrics',
    });

  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = 
    useFieldArray({
      control: form.control,
      name: 'milestones',
    });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof goalSchema>) => {
      const response = await fetch(`/api/staff/${staffId}/performance/goals${goal ? `/${goal.id}` : ''}`, {
        method: goal ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceGoals', staffId] });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof goalSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">New Goal</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit' : 'New'} Performance Goal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                        <SelectItem value="PERSONAL">Personal</SelectItem>
                        <SelectItem value="ORGANIZATIONAL">Organizational</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Metrics</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendMetric({ name: '', target: 0, current: 0, unit: '' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Metric
                </Button>
              </div>
              {metricFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Metric name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.target`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Target"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`metrics.${index}.unit`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Unit" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetric(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Milestones</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendMilestone({
                    title: '',
                    dueDate: new Date().toISOString().split('T')[0],
                    status: GoalStatus.NOT_STARTED,
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </div>
              {milestoneFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Milestone title" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`milestones.${index}.dueDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name={`milestones.${index}.status`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(GoalStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMilestone(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDialog;


