'use client'

import { useOrganization } from '../../hooks/useOrganization'
import { useOrganizationAnalytics } from '../../hooks/useOrganizationAnalytics'
import { CareHomesList } from './CareHomesList'
import { MetricsOverview } from './MetricsOverview'
import { ComplianceOverview } from './ComplianceOverview'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus } from 'lucide-react'

export function OrganizationDashboard() {
  const {
    organization,
    isLoading: orgLoading,
    error: orgError,
  } = useOrganization()

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useOrganizationAnalytics(organization?.id || '')

  if (orgLoading || analyticsLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (orgError || analyticsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {orgError?.message || analyticsError?.message || 'An error occurred'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!organization) {
    return (
      <Alert>
        <AlertDescription>Organization not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">
            {organization.careHomes.length} Care Homes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Care Home
        </Button>
      </div>

      {analyticsData && (
        <MetricsOverview
          metrics={analyticsData.metrics}
          historicalData={analyticsData.historicalData}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Care Homes</h2>
            <CareHomesList
              careHomes={organization.careHomes}
              metrics={analyticsData?.careHomes || []}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Compliance Overview</h2>
            {analyticsData && (
              <ComplianceOverview
                compliance={analyticsData.compliance}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}


