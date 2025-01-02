/**
 * @writecarenotes.com
 * @fileoverview Component for displaying staff activity feed
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { formatDistanceToNow } from 'date-fns';
import { ActivityItem } from '../../hooks/useStaffActivity';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  UserCircle, 
  FileText, 
  Calendar, 
  Car 
} from 'lucide-react';

interface Props {
  activities: ActivityItem[];
  isLoading: boolean;
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'PROFILE_UPDATE':
      return <UserCircle className="w-5 h-5 text-blue-500" />;
    case 'DOCUMENT_UPDATE':
      return <FileText className="w-5 h-5 text-green-500" />;
    case 'AVAILABILITY_UPDATE':
      return <Calendar className="w-5 h-5 text-purple-500" />;
    case 'VEHICLE_UPDATE':
      return <Car className="w-5 h-5 text-orange-500" />;
  }
};

export function ActivityFeed({ activities, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className="mt-1">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.staffName}</span>{' '}
              {activity.description}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 