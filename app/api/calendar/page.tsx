/**
 * @fileoverview Calendar page route with error boundaries
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { Suspense } from 'react';
import { CalendarPage } from '@/features/calendar/components/CalendarPage';
import { CalendarSkeleton } from '@/features/calendar/components/CalendarSkeleton';
import { ErrorBoundary } from '@/components/error-boundary';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function Page() {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Error loading calendar</h2>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page
            </p>
          </div>
        </div>
      }
    >
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarPage />
      </Suspense>
    </ErrorBoundary>
  );
} 