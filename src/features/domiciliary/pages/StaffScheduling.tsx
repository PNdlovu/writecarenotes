/**
 * @writecarenotes.com
 * @fileoverview Staff scheduling for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Staff scheduling interface for domiciliary care services.
 * Integrates with route optimization and visit management
 * to provide efficient staff allocation and rota management.
 */

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar } from '@/components/ui/Calendar';
import { Select } from '@/components/ui/Select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { useStaff } from '@/features/staff';
import { useVisits } from '@/features/visits';
import { useRoutes } from '@/features/routes';
import type { Staff, Visit, Route, DateRange } from '@/types';

export const StaffScheduling = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('rota');
  const { staff, scheduleStaff } = useStaff();
  const { visits } = useVisits();
  const { routes } = useRoutes();

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff Scheduling</h1>
          <p className="text-gray-500">Manage staff rotas and assignments</p>
        </div>
        <div className="flex gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button>
            Generate Rota
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Staff List & Filters */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <Card.Header>
              <Card.Title>Staff Filters</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Territory</label>
                  <Select
                    options={[
                      { value: 'all', label: 'All Territories' },
                      { value: 'north', label: 'North' },
                      { value: 'south', label: 'South' }
                    ]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select
                    options={[
                      { value: 'all', label: 'All Roles' },
                      { value: 'carer', label: 'Care Worker' },
                      { value: 'senior', label: 'Senior Carer' },
                      { value: 'coordinator', label: 'Care Coordinator' }
                    ]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Skills</label>
                  <Select
                    isMulti
                    options={[
                      { value: 'medication', label: 'Medication' },
                      { value: 'manual_handling', label: 'Manual Handling' },
                      { value: 'dementia', label: 'Dementia Care' },
                      { value: 'peg', label: 'PEG Feeding' }
                    ]}
                  />
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Staff List</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2">
                {staff.map((member: Staff) => (
                  <div
                    key={member.id}
                    className="p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      <Badge variant={member.status}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Schedule Interface */}
        <div className="lg:col-span-9">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Trigger value="rota">Rota</Tabs.Trigger>
              <Tabs.Trigger value="availability">Availability</Tabs.Trigger>
              <Tabs.Trigger value="workload">Workload</Tabs.Trigger>
              <Tabs.Trigger value="compliance">Compliance</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="rota">
              <Card>
                <Card.Body className="p-0">
                  <div className="grid grid-cols-8 border-b">
                    <div className="p-4 border-r font-medium">Staff</div>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="p-4 border-r font-medium text-center">
                        {/* Format date */}
                        Mon 21
                      </div>
                    ))}
                  </div>
                  
                  {staff.map((member: Staff) => (
                    <div key={member.id} className="grid grid-cols-8 border-b">
                      <div className="p-4 border-r">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                      {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="p-2 border-r min-h-[100px]">
                          <div className="space-y-1">
                            {/* Shifts */}
                            <div className="bg-blue-50 p-2 rounded text-sm">
                              <p className="font-medium">Morning</p>
                              <p className="text-gray-500">07:00 - 15:00</p>
                              <p className="text-xs">4 visits</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Tabs.Content>

            <Tabs.Content value="availability">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <Card.Header>
                    <Card.Title>Staff Availability</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {staff.map((member: Staff) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{member.name}</p>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 7 }).map((_, i) => (
                              <div
                                key={i}
                                className="h-8 bg-green-100 rounded"
                                title="Available"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Leave & Absences</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {staff.map((member: Staff) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-gray-500">
                                12 days remaining
                              </p>
                            </div>
                            <Button size="sm">
                              Book Leave
                            </Button>
                          </div>
                          {/* Leave calendar */}
                          <Calendar
                            mode="single"
                            selected={new Date()}
                            className="rounded-md border"
                          />
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Tabs.Content>

            <Tabs.Content value="workload">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="md:col-span-2">
                  <Card.Header>
                    <Card.Title>Workload Distribution</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {/* Add workload chart */}
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Staff Utilization</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {staff.map((member: Staff) => (
                        <div key={member.id} className="space-y-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm">85%</p>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: '85%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Visit Distribution</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    {/* Add visit distribution chart */}
                  </Card.Body>
                </Card>
              </div>
            </Tabs.Content>

            <Tabs.Content value="compliance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <Card.Header>
                    <Card.Title>Working Time Compliance</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {staff.map((member: Staff) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{member.name}</p>
                            <Badge
                              variant={
                                member.weeklyHours <= 48 ? 'success' : 'error'
                              }
                            >
                              {member.weeklyHours}h
                            </Badge>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                member.weeklyHours <= 48
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                              style={{
                                width: `${(member.weeklyHours / 48) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <Card>
                  <Card.Header>
                    <Card.Title>Break Compliance</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {staff.map((member: Staff) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{member.name}</p>
                            <Badge
                              variant={
                                member.breakCompliance ? 'success' : 'error'
                              }
                            >
                              {member.breakCompliance ? 'Compliant' : 'Review'}
                            </Badge>
                          </div>
                          {!member.breakCompliance && (
                            <p className="text-sm text-red-500">
                              Missing breaks on Mon, Wed
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>

                <Card className="md:col-span-2">
                  <Card.Header>
                    <Card.Title>Training & Certification</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <div className="space-y-4">
                      {staff.map((member: Staff) => (
                        <div key={member.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{member.name}</p>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            {member.certifications?.map((cert) => (
                              <Badge
                                key={cert.id}
                                variant={
                                  cert.isValid ? 'success' : 'error'
                                }
                              >
                                {cert.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
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