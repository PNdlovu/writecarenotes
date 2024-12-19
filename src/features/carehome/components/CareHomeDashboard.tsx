// src/features/carehome/components/CareHomeDashboard.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';
import type { CareHomeDashboardProps } from '../types';
import { DashboardStats } from './dashboard/DashboardStats';
import { ActivityFeed } from './dashboard/ActivityFeed';
import { AlertsPanel } from './dashboard/AlertsPanel';
import { useCareHomeData } from '../hooks/useCareHomeData';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { LoadingState } from './shared/LoadingState';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * Main dashboard component for care home management.
 * Displays care home statistics, occupancy trends, resource usage, and activity feeds.
 * 
 * @component
 * @example
 * ```tsx
 * <CareHomeDashboard careHomeId="123" />
 * ```
 */
export function CareHomeDashboard({ careHomeId }: CareHomeDashboardProps) {
  const {
    data: careHomeData,
    isLoading,
    error,
    refetch
  } = useCareHomeData(careHomeId);

  if (isLoading) {
    return <LoadingState message="Loading care home dashboard..." />;
  }

  if (error) {
    return (
      <ErrorBoundary
        error={error instanceof Error ? error : new Error('Failed to load care home data')}
        reset={() => refetch()}
      />
    );
  }

  if (!careHomeData) {
    return null;
  }

  const { stats, metrics } = careHomeData;

  return (
    <div className="space-y-4 p-4" data-testid="care-home-dashboard">
      <DashboardStats
        stats={{
          occupancy: metrics.occupancyRate,
          staffCount: metrics.totalStaff,
          compliance: metrics.complianceRate,
          alerts: metrics.activeAlerts,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Occupancy Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.dailyOccupancy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), 'MMM d')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Resource Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.resourceUsage}
                dataKey="usage"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats.resourceUsage.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Tabs defaultValue="alerts" className="w-full">
            <TabsList>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="alerts">
              <AlertsPanel alertCount={metrics.activeAlerts} />
            </TabsContent>
            <TabsContent value="activity">
              <ActivityFeed />
            </TabsContent>
          </Tabs>
        </div>

        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Department Metrics</h3>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {stats.departmentMetrics.map((dept) => (
                <div key={dept.departmentId} className="space-y-2">
                  <h4 className="font-medium">{dept.name}</h4>
                  {Object.entries(dept.metrics).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between text-sm text-muted-foreground"
                    >
                      <span>{key}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}


