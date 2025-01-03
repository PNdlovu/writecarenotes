'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress/Progress';
import { 
  EmergencyType, 
  EmergencyStatus,
  EmergencyIncident,
  EmergencyAction
} from '@/features/emergency/types';
import { useEmergency } from '@/features/emergency/hooks/useEmergency';
import { useAccess } from '../hooks/useAccess';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const getStatusColor = (status: EmergencyStatus) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-red-500';
    case 'IN_PROGRESS':
      return 'bg-yellow-500';
    case 'RESOLVED':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

const getTypeIcon = (type: EmergencyType) => {
  switch (type) {
    case 'MEDICAL':
      return '🏥';
    case 'MEDICATION':
      return '💊';
    case 'FIRE':
      return '🔥';
    case 'SECURITY':
      return '🔒';
    case 'NATURAL_DISASTER':
      return '🌪️';
    case 'INFRASTRUCTURE':
      return '🏗️';
    default:
      return '⚠️';
  }
};

export const EmergencyAccessDashboard: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const { incident, actions, loading, error, declareEmergency, recordAction, updateStatus, getProtocolStatus } = useEmergency(selectedIncident);
  const { hasEmergencyAccess, grantEmergencyAccess, revokeEmergencyAccess } = useAccess();

  const handleDeclareEmergency = async (type: EmergencyType) => {
    try {
      const newIncident = await declareEmergency(
        type,
        'Main Building', // This should come from user input or context
        'Emergency situation declared'
      );
      setSelectedIncident(newIncident.id);
    } catch (error) {
      console.error('Failed to declare emergency:', error);
    }
  };

  const handleRecordAction = async (action: Omit<EmergencyAction, 'id' | 'timestamp'>) => {
    try {
      await recordAction(action);
    } catch (error) {
      console.error('Failed to record action:', error);
    }
  };

  const handleUpdateStatus = async (status: EmergencyStatus) => {
    try {
      await updateStatus(status);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const protocolStatus = incident ? getProtocolStatus() : null;

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Emergency Access Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Emergency Declaration Section */}
          {!incident && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Declare Emergency</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.values(EmergencyType).map((type) => (
                  <Button
                    key={type}
                    onClick={() => handleDeclareEmergency(type)}
                    variant="outline"
                    className="h-20"
                    disabled={loading}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-2xl">{getTypeIcon(type)}</span>
                      <span>{type}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Active Emergency Section */}
          {incident && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getTypeIcon(incident.type)}</span>
                  <h3 className="text-lg font-semibold">{incident.type} Emergency</h3>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {new Date(incident.startTime).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Protocol Progress */}
              {protocolStatus && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Protocol Progress</span>
                    <span>{Math.round(protocolStatus.summary.includes('Progress:') ? 
                      parseInt(protocolStatus.summary.split('Progress:')[1]) : 0)}%</span>
                  </div>
                  <Progress 
                    value={protocolStatus.summary.includes('Progress:') ? 
                      parseInt(protocolStatus.summary.split('Progress:')[1]) : 0} 
                  />
                </div>
              )}

              {/* Next Required Action */}
              {protocolStatus?.nextAction && (
                <Alert>
                  <AlertTitle>Next Required Action</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">{protocolStatus.nextAction.stepTitle}</p>
                      <p>{protocolStatus.nextAction.description}</p>
                      <div className="text-sm text-muted-foreground">
                        Time Limit: {protocolStatus.nextAction.timeLimit} minutes
                      </div>
                      <div className="space-y-1">
                        {protocolStatus.nextAction.completionCriteria.map((criteria, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{criteria}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {incident.status !== 'RESOLVED' && (
                  <>
                    <Button
                      onClick={() => handleUpdateStatus('IN_PROGRESS')}
                      variant="outline"
                      disabled={incident.status === 'IN_PROGRESS' || loading}
                    >
                      Mark In Progress
                    </Button>
                    <Button
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      variant="outline"
                      disabled={loading}
                    >
                      Mark Resolved
                    </Button>
                  </>
                )}
              </div>

              {/* Recent Actions */}
              <div className="space-y-2">
                <h4 className="font-semibold">Recent Actions</h4>
                <div className="space-y-2">
                  {actions.slice(-5).map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <span>{action.details}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(action.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
