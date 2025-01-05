/**
 * @writecarenotes.com
 * @fileoverview Reporting page for domiciliary care
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Reporting interface for domiciliary care services, extending
 * the core reporting module with domiciliary-specific metrics.
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { ReportBuilder } from '@/features/reporting';
import type { DateRange } from '@/types';

export const Reporting = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Domiciliary Reports</h1>
          <p className="text-gray-500">
            Generate and view domiciliary care reports
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {/* Report Builder Integration */}
      <ReportBuilder
        module="DOMICILIARY"
        dateRange={dateRange}
        metrics={[
          {
            id: 'visits',
            label: 'Visit Metrics',
            options: [
              { id: 'total_visits', label: 'Total Visits' },
              { id: 'completed_visits', label: 'Completed Visits' },
              { id: 'missed_visits', label: 'Missed Visits' },
              { id: 'late_visits', label: 'Late Visits' },
              { id: 'visit_duration', label: 'Average Visit Duration' }
            ]
          },
          {
            id: 'staff',
            label: 'Staff Metrics',
            options: [
              { id: 'active_staff', label: 'Active Staff' },
              { id: 'staff_hours', label: 'Staff Hours' },
              { id: 'travel_time', label: 'Travel Time' },
              { id: 'travel_distance', label: 'Travel Distance' },
              { id: 'staff_utilization', label: 'Staff Utilization' }
            ]
          },
          {
            id: 'clients',
            label: 'Client Metrics',
            options: [
              { id: 'active_clients', label: 'Active Clients' },
              { id: 'new_clients', label: 'New Clients' },
              { id: 'client_satisfaction', label: 'Client Satisfaction' },
              { id: 'care_reviews', label: 'Care Reviews' }
            ]
          },
          {
            id: 'compliance',
            label: 'Compliance Metrics',
            options: [
              { id: 'medication_compliance', label: 'Medication Compliance' },
              { id: 'care_plan_compliance', label: 'Care Plan Compliance' },
              { id: 'incident_reports', label: 'Incident Reports' },
              { id: 'safeguarding_alerts', label: 'Safeguarding Alerts' }
            ]
          }
        ]}
        templates={[
          {
            id: 'cqc_compliance',
            label: 'CQC Compliance Report',
            description: 'Standard CQC compliance report for domiciliary care',
            metrics: ['care_plan_compliance', 'medication_compliance', 'incident_reports']
          },
          {
            id: 'operational',
            label: 'Operational Performance',
            description: 'Daily/weekly operational performance metrics',
            metrics: ['total_visits', 'staff_utilization', 'travel_time']
          },
          {
            id: 'quality',
            label: 'Quality Assurance',
            description: 'Quality metrics for service delivery',
            metrics: ['client_satisfaction', 'missed_visits', 'late_visits']
          }
        ]}
        additionalFilters={[
          {
            id: 'territory',
            label: 'Territory',
            type: 'select',
            options: [
              { value: 'all', label: 'All Territories' },
              { value: 'north', label: 'North' },
              { value: 'south', label: 'South' },
              { value: 'east', label: 'East' },
              { value: 'west', label: 'West' }
            ]
          },
          {
            id: 'service_type',
            label: 'Service Type',
            type: 'multi-select',
            options: [
              { value: 'personal_care', label: 'Personal Care' },
              { value: 'medication', label: 'Medication' },
              { value: 'domestic', label: 'Domestic Support' },
              { value: 'social', label: 'Social Support' }
            ]
          }
        ]}
      />

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <Card.Header>
            <Card.Title>CQC Reports</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2">
              <Card.Action
                icon="file"
                label="Fundamental Standards"
                onClick={() => {/* Generate report */}}
              />
              <Card.Action
                icon="file"
                label="Key Lines of Enquiry"
                onClick={() => {/* Generate report */}}
              />
              <Card.Action
                icon="file"
                label="Provider Information Return"
                onClick={() => {/* Generate report */}}
              />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Operational Reports</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2">
              <Card.Action
                icon="file"
                label="Daily Summary"
                onClick={() => {/* Generate report */}}
              />
              <Card.Action
                icon="file"
                label="Staff Performance"
                onClick={() => {/* Generate report */}}
              />
              <Card.Action
                icon="file"
                label="Route Efficiency"
                onClick={() => {/* Generate report */}}
              />
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Quality Reports</Card.Title>
          </Card.Header>
          <Card.Body>
            <div className="space-y-2">
              <Card.Action
                icon="file"
                label="Client Satisfaction"
                onClick={() => {/* Generate report */}}
              />
              <Card.Action
                icon="file"
                label="Incident Analysis"
                onClick={() => {/* Generate report */}}
              />
              <Card.Action
                icon="file"
                label="Care Quality Metrics"
                onClick={() => {/* Generate report */}}
              />
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}; 