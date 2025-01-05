import { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery } from '@tanstack/react-query';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { searchDocuments, getPopularSearchTerms, getSearchSuggestions } from '@/lib/documents/search';
import { SearchFilters as SearchFiltersType } from '@/lib/documents/types';
import SearchSuggestions from './SearchSuggestions';
import SearchFilters from './SearchFilters';
import SearchResults from './SearchResults';
import { debounce } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

const initialFilters: SearchFiltersType = {
  type: null,
  status: null,
  dateRange: null,
  categories: [],
  tags: [],
  isLatest: true,
};

export default function DocumentSearch() {
  const { t } = useTranslation('documents');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { data: session } = useSession();
  const organizationId = session?.user?.organizationId;
  const staffId = session?.user?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documents', 'search', searchQuery, filters],
    queryFn: async () => {
      if (!organizationId || !staffId) return null;
      return searchDocuments(
        organizationId,
        staffId,
        searchQuery,
        filters,
        {
          page: 1,
          pageSize: 10,
          includeContent: true,
          highlightResults: true,
        }
      );
    },
    enabled: Boolean(searchQuery || Object.values(filters).some(Boolean)) && Boolean(organizationId && staffId),
  });

  const { data: suggestions } = useQuery({
    queryKey: ['documents', 'suggestions', searchQuery],
    queryFn: () => organizationId ? getSearchSuggestions(organizationId, searchQuery) : [],
    enabled: Boolean(searchQuery && searchQuery.length >= 2 && organizationId),
  });

  const { data: popularSearches } = useQuery({
    queryKey: ['documents', 'popular'],
    queryFn: () => organizationId ? getPopularSearchTerms(organizationId) : [],
    enabled: Boolean(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(event.target.value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    refetch();
  };

  const handleFilterChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setIsFiltersOpen(false);
    refetch();
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    refetch();
  };

  if (!session) {
    return null; // Or show a login prompt
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full px-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t('search.placeholder')}
            onChange={handleSearchChange}
            defaultValue={searchQuery}
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            aria-label="filters"
          >
            <FunnelIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <SearchSuggestions
          suggestions={suggestions}
          onSuggestionClick={handleSuggestionClick}
          isPopular={false}
        />
      )}

      {!searchQuery && popularSearches && popularSearches.length > 0 && (
        <SearchSuggestions
          suggestions={popularSearches.map(p => p.term)}
          onSuggestionClick={handleSuggestionClick}
          isPopular={true}
        />
      )}

      {/* Filter Drawer */}
      {isFiltersOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div
            className={cn(
              "fixed bg-white z-50 transition-transform duration-300",
              isMobile
                ? "bottom-0 left-0 right-0 rounded-t-xl max-h-[80vh] transform translate-y-0"
                : "right-0 top-0 bottom-0 w-80"
            )}
          >
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onClose={() => setIsFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      <SearchResults
        results={searchResults?.results || []}
        isLoading={isLoading}
        error={error as Error}
        searchTime={searchResults?.executionTime ? searchResults.executionTime / 1000 : undefined}
      />
    </div>
  );
}


