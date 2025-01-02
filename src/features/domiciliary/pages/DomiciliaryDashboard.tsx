/**
 * @writecarenotes.com
 * @fileoverview Domiciliary care dashboard page
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main dashboard for domiciliary care services, providing overview
 * of visits, staff, and key metrics.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DatePicker } from '@/components/ui/DatePicker';
import { Tabs } from '@/components/ui/Tabs';
import { Stats } from '@/components/ui/Stats';
import { VisitList } from '../components/visits/VisitList';
import { DomiciliaryStaffView } from '../components/staff/DomiciliaryStaffView';
import { RouteOptimizer } from '../components/routes/RouteOptimizer';
import type { ScheduledVisit } from '../types';

export const DomiciliaryDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Domiciliary Care</h1>
          <p className="text-gray-500">
            {format(selectedDate, 'PPPP')}
          </p>
        </div>
        <DatePicker
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stats
          title="Total Visits"
          value="24"
          trend={{
            value: 8,
            label: 'vs. yesterday'
          }}
        />
        <Stats
          title="Active Staff"
          value="12"
          trend={{
            value: -1,
            label: 'vs. yesterday',
            direction: 'down'
          }}
        />
        <Stats
          title="Total Distance"
          value="156 km"
          trend={{
            value: 12,
            label: 'vs. yesterday'
          }}
        />
        <Stats
          title="Completion Rate"
          value="98%"
          trend={{
            value: 2,
            label: 'vs. yesterday'
          }}
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="visits">Visits</Tabs.Trigger>
          <Tabs.Trigger value="staff">Staff</Tabs.Trigger>
          <Tabs.Trigger value="routes">Routes</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Today's Visits */}
            <Card>
              <Card.Header>
                <Card.Title>Today's Visits</Card.Title>
              </Card.Header>
              <Card.Body>
                <VisitList
                  visits={[]} // Would be populated from service
                />
              </Card.Body>
            </Card>

            {/* Active Staff */}
            <Card>
              <Card.Header>
                <Card.Title>Active Staff</Card.Title>
              </Card.Header>
              <Card.Body>
                <DomiciliaryStaffView date={selectedDate} />
              </Card.Body>
            </Card>
          </div>
        </Tabs.Content>

        <Tabs.Content value="visits">
          <div className="mt-4">
            <VisitList
              visits={[]} // Would be populated from service
            />
          </div>
        </Tabs.Content>

        <Tabs.Content value="staff">
          <div className="mt-4">
            <DomiciliaryStaffView date={selectedDate} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="routes">
          <div className="mt-4">
            <RouteOptimizer
              staffId="" // Would be selected from staff list
              date={selectedDate}
              visits={[]}
            />
          </div>
        </Tabs.Content>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card.Action
              icon="calendar"
              label="Schedule Visit"
              onClick={() => {/* Open scheduler */}}
            />
            <Card.Action
              icon="users"
              label="Assign Staff"
              onClick={() => {/* Open staff assignment */}}
            />
            <Card.Action
              icon="route"
              label="Optimize Routes"
              onClick={() => setActiveTab('routes')}
            />
            <Card.Action
              icon="file"
              label="Generate Report"
              onClick={() => {/* Open report generator */}}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}; 