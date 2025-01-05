import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface WorkflowStage {
  id: string;
  name: string;
  order: number;
  approverRoles: string[];
  autoApprove?: boolean;
  timeoutHours?: number;
  timeoutAction?: 'APPROVE' | 'REJECT';
}

interface DocumentWorkflow {
  id: string;
  name: string;
  description?: string;
  stages: WorkflowStage[];
  isActive: boolean;
}

export function useDocumentWorkflows(staffId: string) {
  const queryClient = useQueryClient();

  const { data: workflows, isLoading } = useQuery<DocumentWorkflow[]>({
    queryKey: ['workflows', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/documents/workflows`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      return response.json();
    },
  });

  const createWorkflow = useMutation({
    mutationFn: async (workflow: Omit<DocumentWorkflow, 'id' | 'isActive'>) => {
      const response = await fetch(`/api/staff/${staffId}/documents/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows', staffId] });
      toast.success('Workflow created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create workflow');
      console.error('Error creating workflow:', error);
    },
  });

  const assignWorkflow = useMutation({
    mutationFn: async ({ documentId, workflowId }: { documentId: string; workflowId: string }) => {
      const response = await fetch(`/api/staff/${staffId}/documents/${documentId}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign workflow');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', staffId] });
      toast.success('Workflow assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign workflow');
      console.error('Error assigning workflow:', error);
    },
  });

  const approveStage = useMutation({
    mutationFn: async ({
      documentId,
      stageId,
      comments,
    }: {
      documentId: string;
      stageId: string;
      comments?: string;
    }) => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}/workflow/stages/${stageId}/approve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comments }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve stage');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', staffId] });
      toast.success('Stage approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve stage');
      console.error('Error approving stage:', error);
    },
  });

  return {
    workflows,
    isLoading,
    createWorkflow,
    assignWorkflow,
    approveStage,
  };
}


