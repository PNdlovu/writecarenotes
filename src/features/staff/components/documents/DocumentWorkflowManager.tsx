import React from 'react';
import { useDocumentWorkflows } from '@/hooks/useDocumentWorkflow';
import { useForm } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, X } from 'lucide-react';

const workflowFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  stages: z.array(z.object({
    name: z.string().min(1, 'Stage name is required'),
    order: z.number(),
    approverRoles: z.array(z.string()).min(1, 'At least one approver role is required'),
    autoApprove: z.boolean().optional(),
    timeoutHours: z.number().optional(),
    timeoutAction: z.enum(['APPROVE', 'REJECT']).optional(),
  })).min(1, 'At least one stage is required'),
});

type WorkflowFormValues = z.infer<typeof workflowFormSchema>;

export function DocumentWorkflowManager({ staffId }: { staffId: string }) {
  const { workflows, isLoading, createWorkflow } = useDocumentWorkflows(staffId);
  const [isOpen, setIsOpen] = React.useState(false);

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: {
      name: '',
      description: '',
      stages: [{ name: '', order: 0, approverRoles: [] }],
    },
  });

  const onSubmit = async (data: WorkflowFormValues) => {
    try {
      await createWorkflow.mutateAsync(data);
      setIsOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const addStage = () => {
    const stages = form.getValues('stages');
    form.setValue('stages', [
      ...stages,
      { name: '', order: stages.length, approverRoles: [] },
    ]);
  };

  const removeStage = (index: number) => {
    const stages = form.getValues('stages');
    form.setValue(
      'stages',
      stages.filter((_, i) => i !== index).map((stage, i) => ({
        ...stage,
        order: i,
      }))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Document Workflows</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Document Workflow</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workflow Name</FormLabel>
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
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Stages</h3>
                    <Button type="button" variant="outline" onClick={addStage}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stage
                    </Button>
                  </div>
                  {form.watch('stages').map((stage, index) => (
                    <div key={index} className="relative p-4 border rounded-lg">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => removeStage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <FormField
                        control={form.control}
                        name={`stages.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stage Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {/* Add more stage fields as needed */}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createWorkflow.isPending}>
                    {createWorkflow.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Create Workflow
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows?.map((workflow) => (
            <div
              key={workflow.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <h3 className="font-medium">{workflow.name}</h3>
              {workflow.description && (
                <p className="text-sm text-gray-500">{workflow.description}</p>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium">Stages:</p>
                {workflow.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full">
                      {stage.order + 1}
                    </span>
                    {stage.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


