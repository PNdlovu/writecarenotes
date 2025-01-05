import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Archive,
  Clock,
  AlertTriangle,
  History,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Calendar } from '@/components/ui/Calendar';

interface RetentionPolicy {
  id: string;
  name: string;
  retentionPeriod: number;
  autoArchive: boolean;
  autoDelete: boolean;
  documentTypes: string[];
  regions: string[];
}

interface DocumentRetentionProps {
  documentId?: string;
  isGlobalSettings?: boolean;
}

export function DocumentRetention({
  documentId,
  isGlobalSettings = false,
}: DocumentRetentionProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [showPolicyDialog, setShowPolicyDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<RetentionPolicy | null>(
    null
  );

  // Fetch retention policies
  const { data: policies } = useQuery({
    queryKey: ['retentionPolicies'],
    queryFn: async () => {
      const response = await fetch('/api/documents/retention-policies');
      if (!response.ok) throw new Error('Failed to fetch retention policies');
      return response.json();
    },
  });

  // Create/Update retention policy
  const policyMutation = useMutation({
    mutationFn: async (policy: Partial<RetentionPolicy>) => {
      const response = await fetch('/api/documents/retention-policies', {
        method: policy.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy),
      });
      if (!response.ok) throw new Error('Failed to save retention policy');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retentionPolicies'] });
      toast({
        title: t('retention.policySaved'),
        description: t('retention.policySavedDescription'),
      });
      setShowPolicyDialog(false);
    },
  });

  // Apply retention policy to document
  const applyPolicyMutation = useMutation({
    mutationFn: async ({
      documentId,
      policyId,
    }: {
      documentId: string;
      policyId: string;
    }) => {
      const response = await fetch(
        `/api/documents/${documentId}/retention-policy`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ policyId }),
        }
      );
      if (!response.ok) throw new Error('Failed to apply retention policy');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('retention.policyApplied'),
        description: t('retention.policyAppliedDescription'),
      });
    },
  });

  // Archive document
  const archiveMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/documents/${documentId}/archive`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to archive document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('retention.documentArchived'),
        description: t('retention.documentArchivedDescription'),
      });
    },
  });

  const handleCreatePolicy = (formData: FormData) => {
    const policy = {
      name: formData.get('name') as string,
      retentionPeriod: parseInt(formData.get('retentionPeriod') as string),
      autoArchive: formData.get('autoArchive') === 'true',
      autoDelete: formData.get('autoDelete') === 'true',
      documentTypes: (formData.get('documentTypes') as string).split(','),
      regions: (formData.get('regions') as string).split(','),
    };
    policyMutation.mutate(policy);
  };

  return (
    <div className="space-y-6">
      {isGlobalSettings ? (
        <>
          {/* Global Retention Settings */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {t('retention.globalSettings')}
            </h2>
            <Button onClick={() => setShowPolicyDialog(true)}>
              {t('retention.createPolicy')}
            </Button>
          </div>

          {/* Retention Policies Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('retention.policyName')}</TableHead>
                  <TableHead>{t('retention.period')}</TableHead>
                  <TableHead>{t('retention.autoArchive')}</TableHead>
                  <TableHead>{t('retention.autoDelete')}</TableHead>
                  <TableHead>{t('retention.documentTypes')}</TableHead>
                  <TableHead>{t('retention.regions')}</TableHead>
                  <TableHead>{t('retention.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies?.map((policy: RetentionPolicy) => (
                  <TableRow key={policy.id}>
                    <TableCell>{policy.name}</TableCell>
                    <TableCell>
                      {t('retention.periodValue', {
                        value: policy.retentionPeriod,
                      })}
                    </TableCell>
                    <TableCell>
                      {policy.autoArchive ? (
                        <Badge variant="success">
                          {t('retention.enabled')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t('retention.disabled')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {policy.autoDelete ? (
                        <Badge variant="destructive">
                          {t('retention.enabled')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {t('retention.disabled')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {policy.documentTypes.map((type) => (
                        <Badge key={type} variant="outline" className="mr-1">
                          {type}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      {policy.regions.map((region) => (
                        <Badge key={region} variant="outline" className="mr-1">
                          {region}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPolicy(policy)}
                      >
                        {t('retention.edit')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      ) : (
        <>
          {/* Single Document Retention */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() =>
                  documentId && archiveMutation.mutate(documentId)
                }
              >
                <Archive className="h-4 w-4 mr-2" />
                {t('retention.archive')}
              </Button>
              <Select
                onValueChange={(policyId) =>
                  documentId &&
                  applyPolicyMutation.mutate({ documentId, policyId })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('retention.selectPolicy')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {policies?.map((policy: RetentionPolicy) => (
                    <SelectItem key={policy.id} value={policy.id}>
                      {policy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Policy Dialog */}
      <Dialog
        open={showPolicyDialog || !!selectedPolicy}
        onOpenChange={(open) => {
          setShowPolicyDialog(open);
          if (!open) setSelectedPolicy(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPolicy
                ? t('retention.editPolicy')
                : t('retention.createPolicy')}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreatePolicy(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('retention.policyName')}</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedPolicy?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retentionPeriod">
                  {t('retention.period')}
                </Label>
                <Input
                  id="retentionPeriod"
                  name="retentionPeriod"
                  type="number"
                  defaultValue={selectedPolicy?.retentionPeriod}
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="autoArchive"
                  name="autoArchive"
                  defaultChecked={selectedPolicy?.autoArchive}
                />
                <Label htmlFor="autoArchive">
                  {t('retention.autoArchive')}
                </Label>
              </div>
              <div className="space-x-2">
                <input
                  type="checkbox"
                  id="autoDelete"
                  name="autoDelete"
                  defaultChecked={selectedPolicy?.autoDelete}
                />
                <Label htmlFor="autoDelete">
                  {t('retention.autoDelete')}
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentTypes">
                {t('retention.documentTypes')}
              </Label>
              <Input
                id="documentTypes"
                name="documentTypes"
                defaultValue={selectedPolicy?.documentTypes.join(',')}
                placeholder={t('retention.documentTypesPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regions">{t('retention.regions')}</Label>
              <Input
                id="regions"
                name="regions"
                defaultValue={selectedPolicy?.regions.join(',')}
                placeholder={t('retention.regionsPlaceholder')}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPolicyDialog(false);
                  setSelectedPolicy(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {selectedPolicy ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}


