import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DocumentVersion } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { Clock, ArrowLeftRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { DiffViewer } from './DiffViewer';

interface DocumentVersionsProps {
  documentId: string;
  currentVersion: number;
  onVersionRestore?: (version: DocumentVersion) => void;
}

export default function DocumentVersions({
  documentId,
  currentVersion,
  onVersionRestore,
}: DocumentVersionsProps) {
  const { t } = useTranslation('documents');
  const { data: session } = useSession();
  const { toast } = useToast();
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  const { data: versions, isLoading } = useQuery({
    queryKey: ['documentVersions', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
    enabled: !!session && !!documentId,
  });

  const handleVersionSelect = (version: number) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter((v) => v !== version));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version].sort((a, b) => b - a));
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length !== 2) {
      toast({
        title: t('versions.selectTwoVersions'),
        variant: 'destructive',
      });
      return;
    }
    setShowDiff(true);
  };

  const handleRestore = async (version: DocumentVersion) => {
    if (version.version === currentVersion) {
      toast({
        title: t('versions.alreadyCurrent'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}/versions/${version.version}/restore`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to restore version');

      toast({
        title: t('versions.restoreSuccess'),
        description: t('versions.restoreDescription', { version: version.version }),
      });

      onVersionRestore?.(version);
    } catch (error) {
      toast({
        title: t('versions.restoreError'),
        description: t('versions.tryAgain'),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Version Comparison Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {selectedVersions.length === 0
              ? t('versions.selectToCompare')
              : selectedVersions.length === 1
              ? t('versions.selectOneMore')
              : t('versions.readyToCompare')}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCompare}
          disabled={selectedVersions.length !== 2}
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          {t('versions.compare')}
        </Button>
      </div>

      {/* Versions Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">{t('versions.version')}</TableHead>
              <TableHead>{t('versions.createdBy')}</TableHead>
              <TableHead>{t('versions.createdAt')}</TableHead>
              <TableHead className="text-right">{t('versions.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions?.map((version: DocumentVersion & { creator: { name: string } }) => (
              <TableRow
                key={version.version}
                className={
                  selectedVersions.includes(version.version)
                    ? 'bg-primary/5'
                    : undefined
                }
              >
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.version)}
                      onChange={() => handleVersionSelect(version.version)}
                      className="rounded border-gray-300"
                    />
                    <span className="font-mono">v{version.version}</span>
                  </div>
                </TableCell>
                <TableCell>{version.creator.name}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(version.createdAt), 'PPp')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore(version)}
                    disabled={version.version === currentVersion}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('versions.restore')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diff Viewer Dialog */}
      <Dialog open={showDiff} onOpenChange={setShowDiff}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {t('versions.comparing', {
                v1: selectedVersions[0],
                v2: selectedVersions[1],
              })}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[600px]">
            {selectedVersions.length === 2 && (
              <DiffViewer
                oldVersion={versions.find(
                  (v: DocumentVersion) => v.version === selectedVersions[1]
                )}
                newVersion={versions.find(
                  (v: DocumentVersion) => v.version === selectedVersions[0]
                )}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}


