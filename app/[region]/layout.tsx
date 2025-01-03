/**
 * @writecarenotes.com
 * @fileoverview Region-specific layout component
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Layout component for region-specific pages. Handles region-specific
 * configuration, navigation, and UI elements.
 */

import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { validateRegion } from '@/lib/region'
import { DashboardLayout } from '@/components/layout/dashboard/DashboardLayout'

interface RegionLayoutProps {
  children: ReactNode
  params: {
    region: string
  }
}

export default function RegionLayout({
  children,
  params,
}: RegionLayoutProps) {
  // Validate region and redirect to 404 if invalid
  if (!validateRegion(params.region)) {
    notFound()
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
} 