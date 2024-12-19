// src/features/carehome/components/dashboard/DashboardStats.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { 
  BedIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  BellAlertIcon 
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  stats: {
    occupancy: number;
    staffCount: number;
    compliance: number;
    alerts: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statItems = [
    {
      label: 'Occupancy',
      value: `${stats.occupancy}%`,
      icon: BedIcon,
      color: 'text-blue-600',
    },
    {
      label: 'Staff',
      value: stats.staffCount,
      icon: UserGroupIcon,
      color: 'text-green-600',
    },
    {
      label: 'Compliance',
      value: `${stats.compliance}%`,
      icon: ShieldCheckIcon,
      color: 'text-purple-600',
    },
    {
      label: 'Active Alerts',
      value: stats.alerts,
      icon: BellAlertIcon,
      color: stats.alerts > 0 ? 'text-red-600' : 'text-gray-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`${item.color}`}>
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-xl font-semibold">{item.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


