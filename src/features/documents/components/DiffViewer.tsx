import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { DocumentVersion } from '@prisma/client';
import { diffLines, Change } from 'diff';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
}

export function DiffViewer({ oldVersion, newVersion }: DiffViewerProps) {
  const { t } = useTranslation('documents');

  const diff = useMemo(() => {
    if (!oldVersion || !newVersion) return [];
    return diffLines(oldVersion.content, newVersion.content);
  }, [oldVersion, newVersion]);

  if (!oldVersion || !newVersion) {
    return (
      <div className="text-center text-muted-foreground">
        {t('versions.selectVersions')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-100 rounded" />
          <span>{t('versions.removed')}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 rounded" />
          <span>{t('versions.added')}</span>
        </div>
      </div>

      <div className="font-mono text-sm">
        {diff.map((part: Change, index: number) => (
          <pre
            key={index}
            className={cn(
              'p-1',
              part.added && 'bg-green-100',
              part.removed && 'bg-red-100'
            )}
          >
            <code>{part.value}</code>
          </pre>
        ))}
      </div>
    </div>
  );
}


