/**
 * @writecarenotes.com
 * @fileoverview Visit management for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Mobile-first visit management interface for domiciliary care services.
 * Supports scheduling, monitoring, and managing care visits with
 * responsive design for both desktop and mobile use.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Calendar } from '@/components/ui/Calendar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useVisits } from '@/features/visits';
import { useStaff } from '@/features/staff';
import { useClients } from '@/features/clients';
import type { Visit, Staff, Client } from '@/types';

export const VisitManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const { visits, scheduleVisit, updateVisit } = useVisits();
  const { staff } = useStaff();
  const { clients } = useClients();

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visit Management</h1>
          <p className="text-gray-500">Schedule and manage care visits</p>
        </div>
        <Button onClick={() => {/* Open schedule modal */}}>
          Schedule Visit
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Calendar - Hidden on mobile, shown on side on desktop */}
        <Card className="hidden lg:block lg:col-span-3">
          <Card.Body className="p-0">
            <Calendar
              value={selectedDate}
              onChange={setSelectedDate}
              visits={visits}
            />
          </Card.Body>
        </Card>

        {/* Visit Management Interface */}
        <div className="lg:col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="w-full overflow-x-auto">
              <Tabs.Trigger value="schedule">Schedule</Tabs.Trigger>
              <Tabs.Trigger value="today">Today's Visits</Tabs.Trigger>
              <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
              <Tabs.Trigger value="unassigned">Unassigned</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="schedule">
              <div className="lg:hidden mb-4">
                <Calendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  visits={visits}
                  mode="compact"
                />
              </div>

              <div className="space-y-4">
                {visits.map((visit: Visit) => (
                  <Card key={visit.id} className="hover:shadow-md transition-shadow">
                    <Card.Body>
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{visit.client.name}</h3>
                            <Badge variant={visit.status}>{visit.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {visit.scheduledTime} - {visit.duration} mins
                          </p>
                          <p className="text-sm">{visit.address}</p>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                          {visit.staff ? (
                            <div className="text-sm">
                              <p className="font-medium">{visit.staff.name}</p>
                              <p className="text-gray-500">{visit.staff.role}</p>
                            </div>
                          ) : (
                            <Badge variant="warning">Unassigned</Badge>
                          )}
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Visit Tasks */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Tasks</h4>
                        <div className="flex flex-wrap gap-2">
                          {visit.tasks.map((task) => (
                            <Badge key={task.id} variant="secondary">
                              {task.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                        <Button size="sm" variant="ghost">
                          View Care Plan
                        </Button>
                        <Button size="sm" variant="ghost">
                          Contact Client
                        </Button>
                        <Button size="sm" variant="ghost">
                          View History
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="today">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visits
                  .filter((v: Visit) => /* is today */)
                  .map((visit: Visit) => (
                    <Card key={visit.id}>
                      <Card.Body>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{visit.client.name}</h3>
                            <p className="text-sm text-gray-500">
                              {visit.scheduledTime}
                            </p>
                          </div>
                          <Badge variant={visit.status}>{visit.status}</Badge>
                        </div>

                        <div className="mt-4 space-y-2">
                          <Button className="w-full" size="sm">
                            Start Visit
                          </Button>
                          <Button variant="outline" className="w-full" size="sm">
                            View Details
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="upcoming">
              <div className="space-y-4">
                {/* Group visits by date */}
                {Object.entries(
                  visits.reduce((acc, visit: Visit) => {
                    const date = /* format date */;
                    return {
                      ...acc,
                      [date]: [...(acc[date] || []), visit]
                    };
                  }, {})
                ).map(([date, visits]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-2">{date}</h3>
                    <div className="space-y-2">
                      {visits.map((visit: Visit) => (
                        <Card key={visit.id}>
                          <Card.Body>
                            {/* Similar to schedule view but more compact */}
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>

            <Tabs.Content value="unassigned">
              <div className="space-y-4">
                {visits
                  .filter((v: Visit) => !v.staff)
                  .map((visit: Visit) => (
                    <Card key={visit.id}>
                      <Card.Body>
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{visit.client.name}</h3>
                            <p className="text-sm text-gray-500">
                              {visit.scheduledTime} - {visit.duration} mins
                            </p>
                            <p className="text-sm">{visit.address}</p>
                          </div>

                          <div>
                            <Button size="sm">
                              Assign Staff
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
              </div>
            </Tabs.Content>
          </Tabs>
        </div>
      </div>
    </div>
  );
}; 