/**
 * @fileoverview Audit Log Component
 * Displays data access and modification audit trails with offline support
 * and multi-tenant isolation
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useAuditLog } from '../../hooks/useAuditLog';
import { ScrollArea } from "@/components/ui/ScrollArea/ScrollArea";
import { format } from 'date-fns';
import { Input } from '@/components/ui/Input/Input';
import { DateRangePicker } from "@/components/ui/DateRangePicker/DateRangePicker";
import { useI18n } from '@/lib/i18n/lib/config';
import { useNetworkStatus } from '@/lib/offline/hooks';
import { AuditEntry, PrivacyComponentProps } from '../../types/privacy';
import { Alert } from '@/components/ui/alert';

export const AuditLog: React.FC<PrivacyComponentProps> = ({
  residentId,
  familyMemberId,
  organizationId,
}) => {
  const { t } = useI18n('family-portal');
  const { isOnline } = useNetworkStatus();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [category, setCategory] = useState<string>('all');
  const [action, setAction] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAuditLog({
    residentId,
    organizationId,
    page,
    startDate: dateRange[0] || undefined,
    endDate: dateRange[1] || undefined,
    category: category === 'all' ? undefined : category,
    action: action === 'all' ? undefined : action,
  });

  if (error) {
    return (
      <Alert variant="destructive">
        {t('audit.error')}
      </Alert>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('audit.title')}</h2>
        {!isOnline && (
          <Badge variant="warning">
            {t('common.offlineMode')}
          </Badge>
        )}
      </div>

      <div className="flex gap-4 flex-wrap">
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          placeholder={t('audit.selectDateRange')}
        />
        
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('audit.selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('audit.allCategories')}</SelectItem>
            <SelectItem value="medical">{t('audit.medical')}</SelectItem>
            <SelectItem value="personal">{t('audit.personal')}</SelectItem>
            <SelectItem value="financial">{t('audit.financial')}</SelectItem>
            <SelectItem value="communication">{t('audit.communication')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('audit.selectAction')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('audit.allActions')}</SelectItem>
            <SelectItem value="view">{t('audit.view')}</SelectItem>
            <SelectItem value="create">{t('audit.create')}</SelectItem>
            <SelectItem value="update">{t('audit.update')}</SelectItem>
            <SelectItem value="delete">{t('audit.delete')}</SelectItem>
            <SelectItem value="export">{t('audit.export')}</SelectItem>
            <SelectItem value="share">{t('audit.share')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner" />
          </div>
        ) : (
          <div className="space-y-2">
            {data?.entries.map((entry) => (
              <Card key={entry.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getBadgeVariant(entry.action)}>
                      {t(`audit.${entry.action}`)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.timestamp), 'PPpp')}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {t(`audit.${entry.category}`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm">
                  {t('audit.resourceAccessed', {
                    user: entry.user.name,
                    resource: entry.resource.name,
                  })}
                </p>
                {entry.details.reason && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('audit.reason')}: {entry.details.reason}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          {t('common.previous')}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t('common.page')} {page}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={!data?.entries.length || data.entries.length < 20 || isLoading}
        >
          {t('common.next')}
        </Button>
      </div>
    </Card>
  );
};

const getBadgeVariant = (action: string) => {
  switch (action) {
    case 'create':
      return 'success';
    case 'update':
      return 'warning';
    case 'delete':
      return 'destructive';
    default:
      return 'default';
  }
};

export default AuditLog;


