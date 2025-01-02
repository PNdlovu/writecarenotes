import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button/Button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { useQuery } from '@tanstack/react-query';
import { TrashIcon } from '@heroicons/react/24/outline';

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  steps: z.array(
    z.object({
      userId: z.string().min(1, 'Approver is required'),
      role: z.string().min(1, 'Role is required'),
    })
  ).min(1, 'At least one step is required'),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowFormProps {
  initialData?: WorkflowFormData;
  onSubmit: (data: WorkflowFormData) => void;
}

export function WorkflowForm({ initialData, onSubmit }: WorkflowFormProps) {
  const form = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      steps: [{ userId: '', role: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  // Fetch users who can be approvers (staff members)
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users?role=staff');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workflow Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter workflow name" {...field} />
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
                <Textarea
                  placeholder="Enter workflow description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <FormLabel>Approval Steps</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ userId: '', role: '' })}
            >
              Add Step
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 space-y-4">
                <FormField
                  control={form.control}
                  name={`steps.${index}.userId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approver</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select approver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users?.map((user: any) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
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
                  name={`steps.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REVIEWER">Reviewer</SelectItem>
                          <SelectItem value="APPROVER">Approver</SelectItem>
                          <SelectItem value="FINAL_APPROVER">
                            Final Approver
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-8"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit">Save Workflow</Button>
        </div>
      </form>
    </Form>
  );
}


