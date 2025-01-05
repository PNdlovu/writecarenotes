// src/features/carehome/components/dashboard/CareHomeDashboard.tsx
import React from 'react';
import { useCareHomeData } from '../../hooks/useCareHomeData';
import { useStaffPerformance } from '../../hooks/useStaffPerformance';
import type { CareHomeDashboardProps } from '../../types';
import { DashboardStats } from './DashboardStats';
import { ActivityFeed } from './ActivityFeed';
import { AlertsPanel } from './AlertsPanel';

export function CareHomeDashboard({ careHomeId }: CareHomeDashboardProps) {
  const { data: careHome, isLoading: isLoadingCareHome } = useCareHomeData(careHomeId);
  const { data: staffPerformance, isLoading: isLoadingStaff } = useStaffPerformance(careHomeId);

  if (isLoadingCareHome || isLoadingStaff) {
    return <div>Loading...</div>;
  }

  if (!careHome) {
    return <div>Care home not found</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">{careHome.name} Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardStats stats={careHome.stats} />
        <ActivityFeed careHomeId={careHomeId} />
        <AlertsPanel careHomeId={careHomeId} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Staff Performance Overview</h2>
        {staffPerformance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staffPerformance.map((staff) => (
              <div key={staff.id} className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-medium">{staff.name}</h3>
                <p className="text-gray-600">{staff.role}</p>
                <div className="mt-2">
                  <div className="flex justify-between">
                    <span>Task Completion</span>
                    <span>{staff.metrics.taskCompletion}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resident Satisfaction</span>
                    <span>{staff.metrics.residentSatisfaction}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


