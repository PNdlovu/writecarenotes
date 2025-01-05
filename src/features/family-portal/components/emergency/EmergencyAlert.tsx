/**
 * @fileoverview Emergency Alert System
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 */

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge/Badge";
import { useToast } from "@/components/ui/UseToast";
import { Bell, Phone, AlertTriangle } from 'lucide-react';

interface EmergencyAlertProps {
  residentId: string;
  careHomeId: string;
  onEmergencyTriggered?: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  residentId,
  careHomeId,
  onEmergencyTriggered,
}) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyType, setEmergencyType] = useState<'medical' | 'security' | 'fire' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to real-time emergency alerts
    const subscription = subscribeToEmergencyAlerts(careHomeId, residentId);
    return () => subscription.unsubscribe();
  }, [careHomeId, residentId]);

  const handleEmergencyTrigger = async (type: 'medical' | 'security' | 'fire') => {
    try {
      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          residentId,
          careHomeId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to trigger emergency alert');

      setIsEmergency(true);
      setEmergencyType(type);
      onEmergencyTriggered?.();

      toast({
        title: "Emergency Alert Triggered",
        description: "Staff have been notified and are responding.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger emergency alert. Please call emergency services directly.",
        variant: "destructive",
      });
    }
  };

  const subscribeToEmergencyAlerts = (careHomeId: string, residentId: string) => {
    // Implementation would use WebSocket or Server-Sent Events
    const eventSource = new EventSource(
      `/api/emergency/subscribe?careHomeId=${careHomeId}&residentId=${residentId}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'emergency') {
        setIsEmergency(true);
        setEmergencyType(data.emergencyType);
        
        toast({
          title: "Emergency Alert",
          description: data.message,
          variant: "destructive",
        });
      }
    };

    return {
      unsubscribe: () => eventSource.close(),
    };
  };

  return (
    <div className="space-y-4">
      {isEmergency && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Emergency Alert Active</AlertTitle>
          <AlertDescription>
            {emergencyType === 'medical' && "Medical emergency in progress. Medical staff responding."}
            {emergencyType === 'security' && "Security alert active. Security team responding."}
            {emergencyType === 'fire' && "Fire alert active. Please follow evacuation procedures."}
            <br />
            <Badge variant="outline" className="mt-2">
              Emergency services have been notified
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="destructive"
          className="flex flex-col items-center p-6"
          onClick={() => handleEmergencyTrigger('medical')}
        >
          <Phone className="h-6 w-6 mb-2" />
          Medical Emergency
        </Button>

        <Button
          variant="destructive"
          className="flex flex-col items-center p-6"
          onClick={() => handleEmergencyTrigger('security')}
        >
          <Bell className="h-6 w-6 mb-2" />
          Security Alert
        </Button>

        <Button
          variant="destructive"
          className="flex flex-col items-center p-6"
          onClick={() => handleEmergencyTrigger('fire')}
        >
          <AlertTriangle className="h-6 w-6 mb-2" />
          Fire Alert
        </Button>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <p>For immediate assistance:</p>
        <ul className="list-disc list-inside">
          <li>Emergency Services: 999</li>
          <li>Care Home Reception: [Display care home phone]</li>
          <li>Duty Manager: [Display duty manager contact]</li>
        </ul>
      </div>
    </div>
  );
};


