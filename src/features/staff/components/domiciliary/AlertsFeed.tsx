/**
 * @writecarenotes.com
 * @fileoverview Component for displaying staff alerts
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { formatDistanceToNow } from 'date-fns';
import { Alert } from '../../hooks/useStaffAlerts';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { 
  AlertTriangle,
  AlertCircle,
  Info,
  FileWarning,
  Calendar,
  Car,
  Shield
} from 'lucide-react';

interface Props {
  alerts: Alert[];
  isLoading: boolean;
  onMarkAsRead: (alertId: string) => void;
}

const getAlertIcon = (type: Alert['type'], category: Alert['category']) => {
  const className = "w-5 h-5";
  
  // First determine the icon based on category
  const CategoryIcon = {
    DOCUMENT: FileWarning,
    AVAILABILITY: Calendar,
    VEHICLE: Car,
    COMPLIANCE: Shield
  }[category];

  // Then apply color based on type
  const color = {
    WARNING: 'text-yellow-500',
    ERROR: 'text-red-500',
    INFO: 'text-blue-500'
  }[type];

  return <CategoryIcon className={`${className} ${color}`} />;
};

const getPriorityBadgeColor = (priority: Alert['priority']) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'LOW':
      return 'bg-blue-100 text-blue-800';
  }
};

export function AlertsFeed({ alerts, isLoading, onMarkAsRead }: Props) {
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

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No active alerts
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div 
          key={alert.id} 
          className={`
            p-4 rounded-lg border
            ${alert.isRead ? 'bg-gray-50' : 'bg-white'}
          `}
        >
          <div className="flex items-start space-x-4">
            <div className="mt-1">
              {getAlertIcon(alert.type, alert.category)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{alert.title}</h4>
                <span 
                  className={`
                    text-xs px-2 py-1 rounded-full
                    ${getPriorityBadgeColor(alert.priority)}
                  `}
                >
                  {alert.priority.toLowerCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {alert.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                </p>
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(alert.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 