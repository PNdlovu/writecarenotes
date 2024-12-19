import { useState, useEffect } from 'react';
import { residentApi } from '../api/resident-service';
import type { Resident } from '../types';

export function useResidents() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setIsLoading(true);
      const response = await residentApi.getResidents({
        search: searchQuery,
        careLevel: selectedFilter !== 'All' ? selectedFilter : undefined,
      });
      setResidents(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch residents'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchResidents();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedFilter]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedFilter('All');
  };

  return {
    residents,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    resetFilters,
  };
}
