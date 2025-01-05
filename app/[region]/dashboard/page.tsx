/**
 * WriteCareNotes.com
 * @fileoverview Dashboard Overview Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { Metadata } from 'next'
import { DashboardContent } from './DashboardContent'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Care home management dashboard with key metrics and resident information.',
}

type RegionParams = {
  region: string
}

export default function DashboardPage({ params }: { params: RegionParams }) {
  return <DashboardContent region={params.region} />
}
