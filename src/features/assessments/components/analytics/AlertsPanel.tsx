import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Badge } from "@/components/ui/Badge";
import { BellIcon, CheckIcon, XIcon } from 'lucide-react';
import { AlertService, Alert } from '../../services/analytics/AlertService';
import { format } from 'date-fns';

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const alertService = AlertService.getInstance();

  useEffect(() => {
    // Load initial alerts
    setAlerts(alertService.getAlerts());

    // Subscribe to new alerts
    const subscription = alertService.subscribe((alert) => {
      if (alert) {
        setAlerts(alertService.getAlerts());
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAcknowledge = (id: string) => {
    alertService.acknowledgeAlert(id);
    setAlerts(alertService.getAlerts());
  };

  const handleClearAll = () => {
    alertService.clearAlerts();
    setAlerts([]);
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <BellIcon className="h-4 w-4" />
          {unacknowledgedCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unacknowledgedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex justify-between items-center">
            <span>Alerts</span>
            {alerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {alerts.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              No alerts to display
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`
                    p-4 rounded-lg border
                    ${alert.type === 'error' ? 'border-red-200 bg-red-50' : ''}
                    ${alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                    ${alert.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`
                        font-medium
                        ${alert.type === 'error' ? 'text-red-700' : ''}
                        ${alert.type === 'warning' ? 'text-yellow-700' : ''}
                        ${alert.type === 'info' ? 'text-blue-700' : ''}
                      `}>
                        {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                      </h4>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {format(alert.timestamp, 'PPpp')}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Metric:</span> {alert.metric}
                    <br />
                    <span className="font-medium">Value:</span> {alert.value}
                    <br />
                    <span className="font-medium">Threshold:</span> {alert.threshold}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
