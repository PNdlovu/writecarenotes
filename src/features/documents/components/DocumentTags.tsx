import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Plus,
  X,
  Settings,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Form/Input';
import { Label } from '@/components/ui/Form/Label';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { toast } from '@/components/ui/Toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  cn
} from '@/lib/utils';

interface Tag {
  id: string;
  name: string;
  color: string;
  category: string;
  description?: string;
  usageCount: number;
}

interface DocumentTag {
  id: string;
  tagId: string;
  documentId: string;
  addedBy: {
    name: string;
  };
  addedAt: string;
}

interface DocumentTagsProps {
  documentId?: string;
  isGlobalSettings?: boolean;
}

export function DocumentTags({
  documentId,
  isGlobalSettings = false,
}: DocumentTagsProps) {
  const { t } = useTranslation('documents');
  const queryClient = useQueryClient();
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch all tags
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const response = await fetch('/api/documents/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    },
  });

  // Fetch document tags
  const { data: documentTags } = useQuery({
    queryKey: ['documentTags', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}/tags`);
      if (!response.ok) throw new Error('Failed to fetch document tags');
      return response.json();
    },
    enabled: !!documentId,
  });

  // Create/Update tag mutation
  const tagMutation = useMutation({
    mutationFn: async (tag: Partial<Tag>) => {
      const response = await fetch('/api/documents/tags', {
        method: tag.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tag),
      });
      if (!response.ok) throw new Error('Failed to save tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      toast({
        title: t('tags.tagSaved'),
        description: t('tags.tagSavedDescription'),
      });
      setShowTagDialog(false);
      setSelectedTag(null);
    },
  });

  // Add tag to document mutation
  const addTagMutation = useMutation({
    mutationFn: async ({
      documentId,
      tagId,
    }: {
      documentId: string;
      tagId: string;
    }) => {
      const response = await fetch(`/api/documents/${documentId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId }),
      });
      if (!response.ok) throw new Error('Failed to add tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTags'] });
      setOpen(false);
      toast({
        title: t('tags.tagAdded'),
        description: t('tags.tagAddedDescription'),
      });
    },
  });

  // Remove tag from document mutation
  const removeTagMutation = useMutation({
    mutationFn: async ({
      documentId,
      tagId,
    }: {
      documentId: string;
      tagId: string;
    }) => {
      const response = await fetch(
        `/api/documents/${documentId}/tags/${tagId}`,
        {
          method: 'DELETE',
        }
      );
      if (!response.ok) throw new Error('Failed to remove tag');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentTags'] });
      toast({
        title: t('tags.tagRemoved'),
        description: t('tags.tagRemovedDescription'),
      });
    },
  });

  const handleCreateTag = (formData: FormData) => {
    const tag = {
      id: selectedTag?.id,
      name: formData.get('name') as string,
      color: formData.get('color') as string,
      category: formData.get('category') as string,
      description: formData.get('description') as string,
    };
    tagMutation.mutate(tag);
  };

  return (
    <div className="space-y-6">
      {isGlobalSettings ? (
        <>
          {/* Global Tag Management */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {t('tags.globalSettings')}
            </h2>
            <Button onClick={() => setShowTagDialog(true)}>
              {t('tags.createTag')}
            </Button>
          </div>

          {/* Tags Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tags.name')}</TableHead>
                  <TableHead>{t('tags.category')}</TableHead>
                  <TableHead>{t('tags.description')}</TableHead>
                  <TableHead>{t('tags.usageCount')}</TableHead>
                  <TableHead>{t('tags.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags?.map((tag: Tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor: tag.color,
                          color: getContrastColor(tag.color),
                        }}
                      >
                        {tag.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{tag.category}</TableCell>
                    <TableCell>{tag.description}</TableCell>
                    <TableCell>{tag.usageCount}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTag(tag);
                          setShowTagDialog(true);
                        }}
                      >
                        {t('tags.edit')}
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
          {/* Document Tags */}
          <div className="space-y-4">
            {/* Current Tags */}
            <div className="flex flex-wrap gap-2">
              {documentTags?.map((docTag: DocumentTag) => {
                const tag = tags?.find((t) => t.id === docTag.tagId);
                return (
                  tag && (
                    <Badge
                      key={docTag.id}
                      style={{
                        backgroundColor: tag.color,
                        color: getContrastColor(tag.color),
                      }}
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() =>
                          documentId &&
                          removeTagMutation.mutate({
                            documentId,
                            tagId: tag.id,
                          })
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                );
              })}
            </div>

            {/* Add Tag */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('tags.addTag')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput
                    placeholder={t('tags.searchTags')}
                    className="h-9"
                  />
                  <CommandEmpty>{t('tags.noTags')}</CommandEmpty>
                  <CommandGroup>
                    {tags?.map((tag) => (
                      <CommandItem
                        key={tag.id}
                        onSelect={() =>
                          documentId &&
                          addTagMutation.mutate({
                            documentId,
                            tagId: tag.id,
                          })
                        }
                      >
                        <Badge
                          style={{
                            backgroundColor: tag.color,
                            color: getContrastColor(tag.color),
                          }}
                        >
                          {tag.name}
                        </Badge>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {tag.category}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}

      {/* Create/Edit Tag Dialog */}
      <Dialog
        open={showTagDialog}
        onOpenChange={(open) => {
          setShowTagDialog(open);
          if (!open) setSelectedTag(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTag
                ? t('tags.editTag')
                : t('tags.createTag')}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTag(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">{t('tags.name')}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={selectedTag?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">{t('tags.color')}</Label>
              <Input
                id="color"
                name="color"
                type="color"
                defaultValue={selectedTag?.color || '#000000'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('tags.category')}</Label>
              <Input
                id="category"
                name="category"
                defaultValue={selectedTag?.category}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('tags.description')}
              </Label>
              <Input
                id="description"
                name="description"
                defaultValue={selectedTag?.description}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowTagDialog(false);
                  setSelectedTag(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {selectedTag ? t('common.save') : t('common.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to determine text color based on background color
function getContrastColor(hexcolor: string) {
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}


