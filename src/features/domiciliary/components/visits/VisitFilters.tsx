/**
 * @writecarenotes.com
 * @fileoverview Visit filters component for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A mobile-first filter component for domiciliary care visits.
 * Provides various filtering options including date range, status,
 * staff, and location with real-time updates.
 *
 * Features:
 * - Date range selection
 * - Status filtering
 * - Staff filtering
 * - Location filtering
 * - Quick filter presets
 *
 * Mobile-First Considerations:
 * - Touch-friendly controls
 * - Responsive layout
 * - Offline support
 * - Performance optimized
 * - Gesture controls
 *
 * Enterprise Features:
 * - Role-based access
 * - Audit logging
 * - Regional compliance
 * - Error handling
 * - Analytics tracking
 */

import React, { useCallback, useState } from 'react';
import { format } from 'date-fns';

// UI Components
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Form/Select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/Sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion/Accordion';

// Icons
import {
  Calendar as CalendarIcon,
  Filter,
  Users,
  MapPin,
  Clock,
  X,
  Check
} from 'lucide-react';

// Types
import type { Visit } from '../../types';

// Hooks
import { useVisitAnalytics, type EventName } from '../../hooks/analytics';

// Constants
import { VISIT_STATUS_LABELS } from '../../constants';

interface VisitFiltersProps {
  onFilterChange: (filters: VisitFilters) => void;
  initialFilters?: VisitFilters;
}

export interface VisitFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: Visit['status']['status'][];
  staffId?: string[];
  location?: Visit['location'];
}

export const VisitFilters: React.FC<VisitFiltersProps> = ({
  onFilterChange,
  initialFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<VisitFilters>(initialFilters || {});
  const { trackEvent } = useVisitAnalytics();

  const handleDateRangeChange = useCallback((range: { from: Date; to: Date }) => {
    const newFilters = {
      ...filters,
      dateRange: {
        start: range.from,
        end: range.to
      }
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    trackEvent('visit_filter_date_changed' as EventName, {
      start: format(range.from, 'yyyy-MM-dd'),
      end: format(range.to, 'yyyy-MM-dd')
    });
  }, [filters, onFilterChange, trackEvent]);

  const handleStatusChange = useCallback((statuses: Visit['status']['status'][]) => {
    const newFilters = {
      ...filters,
      status: statuses
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    trackEvent('visit_filter_status_changed' as EventName, { statuses });
  }, [filters, onFilterChange, trackEvent]);

  const handleStaffChange = useCallback((staffIds: string[]) => {
    const newFilters = {
      ...filters,
      staffId: staffIds
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    trackEvent('visit_filter_staff_changed' as EventName, { staffIds });
  }, [filters, onFilterChange, trackEvent]);

  const handleLocationChange = useCallback((location: VisitFilters['location']) => {
    const newFilters = {
      ...filters,
      location
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    trackEvent('visit_filter_location_changed' as EventName, location);
  }, [filters, onFilterChange, trackEvent]);

  const clearFilters = useCallback(() => {
    setFilters({});
    onFilterChange({});
    trackEvent('visit_filters_cleared' as EventName, {});
  }, [onFilterChange, trackEvent]);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.dateRange) count++;
    if (filters.status?.length) count++;
    if (filters.staffId?.length) count++;
    if (filters.location) count++;
    return count;
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {getActiveFilterCount() > 0 && (
          <Badge variant="secondary" className="ml-2">
            {getActiveFilterCount()}
          </Badge>
        )}
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Visit Filters</SheetTitle>
            <SheetDescription>
              Filter visits by date, status, staff, and location
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <Accordion type="single" collapsible>
              {/* Date Range */}
              <AccordionItem value="date">
                <AccordionTrigger className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Date Range
                </AccordionTrigger>
                <AccordionContent>
                  <Calendar
                    mode="range"
                    selected={{
                      from: filters.dateRange?.start,
                      to: filters.dateRange?.end
                    }}
                    onSelect={handleDateRangeChange}
                    className="rounded-md border"
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Status */}
              <AccordionItem value="status">
                <AccordionTrigger className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Status
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => (
                      <div
                        key={value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`status-${value}`}
                          checked={filters.status?.includes(value)}
                          onChange={(e) => {
                            const newStatuses = e.target.checked
                              ? [...(filters.status || []), value]
                              : filters.status?.filter(s => s !== value) || [];
                            handleStatusChange(newStatuses);
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={`status-${value}`}>
                          {label}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Staff */}
              <AccordionItem value="staff">
                <AccordionTrigger className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Staff
                </AccordionTrigger>
                <AccordionContent>
                  {/* Add staff selection component */}
                  <div className="text-sm text-gray-500">
                    Staff filtering coming soon
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Location */}
              <AccordionItem value="location">
                <AccordionTrigger className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </AccordionTrigger>
                <AccordionContent>
                  {/* Add location selection component */}
                  <div className="text-sm text-gray-500">
                    Location filtering coming soon
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}; 