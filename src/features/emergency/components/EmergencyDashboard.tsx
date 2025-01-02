import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmergencyAlertList } from './EmergencyAlertList';
import { RaiseAlertDialog } from './RaiseAlertDialog';
import { useEmergencyResponse } from '@/hooks/useEmergencyResponse';
import { EmergencyMode } from '../medications/emergency/EmergencyMode';
import { AutomatedAlerts } from '../medications/alerts/AutomatedAlerts';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface EmergencyDashboardProps {
  facilityId: string;
}

export function EmergencyDashboard({ facilityId }: EmergencyDashboardProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const {
    activeAlerts,
    emergencyContacts,
    incidentReports,
    loadActiveAlerts,
    loadEmergencyContacts,
    loadIncidentReports,
    acknowledgeAlert,
    resolveAlert,
    activateEmergencyMode,
    deactivateEmergencyMode,
    activateProtocol,
    completeProtocolStep,
    documentOverride,
  } = useEmergencyResponse(facilityId);

  const [emergencyMedications, setEmergencyMedications] = useState([]);
  const [activeProtocols, setActiveProtocols] = useState([]);
  const [recentOverrides, setRecentOverrides] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          loadActiveAlerts(),
          loadEmergencyContacts(),
          loadIncidentReports(),
        ]);
      } catch (error) {
        console.error('Failed to load emergency data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load emergency data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [facilityId]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      toast({
        title: 'Alert Acknowledged',
        description: 'The alert has been acknowledged and is being handled.',
      });
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      toast({
        title: 'Alert Resolved',
        description: 'The alert has been resolved and archived.',
      });
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleActivateEmergencyMode = async () => {
    try {
      await activateEmergencyMode();
      toast({
        title: 'Emergency Mode Activated',
        description: 'Emergency protocols are now in effect.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Failed to activate emergency mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate emergency mode. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateEmergencyMode = async () => {
    try {
      await deactivateEmergencyMode();
      toast({
        title: 'Emergency Mode Deactivated',
        description: 'Normal operations have resumed.',
      });
    } catch (error) {
      console.error('Failed to deactivate emergency mode:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate emergency mode. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleActivateProtocol = async (protocolId: string) => {
    try {
      await activateProtocol(protocolId);
      toast({
        title: 'Protocol Activated',
        description: 'Emergency protocol is now active.',
      });
    } catch (error) {
      console.error('Failed to activate protocol:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate protocol. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCompleteProtocolStep = async (protocolId: string, stepId: string) => {
    try {
      await completeProtocolStep(protocolId, stepId);
      toast({
        title: 'Step Completed',
        description: 'Protocol step has been marked as complete.',
      });
    } catch (error) {
      console.error('Failed to complete protocol step:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete step. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDocumentOverride = async (override: any) => {
    try {
      await documentOverride(override);
      toast({
        title: 'Override Documented',
        description: 'Emergency override has been recorded.',
      });
    } catch (error) {
      console.error('Failed to document override:', error);
      toast({
        title: 'Error',
        description: 'Failed to document override. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Emergency Response</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeAlerts.filter((a) => a.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Acknowledged Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeAlerts.filter((a) => a.status === 'ACKNOWLEDGED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeAlerts
                .filter((a) => a.responseTime)
                .reduce((acc, curr) => acc + (curr.responseTime || 0), 0) /
                activeAlerts.filter((a) => a.responseTime).length || 0}
              s
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emergencyContacts.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="emergency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="emergency">Emergency Mode</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
          <TabsTrigger value="reports">Incident Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="emergency">
          <EmergencyMode
            isActive={activeAlerts.some(a => a.status === 'ACTIVE')}
            emergencyMedications={emergencyMedications}
            activeProtocols={activeProtocols}
            recentOverrides={recentOverrides}
            onActivateEmergencyMode={handleActivateEmergencyMode}
            onDeactivateEmergencyMode={handleDeactivateEmergencyMode}
            onActivateProtocol={handleActivateProtocol}
            onCompleteProtocolStep={handleCompleteProtocolStep}
            onDocumentOverride={handleDocumentOverride}
          />
        </TabsContent>
        <TabsContent value="alerts">
          <AutomatedAlerts
            alerts={activeAlerts.map(alert => ({
              id: alert.id,
              type: alert.type as any,
              severity: alert.priority as any,
              title: alert.type,
              description: alert.description,
              timestamp: alert.createdAt,
              acknowledged: alert.status === 'ACKNOWLEDGED',
              metadata: {
                location: alert.location,
                raisedBy: alert.createdBy,
                acknowledgedBy: alert.acknowledgedBy,
                responseTime: alert.responseTime
              }
            }))}
            onAcknowledge={handleAcknowledgeAlert}
            onResolve={handleResolveAlert}
          />
        </TabsContent>
        <TabsContent value="contacts">
          <Card className="p-6">
            <div className="space-y-4">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div>
                    <h4 className="font-medium">{contact.name}</h4>
                    <p className="text-sm text-gray-500">{contact.role}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Priority: {contact.priority}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card className="p-6">
            <div className="space-y-4">
              {incidentReports.map((report) => (
                <div
                  key={report.id}
                  className="border-b pb-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{report.type}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(report.dateTime).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {report.description}
                  </p>
                  <div className="mt-2">
                    <h5 className="text-sm font-medium">Actions Taken:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-500">
                      {report.actions.map((action, index) => (
                        <li key={index}>{action.description}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


