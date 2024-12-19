import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Lock,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  Key,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface SecuritySettings {
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  expiryEnabled: boolean;
  expiryDays: number;
  watermarkEnabled: boolean;
  watermarkText: string;
  trackingEnabled: boolean;
  gdprCompliant: boolean;
  sensitiveInfo: boolean;
  auditLogEnabled: boolean;
  retentionPeriod: number;
  encryptionLevel: 'STANDARD' | 'HIGH' | 'MAXIMUM';
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}

interface DocumentSecurityProps {
  documentId: string;
  userPermission: 'VIEW' | 'EDIT' | 'ADMIN';
}

export function DocumentSecurity({
  documentId,
  userPermission,
}: DocumentSecurityProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Fetch security settings
  const { data: settings } = useQuery<SecuritySettings>({
    queryKey: ['document-security', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/security`);
      if (!response.ok) throw new Error('Failed to fetch security settings');
      return response.json();
    },
  });

  // Fetch audit log
  const { data: auditLog } = useQuery<AuditLogEntry[]>({
    queryKey: ['document-audit-log', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/audit-log`);
      if (!response.ok) throw new Error('Failed to fetch audit log');
      return response.json();
    },
  });

  // Update security settings mutation
  const updateSecurityMutation = useMutation({
    mutationFn: async (newSettings: Partial<SecuritySettings>) => {
      const response = await fetch(`/api/documents/${documentId}/security`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!response.ok) throw new Error('Failed to update security settings');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-security'] });
      toast({
        title: t('security.settingsUpdated'),
        description: t('security.settingsUpdatedDescription'),
      });
    },
  });

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Access Control */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t('security.accessControl')}
        </h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.accessLevel')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.accessLevelDescription')}
              </p>
            </div>
            <Select
              value={settings.accessLevel}
              onValueChange={(value) =>
                updateSecurityMutation.mutate({
                  accessLevel: value as SecuritySettings['accessLevel'],
                })
              }
              disabled={userPermission !== 'ADMIN'}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">
                  {t('security.accessLevels.public')}
                </SelectItem>
                <SelectItem value="PRIVATE">
                  {t('security.accessLevels.private')}
                </SelectItem>
                <SelectItem value="RESTRICTED">
                  {t('security.accessLevels.restricted')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Encryption Level */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.encryption')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.encryptionDescription')}
              </p>
            </div>
            <Select
              value={settings.encryptionLevel}
              onValueChange={(value) =>
                updateSecurityMutation.mutate({
                  encryptionLevel: value as SecuritySettings['encryptionLevel'],
                })
              }
              disabled={userPermission !== 'ADMIN'}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STANDARD">
                  {t('security.encryptionLevels.standard')}
                </SelectItem>
                <SelectItem value="HIGH">
                  {t('security.encryptionLevels.high')}
                </SelectItem>
                <SelectItem value="MAXIMUM">
                  {t('security.encryptionLevels.maximum')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Document Protection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t('security.documentProtection')}
        </h3>
        <div className="grid gap-4">
          {/* Expiry Settings */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.expirySettings')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.expirySettingsDescription')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Switch
                checked={settings.expiryEnabled}
                onCheckedChange={(checked) =>
                  updateSecurityMutation.mutate({ expiryEnabled: checked })
                }
                disabled={userPermission !== 'ADMIN'}
              />
              {settings.expiryEnabled && (
                <Input
                  type="number"
                  value={settings.expiryDays}
                  onChange={(e) =>
                    updateSecurityMutation.mutate({
                      expiryDays: parseInt(e.target.value),
                    })
                  }
                  className="w-20"
                  min={1}
                  disabled={userPermission !== 'ADMIN'}
                />
              )}
            </div>
          </div>

          {/* Watermark */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.watermark')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.watermarkDescription')}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Switch
                checked={settings.watermarkEnabled}
                onCheckedChange={(checked) =>
                  updateSecurityMutation.mutate({ watermarkEnabled: checked })
                }
                disabled={userPermission !== 'ADMIN'}
              />
              {settings.watermarkEnabled && (
                <Input
                  value={settings.watermarkText}
                  onChange={(e) =>
                    updateSecurityMutation.mutate({
                      watermarkText: e.target.value,
                    })
                  }
                  className="w-40"
                  placeholder={t('security.watermarkPlaceholder')}
                  disabled={userPermission !== 'ADMIN'}
                />
              )}
            </div>
          </div>

          {/* Tracking */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.tracking')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.trackingDescription')}
              </p>
            </div>
            <Switch
              checked={settings.trackingEnabled}
              onCheckedChange={(checked) =>
                updateSecurityMutation.mutate({ trackingEnabled: checked })
              }
              disabled={userPermission !== 'ADMIN'}
            />
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('security.compliance')}</h3>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.gdprCompliant')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.gdprCompliantDescription')}
              </p>
            </div>
            <Switch
              checked={settings.gdprCompliant}
              onCheckedChange={(checked) =>
                updateSecurityMutation.mutate({ gdprCompliant: checked })
              }
              disabled={userPermission !== 'ADMIN'}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.sensitiveInfo')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.sensitiveInfoDescription')}
              </p>
            </div>
            <Switch
              checked={settings.sensitiveInfo}
              onCheckedChange={(checked) =>
                updateSecurityMutation.mutate({ sensitiveInfo: checked })
              }
              disabled={userPermission !== 'ADMIN'}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t('security.retentionPeriod')}</p>
              <p className="text-sm text-muted-foreground">
                {t('security.retentionPeriodDescription')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={settings.retentionPeriod}
                onChange={(e) =>
                  updateSecurityMutation.mutate({
                    retentionPeriod: parseInt(e.target.value),
                  })
                }
                className="w-20"
                min={1}
                disabled={userPermission !== 'ADMIN'}
              />
              <span className="text-sm text-muted-foreground">
                {t('security.months')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{t('security.auditLog')}</h3>
          <Button
            variant="outline"
            onClick={() => setShowAuditLog(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('security.viewAuditLog')}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{t('security.enableAuditLog')}</p>
            <p className="text-sm text-muted-foreground">
              {t('security.enableAuditLogDescription')}
            </p>
          </div>
          <Switch
            checked={settings.auditLogEnabled}
            onCheckedChange={(checked) =>
              updateSecurityMutation.mutate({ auditLogEnabled: checked })
            }
            disabled={userPermission !== 'ADMIN'}
          />
        </div>
      </div>

      {/* Audit Log Dialog */}
      <Dialog open={showAuditLog} onOpenChange={setShowAuditLog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{t('security.auditLog')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {auditLog?.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="font-medium">{entry.userName}</p>
                  <p className="text-sm">{entry.action}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.details}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(entry.timestamp), 'PPp')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.ipAddress}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


