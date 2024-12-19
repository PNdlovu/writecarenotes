import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Editor } from '@/components/editor/Editor';

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  workflowId: z.string().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateFormProps {
  initialData?: TemplateFormData;
  onSubmit: (data: TemplateFormData) => void;
}

export function TemplateForm({ initialData, onSubmit }: TemplateFormProps) {
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      content: '',
      variables: [],
      categoryIds: [],
      tagIds: [],
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  // Fetch tags
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      return response.json();
    },
  });

  // Fetch workflows
  const { data: workflows } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await fetch('/api/workflows');
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      return response.json();
    },
  });

  // Extract variables from content
  const extractVariables = (content: string) => {
    const matches = content.match(/{{([^}]+)}}/g) || [];
    const variables = matches.map(match => match.slice(2, -2).trim());
    return [...new Set(variables)]; // Remove duplicates
  };

  // Update variables when content changes
  const handleContentChange = (content: string) => {
    form.setValue('content', content);
    const variables = extractVariables(content);
    form.setValue('variables', variables);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter template name" {...field} />
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
                  placeholder="Enter template description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Editor
                  value={field.value}
                  onChange={handleContentChange}
                  placeholder="Enter template content. Use {{variable}} for placeholders."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Variables</FormLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {form.watch('variables').map((variable, index) => (
              <Badge key={index} variant="secondary">
                {variable}
              </Badge>
            ))}
            {form.watch('variables').length === 0 && (
              <span className="text-sm text-gray-500">
                No variables found. Use {{variable}} in content to add variables.
              </span>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="categoryIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange([...field.value, value])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="mt-2 flex flex-wrap gap-2">
                {field.value.map((categoryId: string) => {
                  const category = categories?.find((c: any) => c.id === categoryId);
                  return (
                    <Badge
                      key={categoryId}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() =>
                        field.onChange(field.value.filter((id: string) => id !== categoryId))
                      }
                    >
                      {category?.name} ×
                    </Badge>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    field.onChange([...field.value, value])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tags" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags?.map((tag: any) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <div className="mt-2 flex flex-wrap gap-2">
                {field.value.map((tagId: string) => {
                  const tag = tags?.find((t: any) => t.id === tagId);
                  return (
                    <Badge
                      key={tagId}
                      variant="secondary"
                      className="cursor-pointer"
                      style={{ backgroundColor: tag?.color }}
                      onClick={() =>
                        field.onChange(field.value.filter((id: string) => id !== tagId))
                      }
                    >
                      {tag?.name} ×
                    </Badge>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workflowId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Workflow</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No workflow</SelectItem>
                    {workflows?.map((workflow: any) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="submit">Save Template</Button>
        </div>
      </form>
    </Form>
  );
}


