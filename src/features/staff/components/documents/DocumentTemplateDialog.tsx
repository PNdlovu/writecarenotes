import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from '@/components/ui/Form/input';
import { Textarea } from '@/components/ui/Form/textarea';
import { Button } from '@/components/ui/Button/Button';
import { DocumentTemplate, DocumentCategory } from '@/features/staff/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const templateSchema = z.object({
  templateId: z.string().min(1, 'Please select a template'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  variables: z.record(z.string()).optional(),
});

interface DocumentTemplateDialogProps {
  staffId: string;
  onClose: () => void;
}

const DocumentTemplateDialog: React.FC<DocumentTemplateDialogProps> = ({
  staffId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(
    null
  );

  const { data: templates } = useQuery<DocumentTemplate[]>({
    queryKey: ['documentTemplates'],
    queryFn: async () => {
      const response = await fetch('/api/documents/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      templateId: '',
      title: '',
      description: '',
      variables: {},
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof templateSchema>) => {
      const response = await fetch(`/api/staff/${staffId}/documents/from-template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create document from template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffDocuments', staffId] });
      onClose();
    },
  });

  const handleTemplateChange = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      form.setValue('title', template.name);
      form.setValue('description', template.description || '');

      // Initialize variables with default values
      const variables: Record<string, string> = {};
      template.variables?.forEach((variable) => {
        variables[variable.name] = variable.defaultValue || '';
      });
      form.setValue('variables', variables);
    }
  };

  const onSubmit = (data: z.infer<typeof templateSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Document from Template</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleTemplateChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedTemplate && (
              <>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Title</FormLabel>
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

                {selectedTemplate.variables?.map((variable) => (
                  <FormField
                    key={variable.name}
                    control={form.control}
                    name={`variables.${variable.name}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {variable.name}
                          {variable.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          {variable.type === 'date' ? (
                            <Input type="date" {...field} />
                          ) : variable.type === 'number' ? (
                            <Input type="number" {...field} />
                          ) : variable.type === 'boolean' ? (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input {...field} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Creating...' : 'Create Document'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentTemplateDialog;


