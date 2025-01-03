import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Shield,
  Clock,
  Check,
  X,
  AlertTriangle,
  Download,
  Upload,
  Share2,
  Lock,
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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/Progress/Progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ShareTemplates } from './ShareTemplates';

interface Document {
  id: string;
  title: string;
  type: string;
  size: number;
  createdAt: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

interface BulkOperationStatus {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors: { documentId: string; error: string }[];
}

interface BulkOperationsProps {
  selectedDocuments: Document[];
  onComplete?: () => void;
}

export function BulkOperations({
  selectedDocuments,
  onComplete,
}: BulkOperationsProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [operationStatus, setOperationStatus] = useState<BulkOperationStatus | null>(
    null
  );

  // Bulk share mutation
  const bulkShareMutation = useMutation({
    mutationFn: async ({
      documentIds,
      shareConfig,
    }: {
      documentIds: string[];
      shareConfig: any;
    }) => {
      const response = await fetch('/api/documents/bulk-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds, shareConfig }),
      });
      if (!response.ok) throw new Error('Failed to bulk share documents');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setOperationStatus(data.status);
      if (data.status.failed === 0) {
        toast({
          title: t('bulk.shareSuccess'),
          description: t('bulk.shareSuccessDescription', {
            count: data.status.succeeded,
          }),
        });
        onComplete?.();
      } else {
        toast({
          title: t('bulk.sharePartialSuccess'),
          description: t('bulk.sharePartialDescription', {
            succeeded: data.status.succeeded,
            failed: data.status.failed,
          }),
          variant: 'warning',
        });
      }
    },
  });

  // Bulk permission update mutation
  const bulkPermissionMutation = useMutation({
    mutationFn: async ({
      documentIds,
      permission,
    }: {
      documentIds: string[];
      permission: 'VIEW' | 'EDIT' | 'NONE';
    }) => {
      const response = await fetch('/api/documents/bulk-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds, permission }),
      });
      if (!response.ok) throw new Error('Failed to update permissions');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setOperationStatus(data.status);
      toast({
        title: t('bulk.permissionSuccess'),
        description: t('bulk.permissionSuccessDescription', {
          count: data.status.succeeded,
        }),
      });
      onComplete?.();
    },
  });

  // Bulk export mutation
  const bulkExportMutation = useMutation({
    mutationFn: async (documentIds: string[]) => {
      const response = await fetch('/api/documents/bulk-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds }),
      });
      if (!response.ok) throw new Error('Failed to export documents');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'documents-export.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return response.json();
    },
    onSuccess: (data) => {
      setOperationStatus(data.status);
      toast({
        title: t('bulk.exportSuccess'),
        description: t('bulk.exportSuccessDescription', {
          count: data.status.succeeded,
        }),
      });
    },
  });

  const handleTemplateSelect = (template: any) => {
    bulkShareMutation.mutate({
      documentIds: selectedDocuments.map((doc) => doc.id),
      shareConfig: {
        ...template,
        fromTemplate: true,
      },
    });
    setShowTemplateDialog(false);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowShareDialog(true)}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {t('bulk.share')}
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowTemplateDialog(true)}
        >
          <Users className="h-4 w-4 mr-2" />
          {t('bulk.useTemplate')}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            bulkExportMutation.mutate(
              selectedDocuments.map((doc) => doc.id)
            )
          }
        >
          <Download className="h-4 w-4 mr-2" />
          {t('bulk.export')}
        </Button>
      </div>

      {/* Selected Documents Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bulk.document')}</TableHead>
              <TableHead>{t('bulk.type')}</TableHead>
              <TableHead>{t('bulk.status')}</TableHead>
              <TableHead>{t('bulk.size')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.status === 'PUBLISHED'
                        ? 'success'
                        : doc.status === 'DRAFT'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {doc.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {(doc.size / 1024).toFixed(2)} KB
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Operation Status */}
      {operationStatus && (
        <div className="space-y-4 p-4 border rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>{t('bulk.progress')}</span>
              <span>
                {operationStatus.processed} / {operationStatus.total}
              </span>
            </div>
            <Progress
              value={
                (operationStatus.processed / operationStatus.total) * 100
              }
            />
          </div>

          <div className="flex space-x-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {t('bulk.succeeded')}
              </span>
              <p className="text-xl font-bold text-green-600">
                {operationStatus.succeeded}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">
                {t('bulk.failed')}
              </span>
              <p className="text-xl font-bold text-red-600">
                {operationStatus.failed}
              </p>
            </div>
          </div>

          {operationStatus.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">{t('bulk.errors')}</h4>
              <div className="space-y-1">
                {operationStatus.errors.map((error, index) => (
                  <div
                    key={index}
                    className="text-sm text-red-600 flex items-start space-x-2"
                  >
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t('bulk.shareDocuments', {
                count: selectedDocuments.length,
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Share settings form */}
            {/* ... */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog
        open={showTemplateDialog}
        onOpenChange={setShowTemplateDialog}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('bulk.selectTemplate')}</DialogTitle>
          </DialogHeader>
          <ShareTemplates onSelectTemplate={handleTemplateSelect} />
        </DialogContent>
      </Dialog>
    </div>
  );
}


