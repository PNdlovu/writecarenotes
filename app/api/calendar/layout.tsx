/**
 * @fileoverview Calendar section layout with metadata and providers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { Metadata } from 'next';
import { CalendarProvider } from '@/features/calendar/providers/CalendarProvider';
import { OfflineProvider } from '@/features/offline/providers/OfflineProvider';

export const metadata: Metadata = {
  title: 'Calendar | Write Care Notes',
  description: 'Schedule and manage appointments, activities, and care tasks',
  openGraph: {
    title: 'Calendar | Write Care Notes',
    description: 'Schedule and manage appointments, activities, and care tasks',
    type: 'website',
  },
};

interface CalendarLayoutProps {
  children: React.ReactNode;
}

export default function CalendarLayout({ children }: CalendarLayoutProps) {
  return (
    <OfflineProvider module="calendar">
      <CalendarProvider>
        <section className="h-full w-full bg-background">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </section>
      </CalendarProvider>
    </OfflineProvider>
  );
} 
