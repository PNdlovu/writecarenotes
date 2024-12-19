/**
 * @fileoverview Audit log details component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AuditDetailsProps } from '../../types/ui.types';
import { AuditChangesViewer } from './AuditChangesViewer';

export function AuditDetails({
  log,
  onClose,
  onArchive,
}: AuditDetailsProps) {
  const handleArchive = async () => {
    if (onArchive && log.id) {
      await onArchive(log.id);
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="changes">Changes</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Timestamp</h4>
                <p className="mt-1">
                  {log.timestamp ? format(new Date(log.timestamp), 'PPpp') : 'N/A'}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <Badge
                  className={`mt-1 ${
                    log.status === 'SUCCESS'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {log.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Action</h4>
                <Badge variant="outline" className="mt-1">
                  {log.action}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Entity Type</h4>
                <p className="mt-1">{log.entityType}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Entity ID</h4>
                <p className="mt-1 font-mono text-sm">{log.entityId}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Actor</h4>
                <p className="mt-1">{log.actorId}</p>
                <p className="text-sm text-gray-500">{log.actorType}</p>
              </div>

              {log.errorDetails && (
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Error Details</h4>
                  <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-sm overflow-auto">
                    {log.errorDetails}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="changes" className="mt-4">
            <ScrollArea className="h-[400px]">
              <AuditChangesViewer changes={log.changes} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="metadata" className="mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Organization</h4>
                <p className="mt-1 font-mono text-sm">{log.organizationId}</p>
              </div>

              {log.facilityId && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Facility</h4>
                  <p className="mt-1 font-mono text-sm">{log.facilityId}</p>
                </div>
              )}

              {log.ipAddress && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">IP Address</h4>
                  <p className="mt-1 font-mono text-sm">{log.ipAddress}</p>
                </div>
              )}

              {log.userAgent && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">User Agent</h4>
                  <p className="mt-1 text-sm break-all">{log.userAgent}</p>
                </div>
              )}

              {log.details && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Additional Details</h4>
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-sm overflow-auto">
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          {onArchive && (
            <Button
              variant="outline"
              onClick={handleArchive}
            >
              Archive
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 


