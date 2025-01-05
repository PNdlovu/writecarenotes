/**
 * @writecarenotes.com
 * @fileoverview Mobile visit view component for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-optimized view for managing domiciliary care visits.
 * Provides visit details, actions, and status updates with
 * touch-friendly controls and offline support.
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/Textarea';
import { MapPin, Clock, AlertCircle } from 'lucide-react';
import type { Visit } from '../../types';

interface MobileVisitViewProps {
  visit: Visit;
  onStartVisit: (visitId: string) => Promise<void>;
  onCompleteVisit: (visitId: string, notes: string) => Promise<void>;
  onCancelVisit: (visitId: string, reason: string) => Promise<void>;
  onNavigate?: (location: Visit['location']) => void;
}

export const MobileVisitView: React.FC<MobileVisitViewProps> = ({
  visit,
  onStartVisit,
  onCompleteVisit,
  onCancelVisit,
  onNavigate,
}) => {
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: Visit['status']['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'MISSED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = async (action: 'start' | 'complete' | 'cancel') => {
    setLoading(true);
    try {
      switch (action) {
        case 'start':
          await onStartVisit(visit.id);
          break;
        case 'complete':
          await onCompleteVisit(visit.id, notes);
          break;
        case 'cancel':
          await onCancelVisit(visit.id, cancelReason);
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Visit Details</h2>
            <p className="text-sm text-gray-500">
              {format(visit.scheduledTime, 'PPP')}
            </p>
          </div>
          <Badge className={getStatusColor(visit.status.status)}>
            {visit.status.status}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="font-medium">{visit.location.address || 'No address specified'}</p>
              {visit.location.radius && (
                <p className="text-sm text-amber-600 mt-1">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Coverage radius: {visit.location.radius}m
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span>
              {format(visit.scheduledTime, 'HH:mm')} ({visit.duration} mins)
            </span>
          </div>

          {visit.tasks.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Tasks:</h3>
              <ul className="list-disc list-inside space-y-1">
                {visit.tasks.map((task) => (
                  <li key={task.id} className="text-sm">
                    {task.title}
                    {task.completed && ' ✓'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {visit.notes && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Notes:</h3>
              <p className="text-sm">{visit.notes}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          {visit.status.status === 'SCHEDULED' && (
            <>
              <Button
                className="w-full"
                onClick={() => handleAction('start')}
                disabled={loading}
              >
                Start Visit
              </Button>
              {onNavigate && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => onNavigate(visit.location)}
                >
                  Navigate to Location
                </Button>
              )}
            </>
          )}

          {visit.status.status === 'IN_PROGRESS' && (
            <>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter visit notes..."
                className="mb-4"
              />
              <Button
                className="w-full"
                onClick={() => handleAction('complete')}
                disabled={loading}
              >
                Complete Visit
              </Button>
            </>
          )}

          {visit.status.status === 'SCHEDULED' && (
            <>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="mb-4"
              />
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => handleAction('cancel')}
                disabled={loading}
              >
                Cancel Visit
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MobileVisitView; 