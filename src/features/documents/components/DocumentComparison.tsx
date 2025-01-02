import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Check,
  X,
  Plus,
  Minus,
  FileText,
  History,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
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
import { ScrollArea } from '@/components/ui/ScrollArea';

interface DocumentVersion {
  id: string;
  version: number;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface DocumentDiff {
  type: 'added' | 'removed' | 'modified';
  lineNumber: number;
  content: string;
  oldContent?: string;
}

interface DocumentComparisonProps {
  documentId: string;
  versionA?: string;
  versionB?: string;
  onClose?: () => void;
}

export function DocumentComparison({
  documentId,
  versionA,
  versionB,
  onClose,
}: DocumentComparisonProps) {
  const { t } = useTranslation('documents');
  const [selectedVersionA, setSelectedVersionA] = useState(versionA);
  const [selectedVersionB, setSelectedVersionB] = useState(versionB);

  // Fetch document versions
  const { data: versions } = useQuery({
    queryKey: ['documentVersions', documentId],
    queryFn: async () => {
      const response = await fetch(
        `/api/documents/${documentId}/versions`
      );
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
  });

  // Fetch version diff
  const { data: diff } = useQuery({
    queryKey: [
      'documentDiff',
      documentId,
      selectedVersionA,
      selectedVersionB,
    ],
    queryFn: async () => {
      if (!selectedVersionA || !selectedVersionB) return null;
      const response = await fetch(
        `/api/documents/${documentId}/diff?versionA=${selectedVersionA}&versionB=${selectedVersionB}`
      );
      if (!response.ok) throw new Error('Failed to fetch diff');
      return response.json();
    },
    enabled: !!selectedVersionA && !!selectedVersionB,
  });

  // Restore version mutation
  const restoreMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const response = await fetch(
        `/api/documents/${documentId}/restore/${versionId}`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to restore version');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('comparison.versionRestored'),
        description: t('comparison.versionRestoredDescription'),
      });
      onClose?.();
    },
  });

  const getDiffIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'removed':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'modified':
        return <ArrowLeftRight className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose?.()}>
      <DialogContent className="max-w-7xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('comparison.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex space-x-4 mb-4">
          {/* Version A Selector */}
          <div className="flex-1">
            <Select
              value={selectedVersionA}
              onValueChange={setSelectedVersionA}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('comparison.selectVersionA')}
                />
              </SelectTrigger>
              <SelectContent>
                {versions?.map((version: DocumentVersion) => (
                  <SelectItem key={version.id} value={version.id}>
                    {t('comparison.versionInfo', {
                      version: version.version,
                      date: new Date(
                        version.createdAt
                      ).toLocaleDateString(),
                      user: version.createdBy.name,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Version B Selector */}
          <div className="flex-1">
            <Select
              value={selectedVersionB}
              onValueChange={setSelectedVersionB}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('comparison.selectVersionB')}
                />
              </SelectTrigger>
              <SelectContent>
                {versions?.map((version: DocumentVersion) => (
                  <SelectItem key={version.id} value={version.id}>
                    {t('comparison.versionInfo', {
                      version: version.version,
                      date: new Date(
                        version.createdAt
                      ).toLocaleDateString(),
                      user: version.createdBy.name,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <Button
            variant="outline"
            onClick={() =>
              selectedVersionA &&
              restoreMutation.mutate(selectedVersionA)
            }
          >
            <History className="h-4 w-4 mr-2" />
            {t('comparison.restore')}
          </Button>
        </div>

        {/* Diff View */}
        {diff ? (
          <ScrollArea className="flex-1 border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    {t('comparison.type')}
                  </TableHead>
                  <TableHead className="w-[80px]">
                    {t('comparison.line')}
                  </TableHead>
                  <TableHead>{t('comparison.content')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diff.map((d: DocumentDiff, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{getDiffIcon(d.type)}</TableCell>
                    <TableCell>{d.lineNumber}</TableCell>
                    <TableCell>
                      {d.type === 'modified' ? (
                        <div className="space-y-1">
                          <div className="text-red-500 line-through">
                            {d.oldContent}
                          </div>
                          <div className="text-green-500">{d.content}</div>
                        </div>
                      ) : (
                        <div
                          className={
                            d.type === 'added'
                              ? 'text-green-500'
                              : 'text-red-500 line-through'
                          }
                        >
                          {d.content}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            {t('comparison.selectVersions')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


