'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { DashboardMetrics } from './DashboardMetrics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchRegionalMetrics(region?: string) {
  const params = new URLSearchParams();
  if (region) {
    params.append('region', region);
  }
  const response = await fetch(`/api/regional-metrics?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch regional metrics');
  }
  return response.json();
}

interface DashboardViewClientProps {
  region: string;
}

function MetricsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 bg-white rounded-lg shadow">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

function DashboardViewClient({ region }: DashboardViewClientProps) {
  const { data: session } = useSession() as { data: Session | null };
  const organizationId = session?.user?.organizationId;

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['regional-metrics', region],
    queryFn: () => fetchRegionalMetrics(region),
    enabled: !!organizationId,
  });

  if (!organizationId) {
    return (
      <Alert variant="warning">
        <AlertTitle>No Organization Selected</AlertTitle>
        <AlertDescription>
          Please select an organization to view the dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <MetricsLoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load dashboard metrics. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <DashboardMetrics metrics={metrics} />
      </div>
    </div>
  );
}

export default DashboardViewClient;


