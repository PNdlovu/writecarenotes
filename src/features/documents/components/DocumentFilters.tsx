import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { Button } from '@/components/ui/Button/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface DocumentFiltersProps {
  filters: {
    type?: DocumentType;
    status?: DocumentStatus;
    categoryId?: string;
    tags?: string[];
    startDate?: Date;
    endDate?: Date;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

export default function DocumentFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: DocumentFiltersProps) {
  const { t } = useTranslation('documents');

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['documentCategories'],
    queryFn: async () => {
      const response = await fetch('/api/document-categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  // Fetch tags
  const { data: tags } = useQuery({
    queryKey: ['documentTags'],
    queryFn: async () => {
      const response = await fetch('/api/document-tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Type Filter */}
        <div className="space-y-2">
          <Label>{t('filters.type')}</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange('type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('filters.allTypes')}
              </SelectItem>
              {Object.values(DocumentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {t(`documentTypes.${type.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>{t('filters.status')}</Label>
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('filters.allStatuses')}
              </SelectItem>
              {Object.values(DocumentStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`status.${status.toLowerCase()}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>{t('filters.category')}</Label>
          <Select
            value={filters.categoryId}
            onValueChange={(value) => handleFilterChange('categoryId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('filters.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t('filters.allCategories')}
              </SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter */}
        <div className="space-y-2">
          <Label>{t('filters.tags')}</Label>
          <ScrollArea className="h-[200px] rounded-md border p-4">
            <div className="space-y-2">
              {tags?.map((tag) => (
                <div key={tag.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={filters.tags?.includes(tag.id)}
                    onChange={(e) => {
                      const newTags = e.target.checked
                        ? [...(filters.tags || []), tag.id]
                        : (filters.tags || []).filter((id) => id !== tag.id);
                      handleFilterChange('tags', newTags);
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={`tag-${tag.id}`}
                    className="flex items-center space-x-2"
                  >
                    <Badge
                      style={{
                        backgroundColor: tag.color,
                        color: 'white',
                      }}
                    >
                      {tag.name}
                    </Badge>
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>{t('filters.dateRange')}</Label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={filters.startDate?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                handleFilterChange(
                  'startDate',
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={filters.endDate?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                handleFilterChange(
                  'endDate',
                  e.target.value ? new Date(e.target.value) : undefined
                )
              }
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onClearFilters}
      >
        {t('filters.clearAll')}
      </Button>
    </div>
  );
}


