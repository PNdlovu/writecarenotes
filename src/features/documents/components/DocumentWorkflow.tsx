import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Document, DocumentWorkflow, DocumentWorkflowStatus, Staff } from '@prisma/client';
import { useSession } from 'next-auth/react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  RotateCcw,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DocumentWorkflowProps {
  documentId: string;
  onWorkflowComplete?: () => void;
}

interface WorkflowWithApprovers extends DocumentWorkflow {
  approvers: Staff[];
}

export default function DocumentWorkflow({
  documentId,
  onWorkflowComplete,
}: DocumentWorkflowProps) {
  const { t } = useTranslation('documents');
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddApprover, setShowAddApprover] = useState(false);
  const [comment, setComment] = useState('');

  // Fetch workflow data
  const { data: workflow, isLoading } = useQuery<WorkflowWithApprovers>({
    queryKey: ['documentWorkflow', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/workflow`);
      if (!response.ok) throw new Error('Failed to fetch workflow');
      return response.json();
    },
    enabled: !!session && !!documentId,
  });

  // Fetch available approvers
  const { data: availableApprovers } = useQuery<Staff[]>({
    queryKey: ['staffMembers'],
    queryFn: async () => {
      const response = await fetch('/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      return response.json();
    },
    enabled: showAddApprover,
  });

  // Start workflow mutation
  const startWorkflowMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/workflow`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to start workflow');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentWorkflow', documentId] });
      toast({
        title: t('workflow.startSuccess'),
        description: t('workflow.startDescription'),
      });
    },
    onError: () => {
      toast({
        title: t('workflow.startError'),
        description: t('workflow.tryAgain'),
        variant: 'destructive',
      });
    },
  });

  // Add approver mutation
  const addApproverMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const response = await fetch(`/api/documents/${documentId}/workflow/approvers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId }),
      });
      if (!response.ok) throw new Error('Failed to add approver');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentWorkflow', documentId] });
      setShowAddApprover(false);
      toast({
        title: t('workflow.approverAddedSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('workflow.approverAddedError'),
        variant: 'destructive',
      });
    },
  });

  // Approve/Reject mutation
  const decisionMutation = useMutation({
    mutationFn: async ({ decision, comment }: { decision: 'APPROVE' | 'REJECT'; comment: string }) => {
      const response = await fetch(`/api/documents/${documentId}/workflow/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, comment }),
      });
      if (!response.ok) throw new Error('Failed to submit decision');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documentWorkflow', documentId] });
      setComment('');
      if (data.status === DocumentWorkflowStatus.COMPLETED) {
        onWorkflowComplete?.();
      }
      toast({
        title: t('workflow.decisionSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('workflow.decisionError'),
        variant: 'destructive',
      });
    },
  });

  const canApprove = workflow?.approvers.some(
    (approver) => approver.id === session?.user?.id
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="text-center py-8">
        <Button onClick={() => startWorkflowMutation.mutate()}>
          <Send className="h-4 w-4 mr-2" />
          {t('workflow.start')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge
            variant={
              workflow.status === DocumentWorkflowStatus.COMPLETED
                ? 'success'
                : workflow.status === DocumentWorkflowStatus.REJECTED
                ? 'destructive'
                : 'default'
            }
          >
            {t(`workflow.status.${workflow.status.toLowerCase()}`)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t('workflow.startedAt', {
              date: format(new Date(workflow.createdAt), 'PPp'),
            })}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddApprover(true)}
          disabled={workflow.status !== DocumentWorkflowStatus.IN_PROGRESS}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          {t('workflow.addApprover')}
        </Button>
      </div>

      {/* Approvers Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('workflow.approver')}</TableHead>
              <TableHead>{t('workflow.status')}</TableHead>
              <TableHead>{t('workflow.comment')}</TableHead>
              <TableHead>{t('workflow.date')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflow.approvers.map((approver) => (
              <TableRow key={approver.id}>
                <TableCell>{approver.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {approver.decision === 'APPROVED' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : approver.decision === 'REJECTED' ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span>
                      {t(
                        `workflow.decision.${
                          approver.decision?.toLowerCase() || 'pending'
                        }`
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{approver.comment || '-'}</TableCell>
                <TableCell>
                  {approver.decisionDate
                    ? format(new Date(approver.decisionDate), 'PPp')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Approval Actions */}
      {canApprove && workflow.status === DocumentWorkflowStatus.IN_PROGRESS && (
        <div className="space-y-4 border rounded-lg p-4">
          <Textarea
            placeholder={t('workflow.commentPlaceholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() =>
                decisionMutation.mutate({ decision: 'REJECT', comment })
              }
              disabled={decisionMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              {t('workflow.reject')}
            </Button>
            <Button
              onClick={() =>
                decisionMutation.mutate({ decision: 'APPROVE', comment })
              }
              disabled={decisionMutation.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('workflow.approve')}
            </Button>
          </div>
        </div>
      )}

      {/* Add Approver Dialog */}
      <Dialog open={showAddApprover} onOpenChange={setShowAddApprover}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workflow.selectApprover')}</DialogTitle>
          </DialogHeader>
          <Select
            onValueChange={(value) => addApproverMutation.mutate(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('workflow.selectApproverPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {availableApprovers?.map((staff) => (
                <SelectItem key={staff.id} value={staff.id}>
                  {staff.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
    </div>
  );
}


