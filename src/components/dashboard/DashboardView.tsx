'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { RegionalMetrics } from '@/components/dashboard/RegionalMetrics';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { DashboardOverview } from '@/components/dashboard/Overview';

interface RegionalMetricsResponse {
  region: string;
  residentsCount: number;
  staffCount: number;
  carePlansCount: number;
  upcomingActivities: number;
  recentActivities: Array<{
    id: string;
    resident: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  performanceMetrics: {
    staffUtilization: number;
    residentSatisfaction: number;
    medicationAdherence: number;
    incidentReports: number;
  };
}

async function fetchRegionalMetrics(region?: string): Promise<RegionalMetricsResponse> {
  const params = new URLSearchParams();
  if (region) {
    params.append('region', region);
  }
  
  try {
    const response = await fetch(`/api/regional-metrics?${params.toString()}`);
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch regional metrics');
      } else {
        throw new Error('Server error: Failed to fetch regional metrics');
      }
    }
    
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid response format from server');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

interface DashboardViewProps {
  region: string;
}

export default function DashboardView({ region }: DashboardViewProps) {
  const { data: session, status } = useSession();

  const { data: metrics, isLoading, error, refetch } = useQuery({
    queryKey: ['regional-metrics', region],
    queryFn: () => fetchRegionalMetrics(region),
    enabled: status === 'authenticated',
    retry: 1,
    staleTime: 30000,
  });

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <Alert variant="warning">
        <AlertTitle>Not authenticated</AlertTitle>
        <AlertDescription>
          Please sign in to view the dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error instanceof Error ? error.message : 'Failed to load dashboard data'}</span>
          <button
            onClick={() => refetch()}
            className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-900 rounded-md transition-colors"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert variant="warning">
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>
          No dashboard data is currently available for this region.
        </AlertDescription>
      </Alert>
    );
  }

  const formattedMetrics = {
    overview: [
      { label: 'Total Residents', value: metrics.residentsCount },
      { label: 'Total Staff', value: metrics.staffCount },
      { label: 'Active Care Plans', value: metrics.carePlansCount },
      { label: 'Upcoming Activities', value: metrics.upcomingActivities },
    ]
  };

  return (
    <div className="space-y-6">
      <DashboardMetrics metrics={formattedMetrics} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-1 lg:col-span-4">
          <DashboardOverview metrics={metrics} />
        </div>
        
        <div className="md:col-span-1 lg:col-span-3 space-y-6">
          <RegionalMetrics metrics={metrics} />
          <RecentActivities activities={metrics.recentActivities} />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-1 lg:col-span-4">
          <Skeleton className="h-[400px]" />
        </div>
        
        <div className="md:col-span-1 lg:col-span-3 space-y-6">
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </div>
    </div>
  );
}


