/**
 * @writecarenotes.com
 * @fileoverview Staff management component for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Manages domiciliary care staff, including territory assignments,
 * availability, and route management. Integrates with staff service
 * for comprehensive staff management.
 */

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { staffService } from '@/features/staff';
import { routeOptimizationService } from '../../services';
import type { Staff } from '@/types';
import type { RouteOptimization } from '../../types';

interface StaffManagementProps {
  date?: Date;
}

export const StaffManagement = ({ date = new Date() }: StaffManagementProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [routes, setRoutes] = useState<Record<string, RouteOptimization>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStaffData();
  }, [date]);

  const loadStaffData = async () => {
    try {
      setIsLoading(true);
      const staffData = await staffService.getAvailableStaff(date);
      setStaff(staffData);

      // Load route optimizations for each staff member
      const routeData: Record<string, RouteOptimization> = {};
      await Promise.all(
        staffData.map(async (member) => {
          try {
            const route = await routeOptimizationService.optimizeRoute(
              member.id,
              date,
              []
            );
            routeData[member.id] = route;
          } catch (err) {
            console.error(`Failed to load route for ${member.id}:`, err);
          }
        })
      );
      setRoutes(routeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <Card.Header>
          <Card.Title>Staff Management</Card.Title>
          <Card.Description>
            Manage domiciliary care staff for {format(date, 'PPP')}
          </Card.Description>
        </Card.Header>
        <Card.Body>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
              <Tabs.Trigger value="territories">Territories</Tabs.Trigger>
              <Tabs.Trigger value="routes">Routes</Tabs.Trigger>
              <Tabs.Trigger value="availability">Availability</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Staff Member</Table.Head>
                    <Table.Head>Status</Table.Head>
                    <Table.Head>Territory</Table.Head>
                    <Table.Head>Visits Today</Table.Head>
                    <Table.Head>Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {staff.map((member) => (
                    <Table.Row key={member.id}>
                      <Table.Cell>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">
                            {member.role}
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge>
                          {member.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {member.territory}
                      </Table.Cell>
                      <Table.Cell>
                        {routes[member.id]?.visits.length || 0} visits
                      </Table.Cell>
                      <Table.Cell>
                        <Button size="sm">View Details</Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Tabs.Content>

            <Tabs.Content value="territories">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map((member) => (
                  <Card key={member.id}>
                    <Card.Header>
                      <Card.Title>{member.name}</Card.Title>
                      <Card.Description>
                        Territory: {member.territory}
                      </Card.Description>
                    </Card.Header>
                    <Card.Body>
                      <div className="h-48">
                        {/* Territory Map Component */}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="routes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staff.map((member) => {
                  const route = routes[member.id];
                  return (
                    <Card key={member.id}>
                      <Card.Header>
                        <Card.Title>{member.name}</Card.Title>
                        <Card.Description>
                          {route?.visits.length || 0} visits scheduled
                        </Card.Description>
                      </Card.Header>
                      <Card.Body>
                        <div className="h-48">
                          {/* Route Map Component */}
                        </div>
                        {route && (
                          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Total Distance:</span>
                              <br />
                              {(route.totalDistance / 1000).toFixed(1)} km
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>
                              <br />
                              {Math.round(route.estimatedDuration)} minutes
                            </div>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </Tabs.Content>

            <Tabs.Content value="availability">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Staff Member</Table.Head>
                    <Table.Head>Working Hours</Table.Head>
                    <Table.Head>Break Times</Table.Head>
                    <Table.Head>Transport</Table.Head>
                    <Table.Head>Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {staff.map((member) => (
                    <Table.Row key={member.id}>
                      <Table.Cell>{member.name}</Table.Cell>
                      <Table.Cell>
                        {format(member.workingHours.start, 'p')} - 
                        {format(member.workingHours.end, 'p')}
                      </Table.Cell>
                      <Table.Cell>
                        {member.breaks.map((break_, i) => (
                          <div key={i}>
                            {format(break_.start, 'p')} - {format(break_.end, 'p')}
                          </div>
                        ))}
                      </Table.Cell>
                      <Table.Cell>
                        {member.transport}
                      </Table.Cell>
                      <Table.Cell>
                        <Button size="sm">Edit Schedule</Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Tabs.Content>
          </Tabs>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}; 