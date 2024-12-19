'use client';

import { ResidentList } from '@/features/residents/components/resident-list';
import { useResidents } from '@/features/residents/hooks/use-residents';

export default function ResidentsPage() {
  const {
    residents,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    resetFilters,
  } = useResidents();

  return (
    <div className="container mx-auto py-6">
      <ResidentList
        residents={residents}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        onReset={resetFilters}
      />
    </div>
  );
}
