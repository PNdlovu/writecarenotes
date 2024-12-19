import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Trash2,
  Edit2,
  Copy,
  Users,
  Shield,
  Globe,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ShareTemplate {
  id: string;
  name: string;
  description: string;
  region?: 'england' | 'wales' | 'scotland' | 'dublin' | 'belfast';
  accessLevel: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';
  permission: 'VIEW' | 'EDIT';
  expiryDays: number;
  departments: string[];
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

interface ShareTemplatesProps {
  onSelectTemplate?: (template: ShareTemplate) => void;
}

export function ShareTemplates({ onSelectTemplate }: ShareTemplatesProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShareTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    region: '',
    accessLevel: 'PRIVATE',
    permission: 'VIEW',
    expiryDays: 7,
    departments: [] as string[],
    roles: [] as string[],
  });

  // Fetch templates
  const { data: templates } = useQuery<ShareTemplate[]>({
    queryKey: ['share-templates'],
    queryFn: async () => {
      const response = await fetch('/api/documents/share-templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    },
  });

  // Fetch departments and roles for selection
  const { data: departments } = useQuery<string[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  const { data: roles } = useQuery<string[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      return response.json();
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<ShareTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/documents/share-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to create template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-templates'] });
      setShowCreateDialog(false);
      resetForm();
      toast({
        title: t('templates.createSuccess'),
        description: t('templates.createSuccessDescription'),
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({
      id,
      template,
    }: {
      id: string;
      template: Partial<ShareTemplate>;
    }) => {
      const response = await fetch(`/api/documents/share-templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-templates'] });
      setEditingTemplate(null);
      resetForm();
      toast({
        title: t('templates.updateSuccess'),
        description: t('templates.updateSuccessDescription'),
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/share-templates/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-templates'] });
      toast({
        title: t('templates.deleteSuccess'),
        description: t('templates.deleteSuccessDescription'),
      });
    },
  });

  const resetForm = () => {
    setTemplateForm({
      name: '',
      description: '',
      region: '',
      accessLevel: 'PRIVATE',
      permission: 'VIEW',
      expiryDays: 7,
      departments: [],
      roles: [],
    });
  };

  const handleSubmit = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        template: templateForm,
      });
    } else {
      createTemplateMutation.mutate(templateForm as any);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">{t('templates.title')}</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Save className="h-4 w-4 mr-2" />
          {t('templates.create')}
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates?.map((template) => (
          <Card key={template.id} className="relative group">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{template.name}</span>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTemplate(template);
                      setTemplateForm({
                        name: template.name,
                        description: template.description,
                        region: template.region || '',
                        accessLevel: template.accessLevel,
                        permission: template.permission,
                        expiryDays: template.expiryDays,
                        departments: template.departments,
                        roles: template.roles,
                      });
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplateMutation.mutate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTemplate?.(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {template.region && (
                    <Badge variant="outline">
                      {t(`regions.${template.region}`)}
                    </Badge>
                  )}
                  <Badge
                    variant={
                      template.accessLevel === 'PUBLIC'
                        ? 'default'
                        : template.accessLevel === 'PRIVATE'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {template.accessLevel === 'PUBLIC' && (
                      <Globe className="h-3 w-3 mr-1" />
                    )}
                    {template.accessLevel === 'PRIVATE' && (
                      <Users className="h-3 w-3 mr-1" />
                    )}
                    {template.accessLevel === 'RESTRICTED' && (
                      <Shield className="h-3 w-3 mr-1" />
                    )}
                    {t(`templates.accessLevel.${template.accessLevel.toLowerCase()}`)}
                  </Badge>
                  <Badge variant="outline">
                    {template.permission === 'EDIT' ? (
                      <Edit2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Eye className="h-3 w-3 mr-1" />
                    )}
                    {t(`templates.permission.${template.permission.toLowerCase()}`)}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {t('templates.expires', { days: template.expiryDays })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTemplate(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate
                ? t('templates.edit')
                : t('templates.create')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('templates.name')}</Label>
              <Input
                value={templateForm.name}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder={t('templates.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('templates.description')}</Label>
              <Input
                value={templateForm.description}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t('templates.descriptionPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('templates.region')}</Label>
              <Select
                value={templateForm.region}
                onValueChange={(value) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    region: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('templates.selectRegion')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    {t('templates.allRegions')}
                  </SelectItem>
                  <SelectItem value="england">
                    {t('regions.england')}
                  </SelectItem>
                  <SelectItem value="wales">{t('regions.wales')}</SelectItem>
                  <SelectItem value="scotland">
                    {t('regions.scotland')}
                  </SelectItem>
                  <SelectItem value="dublin">
                    {t('regions.dublin')}
                  </SelectItem>
                  <SelectItem value="belfast">
                    {t('regions.belfast')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('templates.accessLevel')}</Label>
                <Select
                  value={templateForm.accessLevel}
                  onValueChange={(value: any) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      accessLevel: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">
                      {t('templates.accessLevel.public')}
                    </SelectItem>
                    <SelectItem value="PRIVATE">
                      {t('templates.accessLevel.private')}
                    </SelectItem>
                    <SelectItem value="RESTRICTED">
                      {t('templates.accessLevel.restricted')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('templates.permission')}</Label>
                <Select
                  value={templateForm.permission}
                  onValueChange={(value: any) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      permission: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEW">
                      {t('templates.permission.view')}
                    </SelectItem>
                    <SelectItem value="EDIT">
                      {t('templates.permission.edit')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('templates.expiryDays')}</Label>
              <Input
                type="number"
                min={1}
                value={templateForm.expiryDays}
                onChange={(e) =>
                  setTemplateForm((prev) => ({
                    ...prev,
                    expiryDays: parseInt(e.target.value),
                  }))
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit}>
                {editingTemplate ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


