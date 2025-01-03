import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Files,
  Upload,
  Download,
  Tag,
  Lock,
  Share2,
  Archive,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Timer,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge/Badge';
import { Progress } from '@/components/ui/Progress/Progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { toast } from '@/components/ui/UseToast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

interface BatchJob {
  id: string;
  type: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  createdBy: {
    name: string;
  };
  errors: {
    documentId: string;
    error: string;
  }[];
}

interface BatchProcessorProps {
  selectedDocuments: string[];
  onComplete?: () => void;
}

export function BatchProcessor({
  selectedDocuments,
  onComplete,
}: BatchProcessorProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Fetch batch jobs
  const { data: batchJobs } = useQuery({
    queryKey: ['batchJobs', activeTab],
    queryFn: async () => {
      const response = await fetch(
        `/api/documents/batch-jobs?status=${activeTab}`
      );
      if (!response.ok) throw new Error('Failed to fetch batch jobs');
      return response.json();
    },
  });

  // Create batch job mutation
  const createJobMutation = useMutation({
    mutationFn: async ({
      type,
      config,
    }: {
      type: string;
      config: any;
    }) => {
      const response = await fetch('/api/documents/batch-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          config,
          documentIds: selectedDocuments,
        }),
      });
      if (!response.ok) throw new Error('Failed to create batch job');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batchJobs'] });
      toast({
        title: t('batch.jobCreated'),
        description: t('batch.jobCreatedDescription'),
      });
      setSelectedJob(data);
    },
  });

  // Cancel batch job mutation
  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(
        `/api/documents/batch-jobs/${jobId}/cancel`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to cancel batch job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchJobs'] });
      toast({
        title: t('batch.jobCancelled'),
        description: t('batch.jobCancelledDescription'),
      });
    },
  });

  // Retry batch job mutation
  const retryJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(
        `/api/documents/batch-jobs/${jobId}/retry`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to retry batch job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batchJobs'] });
      toast({
        title: t('batch.jobRetried'),
        description: t('batch.jobRetriedDescription'),
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Timer className="h-4 w-4 text-muted-foreground" />;
      case 'PROCESSING':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'SHARE':
        return <Share2 className="h-4 w-4" />;
      case 'TAG':
        return <Tag className="h-4 w-4" />;
      case 'ARCHIVE':
        return <Archive className="h-4 w-4" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4" />;
      case 'EXPORT':
        return <Download className="h-4 w-4" />;
      case 'IMPORT':
        return <Upload className="h-4 w-4" />;
      default:
        return <Files className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Batch Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() =>
            createJobMutation.mutate({ type: 'SHARE', config: {} })
          }
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t('batch.shareDocuments')}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            createJobMutation.mutate({ type: 'TAG', config: {} })
          }
        >
          <Tag className="h-4 w-4 mr-2" />
          {t('batch.tagDocuments')}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            createJobMutation.mutate({ type: 'ARCHIVE', config: {} })
          }
        >
          <Archive className="h-4 w-4 mr-2" />
          {t('batch.archiveDocuments')}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            createJobMutation.mutate({ type: 'EXPORT', config: {} })
          }
        >
          <Download className="h-4 w-4 mr-2" />
          {t('batch.exportDocuments')}
        </Button>
      </div>

      {/* Batch Jobs List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">
            {t('batch.activeJobs')}
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('batch.completedJobs')}
          </TabsTrigger>
          <TabsTrigger value="failed">
            {t('batch.failedJobs')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    {t('batch.status')}
                  </TableHead>
                  <TableHead>{t('batch.type')}</TableHead>
                  <TableHead>{t('batch.progress')}</TableHead>
                  <TableHead>{t('batch.created')}</TableHead>
                  <TableHead>{t('batch.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batchJobs?.map((job: BatchJob) => (
                  <TableRow
                    key={job.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowJobDialog(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span>{job.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getActionIcon(job.type)}
                        <span>{job.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress
                          value={
                            (job.processedItems / job.totalItems) * 100
                          }
                        />
                        <div className="text-xs text-muted-foreground">
                          {job.processedItems} / {job.totalItems}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.createdBy.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {job.status === 'PROCESSING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelJobMutation.mutate(job.id);
                          }}
                        >
                          {t('batch.cancel')}
                        </Button>
                      )}
                      {job.status === 'FAILED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            retryJobMutation.mutate(job.id);
                          }}
                        >
                          {t('batch.retry')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Job Details Dialog */}
      <Dialog
        open={showJobDialog}
        onOpenChange={(open) => {
          setShowJobDialog(open);
          if (!open) setSelectedJob(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('batch.jobDetails')}</DialogTitle>
          </DialogHeader>

          {selectedJob && (
            <div className="space-y-6">
              {/* Job Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('batch.status')}</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusIcon(selectedJob.status)}
                    <span>{selectedJob.status}</span>
                  </div>
                </div>
                <div>
                  <Label>{t('batch.type')}</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getActionIcon(selectedJob.type)}
                    <span>{selectedJob.type}</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <Label>{t('batch.progress')}</Label>
                <Progress
                  value={
                    (selectedJob.processedItems /
                      selectedJob.totalItems) *
                    100
                  }
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>
                    {selectedJob.processedItems} /{' '}
                    {selectedJob.totalItems} {t('batch.items')}
                  </span>
                  <span>
                    {t('batch.success')}: {selectedJob.successCount}
                  </span>
                  <span>
                    {t('batch.failures')}: {selectedJob.failureCount}
                  </span>
                </div>
              </div>

              {/* Errors */}
              {selectedJob.errors.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('batch.errors')}</Label>
                  <ScrollArea className="h-[200px] border rounded-lg p-4">
                    <div className="space-y-2">
                      {selectedJob.errors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                          <div>
                            <div className="font-medium">
                              {error.documentId}
                            </div>
                            <div className="text-red-500">
                              {error.error}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


