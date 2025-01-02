import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'next-i18next';
import { toast } from '@/components/ui/UseToast';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Separator } from '@/components/ui/Separator';
import { History, RotateCcw, GitCompare, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/Form/Input";
import { Label } from "@/components/ui/Form/Label";

interface Version {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changeReason?: string;
}

interface VersionControlProps {
  documentId: string;
  staffId: string;
  currentVersion: number;
}

/**
 * Version Control component for document management
 * Provides version history, comparison, and restoration capabilities
 */
export const VersionControl: React.FC<VersionControlProps> = ({
  documentId,
  staffId,
  currentVersion,
}) => {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = React.useState<Version | null>(null);
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareVersion, setCompareVersion] = React.useState<Version | null>(null);
  const [showVersionInfo, setShowVersionInfo] = React.useState(false);

  // Fetch version history
  const { data: versions, isLoading } = useQuery<Version[]>({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/documents/${documentId}/versions`);
      if (!response.ok) throw new Error('Failed to fetch versions');
      return response.json();
    },
  });

  // Restore version mutation
  const restoreMutation = useMutation({
    mutationFn: async (versionNumber: number) => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}/versions/${versionNumber}`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to restore version');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['document-versions', documentId]);
      toast.success(t('version.restored'));
    },
    onError: () => {
      toast.error(t('version.restoreError'));
    },
  });

  // Compare versions query
  const { data: comparison, isLoading: isComparing } = useQuery({
    queryKey: ['version-comparison', documentId, selectedVersion?.versionNumber, compareVersion?.versionNumber],
    queryFn: async () => {
      if (!selectedVersion || !compareVersion) return null;
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}/versions/${selectedVersion.versionNumber}/compare?compareWith=${compareVersion.versionNumber}`
      );
      if (!response.ok) throw new Error('Failed to compare versions');
      return response.json();
    },
    enabled: !!(selectedVersion && compareVersion),
  });

  const handleRestore = async (version: Version) => {
    if (window.confirm(t('version.confirmRestore'))) {
      await restoreMutation.mutateAsync(version.versionNumber);
    }
  };

  const handleCompare = (version: Version) => {
    if (compareMode) {
      setCompareVersion(version);
      setCompareMode(false);
    } else {
      setSelectedVersion(version);
      setCompareMode(true);
    }
  };

  const renderVersionList = () => (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {versions?.map((version) => (
          <React.Fragment key={version.id}>
            <div className="flex items-center justify-between p-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {t('version.number', { number: version.versionNumber })}
                  {version.versionNumber === currentVersion && 
                    <span className="ml-2 text-muted-foreground">({t('version.current')})</span>}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                </div>
                {version.changeReason && (
                  <div className="text-sm text-muted-foreground">
                    {version.changeReason}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedVersion(version);
                          setShowVersionInfo(true);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('version.info')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCompare(version)}
                      >
                        <GitCompare className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{t('version.compare')}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {version.versionNumber !== currentVersion && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRestore(version)}
                          disabled={restoreMutation.isLoading}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{t('version.restore')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            <Separator />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );

  const renderComparison = () => {
    if (!comparison) return null;

    return (
      <Dialog
        open={!!comparison}
        onOpenChange={() => {
          setSelectedVersion(null);
          setCompareVersion(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {t('version.comparing', {
              v1: selectedVersion?.versionNumber,
              v2: compareVersion?.versionNumber,
            })}
          </DialogTitle>
        </DialogHeader>
        <DialogContent className="max-w-2xl">
          {isComparing ? (
            <p className="text-sm text-muted-foreground">{t('version.comparing')}</p>
          ) : (
            <div className="space-y-2">
              {comparison.changes?.map((change, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-md text-sm',
                    change.type === 'addition' && 'bg-green-100 dark:bg-green-900',
                    change.type === 'deletion' && 'bg-red-100 dark:bg-red-900',
                    change.type === 'modification' && 'bg-yellow-100 dark:bg-yellow-900'
                  )}
                >
                  {change.content}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedVersion(null);
              setCompareVersion(null);
            }}
          >
            {t('common.close')}
          </Button>
        </DialogFooter>
      </Dialog>
    );
  };

  const renderVersionInfo = () => (
    <Dialog
      open={showVersionInfo}
      onOpenChange={(open) => {
        if (!open) {
          setShowVersionInfo(false);
          setSelectedVersion(null);
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>
          {t('version.info')}
        </DialogTitle>
      </DialogHeader>
      <DialogContent>
        {/* Version info content */}
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setShowVersionInfo(false);
            setSelectedVersion(null);
          }}
        >
          {t('common.close')}
        </Button>
      </DialogFooter>
    </Dialog>
  );

  return (
    <Card>
      <CardHeader
        title={t('version.history')}
        avatar={<History className="h-4 w-4" />}
      />
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        ) : (
          renderVersionList()
        )}
        {renderComparison()}
        {renderVersionInfo()}
      </CardContent>
    </Card>
  );
};


