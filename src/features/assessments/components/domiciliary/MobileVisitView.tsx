import React, { useState } from 'react';
import { format } from 'date-fns';
import { MapPin, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/Textarea';
import { Visit, VISIT_STATUS } from '../../types/visit.types';

interface MobileVisitViewProps {
  visit: Visit;
  onStartVisit: (visitId: string) => Promise<void>;
  onCompleteVisit: (visitId: string, notes: string) => Promise<void>;
  onCancelVisit: (visitId: string, reason: string) => Promise<void>;
  onNavigate?: (address: string, postcode: string) => void;
}

export function MobileVisitView({
  visit,
  onStartVisit,
  onCompleteVisit,
  onCancelVisit,
  onNavigate,
}: MobileVisitViewProps) {
  const [notes, setNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status: VISIT_STATUS) => {
    switch (status) {
      case VISIT_STATUS.COMPLETED:
        return 'bg-green-100 text-green-800';
      case VISIT_STATUS.CANCELLED:
      case VISIT_STATUS.MISSED:
        return 'bg-red-100 text-red-800';
      case VISIT_STATUS.IN_PROGRESS:
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
            <h2 className="text-xl font-bold">{visit.visitType.replace('_', ' ')}</h2>
            <p className="text-sm text-gray-500">
              {format(new Date(visit.scheduledDateTime), 'PPP')}
            </p>
          </div>
          <Badge className={getStatusColor(visit.status)}>
            {visit.status.replace('_', ' ')}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-start space-x-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="font-medium">{visit.location.address}</p>
              <p className="text-sm text-gray-500">{visit.location.postcode}</p>
              {visit.location.accessNotes && (
                <p className="text-sm text-amber-600 mt-1">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {visit.location.accessNotes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <span>
              {format(new Date(visit.scheduledDateTime), 'HH:mm')} (
              {visit.estimatedDuration} mins)
            </span>
          </div>

          {visit.mobileEquipmentNeeded && visit.mobileEquipmentNeeded.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Required Equipment:</h3>
              <ul className="list-disc list-inside space-y-1">
                {visit.mobileEquipmentNeeded.map((item, index) => (
                  <li key={index} className="text-sm">{item}</li>
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
          {visit.status === VISIT_STATUS.SCHEDULED && (
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
                  onClick={() => onNavigate(visit.location.address, visit.location.postcode)}
                >
                  Navigate to Address
                </Button>
              )}
            </>
          )}

          {visit.status === VISIT_STATUS.IN_PROGRESS && (
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

          {visit.status === VISIT_STATUS.SCHEDULED && (
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
}
