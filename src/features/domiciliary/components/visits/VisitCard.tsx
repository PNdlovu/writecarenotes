/**
 * @writecarenotes.com
 * @fileoverview Visit card component for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A mobile-first card component for displaying domiciliary care visit
 * information. Shows visit details, client information, assigned staff,
 * and status with touch-friendly interactions. Supports offline mode
 * and regional compliance requirements.
 */

import React from 'react';
import { format } from 'date-fns';
import { Card, Button, Avatar, AvatarFallback, Progress, Badge } from '@/components/ui';
import { MapPin, Clock, User, CheckCircle } from 'lucide-react';
import type { Visit } from '../../types';

interface VisitCardProps {
  visit: Visit;
  onClick?: (visit: Visit) => void;
  onStatusChange?: (visit: Visit, newStatus: Visit['status']['status']) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  visit,
  onClick,
  onStatusChange
}) => {
  const taskCompletion = (visit.tasks.filter(task => task.completed).length / visit.tasks.length) * 100;

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(visit)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium">{format(visit.scheduledTime, 'HH:mm')}</h3>
          <p className="text-sm text-gray-500">{format(visit.scheduledTime, 'dd MMM yyyy')}</p>
        </div>
        <Badge variant={getStatusVariant(visit.status.status)} className="capitalize">
          {visit.status.status.toLowerCase().replace('_', ' ')}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>{visit.duration} minutes</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{visit.location.address || 'Location not specified'}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <div className="flex -space-x-2">
            {visit.staffAssigned.map((staffId, index) => (
              <Avatar key={staffId} className="border-2 border-white w-8 h-8">
                <AvatarFallback>{`S${index + 1}`}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Tasks Progress</span>
            <span className="text-sm font-medium">{Math.round(taskCompletion)}%</span>
          </div>
          <Progress value={taskCompletion} max={100} className="h-2" />
        </div>
      </div>
    </Card>
  );
};

function getStatusVariant(status: Visit['status']['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'SCHEDULED':
      return 'default';
    case 'IN_PROGRESS':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    case 'MISSED':
      return 'destructive';
    default:
      return 'default';
  }
}

export default VisitCard; 