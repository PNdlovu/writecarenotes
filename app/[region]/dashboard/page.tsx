/**
 * WriteCareNotes.com
 * @fileoverview Dashboard Overview Page
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { Metadata } from 'next'
import { DashboardShell } from '@/components/shell'
import { DashboardHeader } from '@/components/header'
import { Button } from '@/components/ui/Button/Button'
import { EmptyPlaceholder } from '@/components/empty-placeholder'
import { DashboardTabs } from '@/components/dashboard/tabs'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Care home management dashboard with key metrics and resident information.',
}

type RegionParams = {
  region: string
}

export default function DashboardPage({ params }: { params: RegionParams }) {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Welcome to your dashboard.">
        <Button asChild>
          <Link href={`/${params.region}/residents/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Resident
          </Link>
        </Button>
      </DashboardHeader>
      <div className="grid gap-10">
        <DashboardTabs />
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="post" />
          <EmptyPlaceholder.Title>No content created</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any content yet. Start creating content.
          </EmptyPlaceholder.Description>
          <Button variant="outline" asChild>
            <Link href={`/${params.region}/residents/new`}>Create content</Link>
          </Button>
        </EmptyPlaceholder>
      </div>
    </DashboardShell>
  )
}
