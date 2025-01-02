/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base search hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React hook for performing knowledge base searches with filters,
 * suggestions, and offline support.
 */

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { SearchService } from '../services/searchService'
import { 
  type SearchQuery,
  type SearchFilters,
  type SortOptions,
  type SearchResults
} from '../types'
import { useDebounce } from '@/hooks/use-debounce'

const searchService = new SearchService()
const ITEMS_PER_PAGE = 20

export function useSearch() {
  const [term, setTerm] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [sort, setSort] = useState<SortOptions>({
    field: 'relevance',
    order: 'desc'
  })

  const debouncedTerm = useDebounce(term, 300)

  // Perform search
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['kb-search', debouncedTerm, filters, sort],
    queryFn: ({ pageParam = 1 }) =>
      searchService.search({
        term: debouncedTerm,
        filters,
        pagination: {
          page: pageParam,
          limit: ITEMS_PER_PAGE
        },
        sort
      }),
    getNextPageParam: (lastPage) =>
      lastPage.items.length === ITEMS_PER_PAGE
        ? lastPage.page + 1
        : undefined,
    enabled: debouncedTerm.length >= 2
  })

  // Get search suggestions
  const {
    data: suggestions,
    isLoading: isSuggestionsLoading
  } = useQuery({
    queryKey: ['kb-suggestions', debouncedTerm],
    queryFn: () => searchService.getSuggestions(debouncedTerm),
    enabled: debouncedTerm.length >= 2
  })

  // Flatten results for easier consumption
  const results = data?.pages.reduce<SearchResults['items']>(
    (acc, page) => [...acc, ...page.items],
    []
  )

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(current => ({
      ...current,
      ...newFilters
    }))
  }, [])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Update sort
  const updateSort = useCallback((newSort: SortOptions) => {
    setSort(newSort)
  }, [])

  // Clear all
  const clearAll = useCallback(() => {
    setTerm('')
    setFilters({})
    setSort({
      field: 'relevance',
      order: 'desc'
    })
  }, [])

  return {
    // Search state
    term,
    setTerm,
    filters,
    sort,
    
    // Results
    results,
    total: data?.pages[0]?.total ?? 0,
    isLoading,
    error,
    
    // Pagination
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    
    // Suggestions
    suggestions,
    isSuggestionsLoading,
    
    // Actions
    updateFilters,
    clearFilters,
    updateSort,
    clearAll
  }
}
