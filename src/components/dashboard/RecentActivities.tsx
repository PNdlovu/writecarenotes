'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { format } from 'date-fns';
import { AuditLog } from './visualizations/types';

interface Activity extends AuditLog {
  id: string;
  type: 'update' | 'create' | 'delete' | 'login' | 'compliance';
  category: 'care' | 'medication' | 'staff' | 'resident' | 'system';
  severity: 'info' | 'warning' | 'error';
  user: {
    name: string;
    role: string;
  };
}

export const RecentActivities = () => {
  const { data: session } = useSession() as { data: Session | null };
  const organizationId = session?.user?.organizationId;
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/activities?organizationId=${organizationId}`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchActivities();
    }
  }, [organizationId]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'update': return '🔄';
      case 'create': return '➕';
      case 'delete': return '❌';
      case 'login': return '🔑';
      case 'compliance': return '✅';
      default: return '📝';
    }
  };

  const getSeverityColor = (severity: Activity['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">Recent Activities</h3>
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4"
            >
              <span className="text-xl" role="img" aria-label={activity.type}>
                {getActivityIcon(activity.type)}
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {activity.user.name}
                    <span className="text-muted-foreground"> · </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.user.role}
                    </span>
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(activity.severity)}`}>
                    {activity.category}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action}
                </p>
                {activity.details && (
                  <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">
                    {JSON.stringify(activity.details, null, 2)}
                  </pre>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


