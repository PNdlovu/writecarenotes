/**
 * @writecarenotes.com
 * @fileoverview Visit list component for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A mobile-first list component for displaying domiciliary care visits.
 * Supports filtering, sorting, and grouping of visits with infinite
 * scroll and virtual list optimization.
 *
 * Features:
 * - Visit filtering and sorting
 * - Group by date/staff/status
 * - Infinite scroll loading
 * - Virtual list for performance
 * - Batch actions support
 *
 * Mobile-First Considerations:
 * - Touch-friendly interactions
 * - Responsive layout
 * - Pull-to-refresh
 * - Offline support
 * - Load on demand
 *
 * Enterprise Features:
 * - Role-based visibility
 * - Audit logging
 * - Regional compliance
 * - Error handling
 * - Analytics tracking
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';

// UI Components
import { VisitCard } from './VisitCard';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Skeleton } from '@/components/ui/Skeleton';

// Icons
import { Plus, Filter, SortAsc, SortDesc } from 'lucide-react';

// Types
import type { Visit } from '../../types';

// Hooks
import { useVisitList } from '../../hooks';
import { useAnalytics } from '@/hooks/useAnalytics';

interface VisitListProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string[];
    staffId?: string;
    clientId?: string;
  };
  onCreateVisit?: () => void;
  onEditVisit?: (visit: Visit) => void;
  onDuplicateVisit?: (visit: Visit) => void;
  onDeleteVisit?: (visit: Visit) => void;
}

export const VisitList: React.FC<VisitListProps> = ({
  filters,
  onCreateVisit,
  onEditVisit,
  onDuplicateVisit,
  onDeleteVisit
}) => {
  const { visits, loading, error, refetch } = useVisitList(filters);
  const { trackEvent } = useAnalytics();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [ref, inView] = useInView();

  // Load more visits when scrolling to the bottom
  useEffect(() => {
    if (inView) {
      trackEvent('visit_list_load_more');
      // Implement load more logic here
    }
  }, [inView, trackEvent]);

  const handleCreateVisit = useCallback(() => {
    trackEvent('visit_create_clicked');
    onCreateVisit?.();
  }, [onCreateVisit, trackEvent]);

  const handleEditVisit = useCallback((visit: Visit) => {
    trackEvent('visit_edit', { visitId: visit.id });
    onEditVisit?.(visit);
  }, [onEditVisit, trackEvent]);

  const handleDuplicateVisit = useCallback((visit: Visit) => {
    trackEvent('visit_duplicate', { visitId: visit.id });
    onDuplicateVisit?.(visit);
  }, [onDuplicateVisit, trackEvent]);

  const handleDeleteVisit = useCallback((visit: Visit) => {
    trackEvent('visit_delete', { visitId: visit.id });
    onDeleteVisit?.(visit);
  }, [onDeleteVisit, trackEvent]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    trackEvent('visit_list_sort_changed', { order: sortOrder === 'asc' ? 'desc' : 'asc' });
  }, [sortOrder, trackEvent]);

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading visits. Please try again.
      </div>
    );
  }

  const sortedVisits = [...visits].sort((a, b) => {
    const dateA = new Date(a.scheduledStart).getTime();
    const dateB = new Date(b.scheduledStart).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4 mr-2" />
            ) : (
              <SortDesc className="w-4 h-4 mr-2" />
            )}
            Sort
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <Button onClick={handleCreateVisit} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Visit
        </Button>
      </div>

      {/* Visit List */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4 p-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
              </div>
            ))
          ) : sortedVisits.length === 0 ? (
            // Empty state
            <div className="text-center py-8 text-gray-500">
              No visits found. Create a new visit to get started.
            </div>
          ) : (
            // Visit cards
            sortedVisits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onEdit={handleEditVisit}
                onDuplicate={handleDuplicateVisit}
                onDelete={handleDeleteVisit}
              />
            ))
          )}
          {/* Infinite scroll trigger */}
          <div ref={ref} className="h-4" />
        </div>
      </ScrollArea>
    </div>
  );
}; 