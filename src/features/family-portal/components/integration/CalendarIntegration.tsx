/**
 * @fileoverview Calendar Integration Component
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Calendar synchronization with external calendar services
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccessibility } from '../../hooks/useAccessibility';
import { useToast } from "@/components/ui/use-toast";

interface CalendarIntegrationProps {
  residentId: string;
  familyMemberId: string;
}

interface CalendarProvider {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  lastSync?: Date;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: string;
  provider: string;
  status: 'synced' | 'pending' | 'failed';
}

interface SyncSettings {
  provider: string;
  syncDirection: 'both' | 'import' | 'export';
  eventTypes: string[];
  autoSync: boolean;
  syncFrequency: number; // in minutes
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [providers, setProviders] = useState<CalendarProvider[]>([
    {
      id: 'google',
      name: 'Google Calendar',
      icon: '/icons/google-calendar.svg',
      connected: false
    },
    {
      id: 'outlook',
      name: 'Microsoft Outlook',
      icon: '/icons/outlook.svg',
      connected: false
    },
    {
      id: 'apple',
      name: 'Apple Calendar',
      icon: '/icons/apple-calendar.svg',
      connected: false
    }
  ]);

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { toast } = useToast();
  const { getAriaProps } = useAccessibility();

  const connectCalendar = async (providerId: string) => {
    try {
      // Implement OAuth flow for calendar provider
      toast({
        title: "Calendar Connected",
        description: `Successfully connected to ${providerId} calendar`,
      });
      
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, connected: true, lastSync: new Date() } : p
      ));
      
      setShowConnectDialog(false);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to calendar service",
        variant: "destructive"
      });
    }
  };

  const disconnectCalendar = async (providerId: string) => {
    try {
      // Implement disconnect logic
      toast({
        title: "Calendar Disconnected",
        description: `Successfully disconnected from ${providerId} calendar`,
      });
      
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, connected: false, lastSync: undefined } : p
      ));
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect calendar service",
        variant: "destructive"
      });
    }
  };

  const syncCalendar = async (providerId: string) => {
    try {
      // Implement calendar sync logic
      toast({
        title: "Calendar Synced",
        description: "Calendar events have been synchronized",
      });
      
      setProviders(prev => prev.map(p => 
        p.id === providerId ? { ...p, lastSync: new Date() } : p
      ));
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize calendar events",
        variant: "destructive"
      });
    }
  };

  const updateSyncSettings = async (settings: SyncSettings) => {
    try {
      // Implement settings update logic
      toast({
        title: "Settings Updated",
        description: "Calendar sync settings have been updated",
      });
      
      setShowSettingsDialog(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update sync settings",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Calendar Integration</h2>
          <p className="text-muted-foreground">
            Sync your care schedule with external calendars
          </p>
        </div>
        <Button onClick={() => setShowConnectDialog(true)}>
          Connect Calendar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Connected Calendars */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Connected Calendars</h3>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <img
                      src={provider.icon}
                      alt={provider.name}
                      className="w-6 h-6"
                    />
                    <div>
                      <h4 className="font-semibold">{provider.name}</h4>
                      {provider.lastSync && (
                        <p className="text-sm text-muted-foreground">
                          Last sync: {provider.lastSync.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {provider.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncCalendar(provider.id)}
                        >
                          Sync Now
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectCalendar(provider.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => connectCalendar(provider.id)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sync Status */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Sync Status</h3>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.start.toLocaleString()} - {event.end.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={
                    event.status === 'synced' ? 'default' :
                    event.status === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {event.status}
                  </Badge>
                </div>
                <p className="text-sm mt-2">
                  Provider: {event.provider}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Sync Settings */}
        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Sync Settings</h3>
            <Button
              variant="outline"
              onClick={() => setShowSettingsDialog(true)}
            >
              Configure
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Auto-sync</span>
              <Switch checked={true} />
            </div>
            <div className="flex justify-between items-center">
              <span>Sync Frequency</span>
              <span>30 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Event Types</span>
              <span>All</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Calendar</DialogTitle>
            <DialogDescription>
              Choose a calendar service to connect
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => connectCalendar(provider.id)}
                disabled={provider.connected}
              >
                <img
                  src={provider.icon}
                  alt={provider.name}
                  className="w-6 h-6 mr-2"
                />
                {provider.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Settings</DialogTitle>
            <DialogDescription>
              Configure calendar synchronization settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sync Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Two-way Sync</SelectItem>
                  <SelectItem value="import">Import Only</SelectItem>
                  <SelectItem value="export">Export Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sync Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-sync" />
              <label htmlFor="auto-sync">Enable Auto-sync</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateSyncSettings({
              provider: '',
              syncDirection: 'both',
              eventTypes: [],
              autoSync: true,
              syncFrequency: 30
            })}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


