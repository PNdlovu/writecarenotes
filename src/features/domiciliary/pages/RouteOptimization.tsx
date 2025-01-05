/**
 * @writecarenotes.com
 * @fileoverview Route optimization for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route optimization interface for domiciliary care services.
 * Provides tools for planning efficient staff routes,
 * minimizing travel time, and managing territories.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Map } from '@/components/ui/Map';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useRoutes } from '@/features/routes';
import { useStaff } from '@/features/staff';
import { useVisits } from '@/features/visits';
import type { Route, Staff, Visit, Territory } from '@/types';

export const RouteOptimization = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('routes');
  const { routes, optimizeRoutes, updateRoute } = useRoutes();
  const { staff } = useStaff();
  const { visits } = useVisits();

  const handleOptimize = async () => {
    await optimizeRoutes({
      date: selectedDate,
      staffId: selectedStaff,
      constraints: {
        maxTravelTime: 30, // minutes
        maxVisits: 8,
        requiredBreaks: true
      }
    });
  };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Route Optimization</h1>
          <p className="text-gray-500">Plan and optimize staff routes</p>
        </div>
        <div className="flex gap-2">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
          />
          <Button onClick={handleOptimize}>
            Optimize Routes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Staff Selection & Stats */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <Card.Header>
              <Card.Title>Staff Selection</Card.Title>
            </Card.Header>
            <Card.Body>
              <Select
                value={selectedStaff}
                onChange={(value) => setSelectedStaff(value)}
                options={staff.map((s: Staff) => ({
                  value: s.id,
                  label: s.name
                }))}
                placeholder="Select staff member"
              />
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Route Statistics</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Total Distance</label>
                  <p className="text-2xl font-bold">24.5 miles</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Travel Time</label>
                  <p className="text-2xl font-bold">1h 45m</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Visits</label>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Map and Route Details */}
        <div className="lg:col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="routes">Routes</Tabs.Trigger>
              <Tabs.Trigger value="territories">Territories</Tabs.Trigger>
              <Tabs.Trigger value="analysis">Analysis</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="routes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Map */}
                <div className="md:col-span-2 h-[500px]">
                  <Map
                    center={[51.5074, -0.1278]}
                    zoom={12}
                    routes={routes}
                    visits={visits}
                    staff={staff}
                    selectedStaff={selectedStaff}
                    onRouteUpdate={updateRoute}
                  />
                </div>

                {/* Route Details */}
                <Card>
                  <Card.Header>
                    <Card.Title>Route Details</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {routes.map((route: Route) => (
                        <div key={route.id} className="flex items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {route.startTime} - {route.endTime}
                              </span>
                              <Badge variant={route.status}>
                                {route.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500">
                              {route.visits.length} visits • {route.distance} miles
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                {/* Visit Sequence */}
                <Card>
                  <Card.Header>
                    <Card.Title>Visit Sequence</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {visits.map((visit: Visit, index: number) => (
                        <div key={visit.id} className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{visit.client.name}</p>
                            <p className="text-sm text-gray-500">
                              {visit.scheduledTime} • {visit.duration} mins
                            </p>
                            <p className="text-sm">{visit.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tabs.Content>

            <Tabs.Content value="territories">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Territory Map */}
                <div className="md:col-span-2 h-[500px]">
                  <Map
                    center={[51.5074, -0.1278]}
                    zoom={12}
                    territories={true}
                    onTerritoryUpdate={(territory: Territory) => {
                      // Update territory
                    }}
                  />
                </div>

                {/* Territory Management */}
                <Card>
                  <Card.Header>
                    <Card.Title>Territory Management</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <Button className="w-full" variant="outline">
                        Draw New Territory
                      </Button>
                      <div className="space-y-2">
                        {/* Territory list */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">North Region</p>
                            <p className="text-sm text-gray-500">
                              4 staff • 12 clients
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Territory Analysis */}
                <Card>
                  <Card.Header>
                    <Card.Title>Territory Analysis</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Workload Distribution</h4>
                        {/* Add workload chart */}
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Travel Times</h4>
                        {/* Add travel time analysis */}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tabs.Content>

            <Tabs.Content value="analysis">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Route Efficiency */}
                <Card className="md:col-span-2">
                  <Card.Header>
                    <Card.Title>Route Efficiency Analysis</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {/* Add efficiency charts */}
                  </Card.Body>
                </Card>

                {/* Travel Time Analysis */}
                <Card>
                  <Card.Header>
                    <Card.Title>Travel Time Analysis</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {/* Add travel time breakdown */}
                  </Card.Body>
                </Card>

                {/* Optimization Suggestions */}
                <Card>
                  <Card.Header>
                    <Card.Title>Optimization Suggestions</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-2">
                      {/* Add suggestions list */}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      </div>
    </div>
  );
}; 