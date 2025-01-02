import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import { format } from 'date-fns';
import Link from 'next/link';

interface WorkflowUsageProps {
  workflowId: string;
}

export function WorkflowUsage({ workflowId }: WorkflowUsageProps) {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['workflow-usage', workflowId],
    queryFn: async () => {
      const response = await fetch(`/api/workflows/${workflowId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflow usage');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Workflow Usage</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Current Approver</TableHead>
            <TableHead>Started</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents?.map((doc: any) => (
            <TableRow key={doc.id}>
              <TableCell>
                <Link
                  href={`/documents/${doc.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {doc.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    doc.status === 'APPROVED'
                      ? 'success'
                      : doc.status === 'REJECTED'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell>
                {doc.currentApprover ? (
                  <div className="flex flex-col">
                    <span>{doc.currentApprover.name}</span>
                    <span className="text-sm text-gray-500">
                      {doc.currentApprover.role}
                    </span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {format(new Date(doc.workflowStartedAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {format(new Date(doc.workflowUpdatedAt), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
          {documents?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                No documents are using this workflow
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


