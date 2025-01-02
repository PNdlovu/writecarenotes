import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Save,
  Clock,
  Shield,
  Eye,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/Badge/Badge';
import { toast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface ShareTemplate {
  id: string;
  name: string;
  permission: 'VIEW' | 'EDIT';
  expiryDays: number;
  staffIds: string[];
}

interface BulkSharingProps {
  documentIds: string[];
  onClose: () => void;
}

export function BulkSharing({ documentIds, onClose }: BulkSharingProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [expiryDays, setExpiryDays] = useState('7');
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  // Fetch available staff
  const { data: availableStaff } = useQuery<Staff[]>({
    queryKey: ['available-staff'],
    queryFn: async () => {
      const response = await fetch('/api/staff/available');
      if (!response.ok) throw new Error('Failed to fetch staff');
      return response.json();
    },
  });

  // Fetch share templates
  const { data: shareTemplates } = useQuery<ShareTemplate[]>({
    queryKey: ['share-templates'],
    queryFn: async () => {
      const response = await fetch('/api/documents/share-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Bulk share mutation
  const bulkShareMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/documents/bulk-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds,
          staffIds: selectedStaff,
          permission,
          expiryDays: parseInt(expiryDays),
        }),
      });
      if (!response.ok) throw new Error('Failed to share documents');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-shares'] });
      toast({
        title: t('sharing.bulkShareSuccess'),
        description: t('sharing.bulkShareSuccessDescription', {
          count: documentIds.length,
          staff: selectedStaff.length,
        }),
      });
      onClose();
    },
    onError: () => {
      toast({
        title: t('sharing.bulkShareError'),
        variant: 'destructive',
      });
    },
  });

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/documents/share-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          permission,
          expiryDays: parseInt(expiryDays),
          staffIds: selectedStaff,
        }),
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-templates'] });
      setShowSaveTemplate(false);
      toast({
        title: t('sharing.templateSaved'),
        description: t('sharing.templateSavedDescription'),
      });
    },
  });

  // Apply template
  const handleApplyTemplate = (template: ShareTemplate) => {
    setSelectedStaff(template.staffIds);
    setPermission(template.permission);
    setExpiryDays(template.expiryDays.toString());
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t('sharing.bulkShare', { count: documentIds.length })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Templates Section */}
          {shareTemplates?.length > 0 && (
            <div className="space-y-2">
              <Label>{t('sharing.templates')}</Label>
              <div className="flex flex-wrap gap-2">
                {shareTemplates.map((template) => (
                  <Badge
                    key={template.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => handleApplyTemplate(template)}
                  >
                    {template.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Staff Selection */}
          <div className="space-y-2">
            <Label>{t('sharing.selectStaff')}</Label>
            <Select
              onValueChange={(staffId) =>
                setSelectedStaff((prev) =>
                  prev.includes(staffId)
                    ? prev.filter((id) => id !== staffId)
                    : [...prev, staffId]
                )
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t('sharing.selectStaffPlaceholder')}
                />
              </SelectTrigger>
              <SelectContent>
                {availableStaff?.map((staff) => (
                  <SelectItem
                    key={staff.id}
                    value={staff.id}
                    className="flex items-center space-x-2"
                  >
                    <Check
                      className={`h-4 w-4 ${
                        selectedStaff.includes(staff.id)
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    />
                    <span>{staff.name}</span>
                    <span className="text-muted-foreground">
                      ({staff.role})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Staff Table */}
          {selectedStaff.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('sharing.staff')}</TableHead>
                    <TableHead>{t('sharing.role')}</TableHead>
                    <TableHead className="text-right">
                      {t('sharing.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStaff.map((staffId) => {
                    const staff = availableStaff?.find(
                      (s) => s.id === staffId
                    );
                    if (!staff) return null;
                    return (
                      <TableRow key={staff.id}>
                        <TableCell>{staff.name}</TableCell>
                        <TableCell>{staff.role}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedStaff((prev) =>
                                prev.filter((id) => id !== staff.id)
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Share Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{t('sharing.permission')}</Label>
              <Switch
                checked={permission === 'EDIT'}
                onCheckedChange={(checked) =>
                  setPermission(checked ? 'EDIT' : 'VIEW')
                }
              />
              <span>
                {permission === 'EDIT' ? (
                  <Edit2 className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                {t(`sharing.permission.${permission.toLowerCase()}`)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label>{t('sharing.expiryDays')}</Label>
                <Input
                  type="number"
                  min="1"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowSaveTemplate(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('sharing.saveAsTemplate')}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => bulkShareMutation.mutate()}
              disabled={selectedStaff.length === 0}
            >
              <Users className="h-4 w-4 mr-2" />
              {t('sharing.shareWithSelected')}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Save Template Dialog */}
      <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sharing.saveTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('sharing.templateName')}</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder={t('sharing.templateNamePlaceholder')}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveTemplate(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                onClick={() => saveTemplateMutation.mutate()}
                disabled={!templateName}
              >
                <Save className="h-4 w-4 mr-2" />
                {t('sharing.saveTemplate')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}


