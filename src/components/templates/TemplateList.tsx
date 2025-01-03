import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { PlusIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

export function TemplateList() {
  const router = useRouter();
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Templates</h2>
        <Button
          onClick={() => router.push('/templates/new')}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Variables</TableHead>
            <TableHead>Workflow</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.map((template: any) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {template.categories.map((category: any) => (
                    <Badge key={category.id} variant="outline">
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {(template.variables as string[]).map((variable: string) => (
                    <Badge key={variable} variant="secondary">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {template.workflow ? (
                  <Badge variant="default">{template.workflow.name}</Badge>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>{template.createdBy.name}</TableCell>
              <TableCell>
                {format(new Date(template.updatedAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/templates/${template.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/documents/new?template=${template.id}`)
                    }
                  >
                    Use
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


