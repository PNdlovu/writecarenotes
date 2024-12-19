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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Activity, Eye, Download, Edit, Trash, CheckCircle2, History } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  userId: string;
  timestamp: string;
  details?: string;
}

interface DocumentAuditTrailProps {
  entries: AuditEntry[];
  className?: string;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'VIEWED':
      return <Eye className="w-4 h-4" />;
    case 'DOWNLOADED':
      return <Download className="w-4 h-4" />;
    case 'UPDATED':
      return <Edit className="w-4 h-4" />;
    case 'DELETED':
      return <Trash className="w-4 h-4" />;
    case 'SIGNED':
    case 'APPROVED':
    case 'REVIEWED':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'VERSION_CREATED':
    case 'VERSION_RESTORED':
      return <History className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'VIEWED':
      return 'text-blue-500';
    case 'DOWNLOADED':
      return 'text-green-500';
    case 'UPDATED':
      return 'text-orange-500';
    case 'DELETED':
      return 'text-red-500';
    case 'SIGNED':
    case 'APPROVED':
    case 'REVIEWED':
      return 'text-purple-500';
    case 'VERSION_CREATED':
    case 'VERSION_RESTORED':
      return 'text-cyan-500';
    default:
      return 'text-gray-500';
  }
};

export function DocumentAuditTrail({ entries, className }: DocumentAuditTrailProps) {
  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <Activity className="w-12 h-12 mb-4" />
        <p>No audit trail entries available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ScrollArea className="h-[400px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={`flex items-center space-x-2 ${getActionColor(entry.action)}`}>
                          {getActionIcon(entry.action)}
                          <span>{entry.action}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{entry.action} action</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{entry.userId}</TableCell>
                <TableCell>
                  {format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm:ss')}
                </TableCell>
                <TableCell>{entry.details || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}


