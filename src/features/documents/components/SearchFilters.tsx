import { useTranslation } from 'next-i18next';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { SearchFilters as SearchFiltersType } from '@/lib/documents/types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DatePicker } from '@/components/ui/date-picker';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export default function SearchFilters({
  filters,
  onFilterChange,
  onClearFilters,
  onClose,
}: SearchFiltersProps) {
  const { t } = useTranslation('documents');

  const handleChange = (
    field: keyof SearchFiltersType,
    value: string | Date | null
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">
          {t('search.filters.title')}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Close filters"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('search.filters.type')}
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleChange('type', e.target.value as DocumentType)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('search.filters.all')}</option>
            {Object.values(DocumentType).map((type) => (
              <option key={type} value={type}>
                {t(`documentTypes.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('search.filters.status')}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value as DocumentStatus)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t('search.filters.all')}</option>
            {Object.values(DocumentStatus).map((status) => (
              <option key={status} value={status}>
                {t(`status.${status.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('search.filters.dateFrom')}
          </label>
          <DatePicker
            value={filters.dateFrom}
            onChange={(date) => handleChange('dateFrom', date)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('search.filters.dateTo')}
          </label>
          <DatePicker
            value={filters.dateTo}
            onChange={(date) => handleChange('dateTo', date)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('search.filters.categories')}
          </label>
          <input
            type="text"
            value={filters.categories || ''}
            onChange={(e) => handleChange('categories', e.target.value)}
            placeholder="Category1, Category2"
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('search.filters.tags')}
          </label>
          <input
            type="text"
            value={filters.tags || ''}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="Tag1, Tag2"
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t p-4 space-x-2 flex justify-end">
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          {t('search.filters.clear')}
        </button>
        <button
          onClick={() => onFilterChange(filters)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          {t('search.filters.apply')}
        </button>
      </div>
    </div>
  );
}


