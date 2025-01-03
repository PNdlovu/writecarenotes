'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building,
  FileCheck,
  UserCheck,
  Bed,
  Users,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DashboardLayout } from '@/components/layout/dashboard/DashboardLayout';

interface DashboardContentProps {
  region: string;
}

interface CareHome {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  currentOccupancy: number;
  organization: {
    name: string;
    regulatoryBody: string;
  };
}

interface DashboardMetrics {
  bedOccupancy: {
    value: number;
    trend: number;
    occupied: number;
    total: number;
  };
  staffing: {
    total: number;
    nurses: number;
    managers: number;
    trend: number;
  };
  residents: {
    total: number;
    trend: number;
  };
}

export function DashboardContent({ region }: DashboardContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [careHome, setCareHome] = useState<CareHome | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setCareHome(data.careHome);
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const navigateTo = (path: string) => {
    router.push(`/${region}${path}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !careHome || !metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="text-red-500">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Failed to load dashboard</h2>
        <p className="text-gray-600">{error || 'Something went wrong'}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Organization Info */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">{careHome.name}</h1>
          <p className="text-gray-600">{careHome.organization.name} • {careHome.organization.regulatoryBody}</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bed Occupancy */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Bed Occupancy
              </CardTitle>
              <Bed className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{metrics.bedOccupancy.value}%</div>
                <p className="text-xs text-gray-500">
                  {metrics.bedOccupancy.occupied} of {metrics.bedOccupancy.total} beds occupied
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Staff Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Staff Overview
              </CardTitle>
              <UserCheck className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{metrics.staffing.total}</div>
                <p className="text-xs text-gray-500">
                  {metrics.staffing.nurses} nurses • {metrics.staffing.managers} managers
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Residents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Residents
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="text-2xl font-bold">{metrics.residents.total}</div>
                <p className="text-xs text-gray-500">
                  Total residents under care
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => navigateTo('/residents/new')}>
            Add Resident
          </Button>
          <Button onClick={() => navigateTo('/staff/new')} variant="outline">
            Add Staff Member
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}