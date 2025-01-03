/**
 * @fileoverview Bulk actions component for audit logs
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Icons } from '@/components/ui/Icons';
import { useToast } from '@/components/ui/use-toast';
import { AuditService } from '../../services/auditService';
import { AuditLogEntry, AuditLogFilter } from '../../types/audit.types';
import { ExportOptions } from '../../types/export.types';

interface BulkActionsProps {
  selectedLogs: AuditLogEntry[];
  filter: AuditLogFilter;
  onSuccess: () => void;
}

export function BulkActions({ selectedLogs, filter, onSuccess }: BulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const auditService = AuditService.getInstance();
  const { toast } = useToast();

  const handleArchive = async () => {
    try {
      setIsLoading(true);
      
      const count = await auditService.archiveLogs(
        {
          ...filter,
          entityIds: selectedLogs.map(log => log.entityId)
        },
        'Bulk archive action',
        'SYSTEM'
      );

      toast({
        title: 'Success',
        description: `${count} logs archived successfully`
      });

      setShowArchiveDialog(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      const count = await auditService.cleanupOldLogs(
        filter.organizationId || 'SYSTEM',
        0, // Immediate deletion
        'SYSTEM'
      );

      toast({
        title: 'Success',
        description: `${count} logs deleted successfully`
      });

      setShowDeleteDialog(false);
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'CSV' | 'JSON' | 'PDF') => {
    try {
      setIsLoading(true);

      const options: ExportOptions = {
        format,
        customization: {
          title: 'Audit Log Export',
          fields: [
            { key: 'timestamp', label: 'Timestamp', include: true },
            { key: 'action', label: 'Action', include: true },
            { key: 'entityType', label: 'Entity Type', include: true },
            { key: 'entityId', label: 'Entity ID', include: true },
            { key: 'actorId', label: 'Actor', include: true },
            { key: 'status', label: 'Status', include: true }
          ],
          includeTimestamp: true,
          watermark: {
            text: 'CONFIDENTIAL',
            opacity: 0.3,
            position: 'diagonal'
          },
          security: {
            encrypt: true,
            allowPrinting: true,
            allowCopying: false,
            gdprCompliant: true
          }
        }
      };

      const data = await auditService.exportLogs(
        {
          ...filter,
          entityIds: selectedLogs.map(log => log.entityId)
        },
        options,
        'SYSTEM'
      );

      // Create download link
      const blob = new Blob([data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString()}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Success',
        description: 'Selected logs exported successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={selectedLogs.length === 0 || isLoading}
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Icons.moreHorizontal className="mr-2 h-4 w-4" />
            )}
            Bulk Actions ({selectedLogs.length})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
            <Icons.archive className="mr-2 h-4 w-4" />
            Archive Selected
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
            <Icons.trash className="mr-2 h-4 w-4" />
            Delete Selected
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('CSV')}>
            <Icons.fileText className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('JSON')}>
            <Icons.code className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('PDF')}>
            <Icons.filePdf className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archive Selected Logs</DialogTitle>
            <DialogDescription>
              Are you sure you want to archive {selectedLogs.length} selected logs?
              This action can be reversed later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowArchiveDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleArchive}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.archive className="mr-2 h-4 w-4" />
              )}
              Archive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Logs</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete {selectedLogs.length} selected logs?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.trash className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 


