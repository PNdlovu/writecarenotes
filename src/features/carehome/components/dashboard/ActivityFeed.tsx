// src/features/carehome/components/dashboard/ActivityFeed.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface Activity {
  id: string;
  type: 'task' | 'alert' | 'update' | 'compliance';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    role: string;
  };
}

interface ActivityFeedProps {
  careHomeId: string;
}

async function fetchActivities(careHomeId: string): Promise<Activity[]> {
  const response = await fetch(`/api/care-homes/${careHomeId}/activities`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
}

export function ActivityFeed({ careHomeId }: ActivityFeedProps) {
  const { data: activities, isLoading } = useQuery<Activity[], Error>({
    queryKey: ['activities', careHomeId],
    queryFn: () => fetchActivities(careHomeId),
  });

  if (isLoading) {
    return <div>Loading activities...</div>;
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="border-b pb-3 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    {activity.user.name} • {activity.user.role}
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}


