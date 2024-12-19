import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const incidentSchema = z.object({
  type: z.enum(['DISCIPLINARY', 'RECOGNITION', 'OBSERVATION']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  date: z.string(),
  description: z.string().min(1),
  witnesses: z.array(z.string()).optional(),
  actions: z.array(z.object({
    type: z.enum(['WARNING', 'SUSPENSION', 'TRAINING', 'RECOGNITION', 'OTHER']),
    description: z.string(),
    dueDate: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  })).optional(),
  followUp: z.object({
    date: z.string(),
    notes: z.string(),
    outcome: z.string(),
  }).optional(),
  status: z.enum(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED']),
  resolution: z.string().optional(),
  notes: z.string().optional(),
});

interface IncidentDialogProps {
  staffId: string;
  incident?: any;
  trigger?: React.ReactNode;
}

const IncidentDialog: React.FC<IncidentDialogProps> = ({
  staffId,
  incident,
  trigger,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(incidentSchema),
    defaultValues: incident || {
      type: 'OBSERVATION',
      date: new Date().toISOString().split('T')[0],
      description: '',
      witnesses: [],
      actions: [],
      status: 'OPEN',
      notes: '',
    },
  });

  const { fields: actionFields, append: appendAction, remove: removeAction } = 
    useFieldArray({
      control: form.control,
      name: 'actions',
    });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof incidentSchema>) => {
      const formData = new FormData();
      formData.append('data', JSON.stringify(data));
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch(
        `/api/staff/${staffId}/performance/incidents${incident ? `/${incident.id}` : ''}`,
        {
          method: incident ? 'PUT' : 'POST',
          body: formData,
        }
      );
      if (!response.ok) throw new Error('Failed to save incident');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performanceIncidents', staffId] });
      setOpen(false);
      form.reset();
      setFiles([]);
    },
  });

  const onSubmit = (data: z.infer<typeof incidentSchema>) => {
    mutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">New Incident</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{incident ? 'Edit' : 'New'} Performance Incident</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DISCIPLINARY">Disciplinary</SelectItem>
                        <SelectItem value="RECOGNITION">Recognition</SelectItem>
                        <SelectItem value="OBSERVATION">Observation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('type') === 'DISCIPLINARY' && (
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Actions</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendAction({
                    type: 'WARNING',
                    description: '',
                    status: 'PENDING',
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Action
                </Button>
              </div>
              {actionFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`actions.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Action type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="WARNING">Warning</SelectItem>
                            <SelectItem value="SUSPENSION">Suspension</SelectItem>
                            <SelectItem value="TRAINING">Training</SelectItem>
                            <SelectItem value="RECOGNITION">Recognition</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`actions.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Description" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name={`actions.${index}.status`}
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
                              <SelectItem value="PENDING">Pending</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="COMPLETED">Completed</SelectItem>
                              <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAction(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(form.watch('status') === 'RESOLVED' || form.watch('status') === 'CLOSED') && (
              <FormField
                control={form.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resolution</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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

            <div className="space-y-2">
              <label className="block text-sm font-medium">Attachments</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </label>
                {files.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {files.length} file(s) selected
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Incident'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentDialog;


