/**
 * @writecarenotes.com
 * @fileoverview Medication Search Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for searching medications with debounced input
 * and advanced filtering capabilities.
 */

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMedications } from './useMedications';
import { useDebounce } from '@/hooks/useDebounce';
import type { Medication } from '../types';

interface SearchFilters {
  form?: string;
  route?: string;
  controlled?: boolean;
}

export function useMedicationSearch(query: string, filters?: SearchFilters) {
  const debouncedQuery = useDebounce(query, 300);
  const { searchMedications } = useMedications();

  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicationSearch', debouncedQuery, filters],
    queryFn: () => searchMedications(debouncedQuery, filters),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    data,
    isLoading: isLoading && debouncedQuery.length >= 2,
    error
  };
} 