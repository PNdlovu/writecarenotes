// src/features/carehome/components/dashboard/AlertsPanel.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

interface AlertsPanelProps {
  careHomeId: string;
}

async function fetchAlerts(careHomeId: string): Promise<Alert[]> {
  const response = await fetch(`/api/care-homes/${careHomeId}/alerts`);
  if (!response.ok) {
    throw new Error('Failed to fetch alerts');
  }
  return response.json();
}

export function AlertsPanel({ careHomeId }: AlertsPanelProps) {
  const { data: alerts, isLoading } = useQuery<Alert[], Error>({
    queryKey: ['alerts', careHomeId],
    queryFn: () => fetchAlerts(careHomeId),
  });

  if (isLoading) {
    return <div>Loading alerts...</div>;
  }

  const severityConfig = {
    high: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bg: 'bg-red-50',
      badge: 'bg-red-100 text-red-800',
    },
    medium: {
      icon: ExclamationCircleIcon,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    low: {
      icon: InformationCircleIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-800',
    },
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        <Badge variant="outline">
          {alerts?.filter(a => a.status === 'active').length} Active
        </Badge>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {alerts?.filter(alert => alert.status === 'active')
            .map((alert) => {
              const config = severityConfig[alert.severity];
              
              return (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg ${config.bg} border border-${config.color}`}
                >
                  <div className="flex items-start space-x-3">
                    <config.icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge className={config.badge}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{alert.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </ScrollArea>
    </Card>
  );
}


