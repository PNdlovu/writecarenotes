import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/Button/Button';
import { History, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/UseToast';
import { Document } from '@/features/staff/types';

interface Version {
  version: number;
  createdAt: string;
  createdBy: string;
  changes: string;
}

interface DocumentVersionHistoryProps {
  document: Document;
  versions: Version[];
  onVersionRestore: (version: number) => Promise<void>;
}

export function DocumentVersionHistory({
  document,
  versions,
  onVersionRestore,
}: DocumentVersionHistoryProps) {
  const { toast } = useToast();
  const [restoringVersion, setRestoringVersion] = React.useState<number | null>(null);

  const handleRestore = async (version: number) => {
    try {
      setRestoringVersion(version);
      await onVersionRestore(version);
      toast({
        title: 'Version restored',
        description: `Successfully restored document to version ${version}`,
      });
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore version. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRestoringVersion(null);
    }
  };

  if (!versions.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <History className="w-12 h-12 mb-4" />
        <p>No version history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        <p className="text-sm text-gray-500">
          Current Version: {document.version}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Version</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Modified By</TableHead>
            <TableHead>Changes</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {versions.map((version) => (
            <TableRow key={version.version}>
              <TableCell>v{version.version}</TableCell>
              <TableCell>
                {format(new Date(version.createdAt), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell>{version.createdBy}</TableCell>
              <TableCell>{version.changes}</TableCell>
              <TableCell>
                {version.version !== document.version && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(version.version)}
                    disabled={restoringVersion === version.version}
                  >
                    {restoringVersion === version.version ? (
                      'Restoring...'
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restore
                      </>
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-sm text-gray-500">
        Note: Restoring a previous version will create a new version with the restored content.
      </p>
    </div>
  );
}


