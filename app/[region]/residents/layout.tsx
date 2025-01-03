/**
 * @writecarenotes.com
 * @fileoverview Region-specific residents layout
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Layout component for the residents section, handling region-specific
 * configuration and UI elements.
 */

import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { validateRegion } from '@/lib/region';
import { DashboardLayout } from '@/components/layout/dashboard/DashboardLayout';

interface ResidentsLayoutProps {
  children: ReactNode;
  params: {
    region: string;
  };
}

export default function ResidentsLayout({
  children,
  params,
}: ResidentsLayoutProps) {
  // Validate region and redirect to 404 if invalid
  if (!validateRegion(params.region)) {
    notFound();
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
} 