'use client';

/**
 * @writecarenotes.com
 * @fileoverview Dashboard component for domiciliary staff management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { DomiciliaryStaffForm } from './DomiciliaryStaffForm';
import { StaffAvailabilitySearch } from './StaffAvailabilitySearch';
import { VehicleDocumentsMonitor } from './VehicleDocumentsMonitor';
import { ActivityFeed } from './ActivityFeed';
import { AlertsFeed } from './AlertsFeed';
import { useStaffStats } from '../../hooks/useStaffStats';
import { useStaffActivity } from '../../hooks/useStaffActivity';
import { useStaffAlerts } from '../../hooks/useStaffAlerts';
import { useToast } from '@/hooks/useToast';

interface Props {
  organizationId: string;
}

export function DomiciliaryStaffDashboard({ organizationId }: Props) {
  const [activeTab, setActiveTab] = useState('availability');
  const { showToast } = useToast();
  const { stats, isLoading: isLoadingStats, refetch: refetchStats } = useStaffStats(organizationId);
  const { activities, isLoading: isLoadingActivities, refetch: refetchActivities } = useStaffActivity(organizationId);
  const { alerts, isLoading: isLoadingAlerts, refetch: refetchAlerts, markAsRead } = useStaffAlerts(organizationId);

  const handleRefresh = () => {
    refetchStats();
    refetchActivities();
    refetchAlerts();
    showToast('success', 'Dashboard data refreshed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Domiciliary Staff Management</h1>
        <Button onClick={handleRefresh}>Refresh All</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="availability">Staff Availability</TabsTrigger>
          <TabsTrigger value="vehicle-docs">Vehicle Documents</TabsTrigger>
          <TabsTrigger value="staff-details">Staff Details</TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Availability Search</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffAvailabilitySearch organizationId={organizationId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicle-docs" className="mt-6">
          <VehicleDocumentsMonitor 
            organizationId={organizationId}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="staff-details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Staff Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DomiciliaryStaffForm organizationId={organizationId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Active Staff</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stats.activeStaff}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Today</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stats.availableToday}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiring Documents</p>
                {isLoadingStats ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <p className="text-2xl font-bold">{stats.expiringDocuments}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed 
              activities={activities}
              isLoading={isLoadingActivities}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertsFeed 
              alerts={alerts}
              isLoading={isLoadingAlerts}
              onMarkAsRead={markAsRead}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 