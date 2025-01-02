/**
 * @writecarenotes.com
 * @fileoverview Route optimization for domiciliary care staff
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route optimization component for managing domiciliary care staff routes,
 * territories, and travel time calculations. Integrates with mapping services
 * and staff scheduling.
 */

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs/tabs';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Form/Select';
import dynamic from 'next/dynamic';

// Dynamically import Map component with no SSR
const Map = dynamic<MapProps>(() => import('@/components/ui/Map'), { ssr: false });
import type { MapProps, Location, MapMarker, Territory as MapTerritory } from '@/components/ui/Map';

import { useStaffMembers } from '@/features/staff/hooks';
import { useVisits } from '@/features/visits/hooks';
import { useClients } from '@/features/clients/hooks';
import { useTerritory } from '@/features/territory/hooks';
import type { StaffMember } from '@/features/staff/types';
import type { Client } from '@/features/clients/types';
import type { Visit } from '@/features/visits/types';
import type { Territory } from '@/features/territory/types';

type TabValue = 'routes' | 'territories' | 'analytics';

export const RouteOptimizer = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabValue>('routes');
  const { data: staff = [] } = useStaffMembers();
  const { visits = [] } = useVisits();
  const { clients = [] } = useClients();
  const { territories = [], updateTerritory } = useTerritory();

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabValue);
  };

  const mapMarkers: MapMarker[] = [
    ...staff.map(member => ({
      id: member.id,
      position: member.location,
      type: 'staff' as const
    })),
    ...clients.map(client => ({
      id: client.id,
      position: client.location,
      type: 'client' as const
    }))
  ];

  const mapTerritories: MapTerritory[] = territories.map(territory => ({
    id: territory.id,
    bounds: territory.clients.map(client => client.location)
  }));

  const handleTerritoryUpdate = (territory: MapTerritory) => {
    const territoryToUpdate = territories.find(t => t.id === territory.id);
    if (territoryToUpdate) {
      updateTerritory({
        id: territory.id,
        data: {
          ...territoryToUpdate,
          clients: territory.bounds.map((location, index) => ({
            id: `${territory.id}-client-${index}`,
            name: `Client ${index + 1}`,
            location
          }))
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Route Optimization</CardTitle>
          <p className="text-sm text-gray-500">
            Optimize staff routes and manage territories
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="territories">Territories</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="routes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Staff</h3>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        {staff.map(member => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Visits</h3>
                    <div className="space-y-2">
                      {visits.map(visit => (
                        <Card key={visit.id}>
                          <CardContent className="p-3">
                            <div className="flex justify-between">
                              <div>
                                <p className="font-medium">{visit.client.name}</p>
                                <p className="text-sm text-gray-500">
                                  {visit.scheduledTime}
                                </p>
                              </div>
                              <Button size="sm" variant="outline">
                                Assign
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Map
                    center={{ lat: 51.5074, lng: -0.1278 }}
                    zoom={10}
                    markers={mapMarkers}
                    territories={mapTerritories}
                    onTerritoryUpdate={handleTerritoryUpdate}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="territories">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {territories.map(territory => (
                  <Card key={territory.id}>
                    <CardContent>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{territory.name}</h3>
                          <p className="text-sm text-gray-500">
                            {territory.staff.length} staff • {territory.clients.length} clients
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Staff</h4>
                          <div className="space-y-1">
                            {territory.staff.map(member => (
                              <p key={member.id} className="text-sm">
                                {member.name}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2">Coverage</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Area</p>
                              <p>{territory.area} km²</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Travel Time</p>
                              <p>{territory.averageTravelTime} min</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Travel Time Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add travel time charts */}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Territory Coverage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add territory coverage charts */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}; 