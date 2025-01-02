import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Eye,
  Download,
  Share2,
  Edit,
  Trash2,
  Archive,
  Tag,
  Lock,
  History,
  User,
  Calendar,
  Search,
  Filter,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/Calendar';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  documentId: string;
  documentTitle: string;
  action: string;
  details: any;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
  performedAt: string;
  ipAddress: string;
  userAgent: string;
}

interface DocumentAuditProps {
  documentId?: string;
  isGlobalAudit?: boolean;
}

export function DocumentAudit({
  documentId,
  isGlobalAudit = false,
}: DocumentAuditProps) {
  const { t } = useTranslation('documents');
  const [filters, setFilters] = useState({
    action: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    userId: '',
  });
  const [showDetails, setShowDetails] = useState<AuditLog | null>(null);

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['auditLogs', documentId, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (documentId) queryParams.append('documentId', documentId);
      if (filters.action) queryParams.append('action', filters.action);
      if (filters.startDate)
        queryParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate)
        queryParams.append('endDate', filters.endDate.toISOString());
      if (filters.userId) queryParams.append('userId', filters.userId);

      const response = await fetch(
        `/api/documents/audit-logs?${queryParams.toString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    },
  });

  // Fetch users for filter
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'VIEW':
        return <Eye className="h-4 w-4" />;
      case 'DOWNLOAD':
        return <Download className="h-4 w-4" />;
      case 'SHARE':
        return <Share2 className="h-4 w-4" />;
      case 'EDIT':
        return <Edit className="h-4 w-4" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4" />;
      case 'ARCHIVE':
        return <Archive className="h-4 w-4" />;
      case 'TAG':
        return <Tag className="h-4 w-4" />;
      case 'PERMISSION':
        return <Lock className="h-4 w-4" />;
      case 'VERSION':
        return <History className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatDetails = (action: string, details: any) => {
    switch (action) {
      case 'SHARE':
        return t('audit.shareDetails', {
          count: details.recipients.length,
          permission: details.permission,
        });
      case 'EDIT':
        return t('audit.editDetails', {
          field: details.field,
        });
      case 'TAG':
        return t('audit.tagDetails', {
          action: details.added ? 'added' : 'removed',
          tag: details.tagName,
        });
      case 'PERMISSION':
        return t('audit.permissionDetails', {
          permission: details.permission,
          user: details.userName,
        });
      default:
        return details.message || '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        {/* Action Filter */}
        <div className="w-[200px]">
          <Select
            value={filters.action}
            onValueChange={(value) =>
              setFilters({ ...filters, action: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t('audit.filterAction')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('audit.allActions')}
              </SelectItem>
              <SelectItem value="VIEW">
                {t('audit.actionView')}
              </SelectItem>
              <SelectItem value="DOWNLOAD">
                {t('audit.actionDownload')}
              </SelectItem>
              <SelectItem value="SHARE">
                {t('audit.actionShare')}
              </SelectItem>
              <SelectItem value="EDIT">
                {t('audit.actionEdit')}
              </SelectItem>
              <SelectItem value="DELETE">
                {t('audit.actionDelete')}
              </SelectItem>
              <SelectItem value="ARCHIVE">
                {t('audit.actionArchive')}
              </SelectItem>
              <SelectItem value="TAG">
                {t('audit.actionTag')}
              </SelectItem>
              <SelectItem value="PERMISSION">
                {t('audit.actionPermission')}
              </SelectItem>
              <SelectItem value="VERSION">
                {t('audit.actionVersion')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[300px]">
              <Calendar className="h-4 w-4 mr-2" />
              {filters.startDate ? (
                filters.endDate ? (
                  <>
                    {format(filters.startDate, 'PPP')} -{' '}
                    {format(filters.endDate, 'PPP')}
                  </>
                ) : (
                  format(filters.startDate, 'PPP')
                )
              ) : (
                t('audit.selectDateRange')
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="range"
              selected={{
                from: filters.startDate,
                to: filters.endDate,
              }}
              onSelect={(range) =>
                setFilters({
                  ...filters,
                  startDate: range?.from || null,
                  endDate: range?.to || null,
                })
              }
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* User Filter */}
        {isGlobalAudit && (
          <div className="w-[200px]">
            <Select
              value={filters.userId}
              onValueChange={(value) =>
                setFilters({ ...filters, userId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('audit.filterUser')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {t('audit.allUsers')}
                </SelectItem>
                {users?.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters */}
        <Button
          variant="ghost"
          onClick={() =>
            setFilters({
              action: '',
              startDate: null,
              endDate: null,
              userId: '',
            })
          }
        >
          {t('audit.clearFilters')}
        </Button>
      </div>

      {/* Audit Log Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('audit.action')}</TableHead>
              {isGlobalAudit && (
                <TableHead>{t('audit.document')}</TableHead>
              )}
              <TableHead>{t('audit.details')}</TableHead>
              <TableHead>{t('audit.user')}</TableHead>
              <TableHead>{t('audit.timestamp')}</TableHead>
              <TableHead>{t('audit.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs?.map((log: AuditLog) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getActionIcon(log.action)}
                    <span>{t(`audit.action${log.action}`)}</span>
                  </div>
                </TableCell>
                {isGlobalAudit && (
                  <TableCell>{log.documentTitle}</TableCell>
                )}
                <TableCell>
                  {formatDetails(log.action, log.details)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div>{log.performedBy.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {log.performedBy.role}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(log.performedAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetails(log)}
                  >
                    {t('audit.viewDetails')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog
        open={!!showDetails}
        onOpenChange={(open) => !open && setShowDetails(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('audit.logDetails')}</DialogTitle>
          </DialogHeader>

          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('audit.action')}</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getActionIcon(showDetails.action)}
                    <span>
                      {t(`audit.action${showDetails.action}`)}
                    </span>
                  </div>
                </div>
                <div>
                  <Label>{t('audit.timestamp')}</Label>
                  <div className="mt-1">
                    {new Date(
                      showDetails.performedAt
                    ).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <Label>{t('audit.user')}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <User className="h-4 w-4" />
                  <div>
                    <div>{showDetails.performedBy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {showDetails.performedBy.role}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label>{t('audit.details')}</Label>
                <pre className="mt-1 p-4 bg-muted rounded-lg overflow-auto">
                  {JSON.stringify(showDetails.details, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('audit.ipAddress')}</Label>
                  <div className="mt-1">{showDetails.ipAddress}</div>
                </div>
                <div>
                  <Label>{t('audit.userAgent')}</Label>
                  <div className="mt-1">{showDetails.userAgent}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


