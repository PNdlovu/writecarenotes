import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { scheduleAPI } from '../../api/schedule-api';

interface AuditLog {
  id: string;
  action: string;
  entityType: 'SHIFT' | 'SCHEDULE' | 'STAFF' | 'TEMPLATE';
  entityId: string;
  userId: string;
  timestamp: string;
  changes: Record<string, { old: any; new: any }>;
  ipAddress: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  type:
    | 'MAX_HOURS_PER_WEEK'
    | 'MIN_REST_BETWEEN_SHIFTS'
    | 'MAX_CONSECUTIVE_DAYS'
    | 'REQUIRED_CERTIFICATIONS'
    | 'BREAK_REQUIREMENTS';
  parameters: Record<string, any>;
  enabled: boolean;
}

interface ComplianceViolation {
  id: string;
  ruleId: string;
  userId: string;
  shiftId: string;
  timestamp: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED' | 'WAIVED';
}

export function ComplianceAudit() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all');

  const { data: auditLogs = [] } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', timeRange, selectedEntityType],
    queryFn: () => scheduleAPI.getAuditLogs(timeRange, selectedEntityType),
  });

  const { data: complianceRules = [] } = useQuery<ComplianceRule[]>({
    queryKey: ['compliance-rules'],
    queryFn: () => scheduleAPI.getComplianceRules(),
  });

  const { data: violations = [] } = useQuery<ComplianceViolation[]>({
    queryKey: ['compliance-violations', timeRange],
    queryFn: () => scheduleAPI.getComplianceViolations(timeRange),
  });

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Compliance & Audit
          </h3>
          <div className="flex space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Entities</option>
              <option value="SHIFT">Shifts</option>
              <option value="SCHEDULE">Schedules</option>
              <option value="STAFF">Staff</option>
              <option value="TEMPLATE">Templates</option>
            </select>
          </div>
        </div>

        {/* Compliance Rules */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Compliance Rules
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {complianceRules.map((rule) => (
              <div
                key={rule.id}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {rule.name}
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        rule.enabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatRuleParameters(rule)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Violations */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Compliance Violations
          </h4>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Rule
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Description
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Severity
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {violations.map((violation) => (
                  <tr key={violation.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                      {format(new Date(violation.timestamp), 'MMM d, yyyy')}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {complianceRules.find((r) => r.id === violation.ruleId)
                        ?.name || violation.ruleId}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {violation.description}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getSeverityColor(
                          violation.severity
                        )}`}
                      >
                        {violation.severity}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                          violation.status
                        )}`}
                      >
                        {violation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Audit Log</h4>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-gray-50 rounded-lg p-4 text-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-gray-500">
                      {log.entityType} - {log.entityId}
                    </p>
                  </div>
                  <p className="text-gray-500">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {Object.entries(log.changes).length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-900">Changes:</p>
                    {Object.entries(log.changes).map(([field, change]) => (
                      <p key={field} className="text-xs text-gray-500">
                        {field}: {JSON.stringify(change.old)} →{' '}
                        {JSON.stringify(change.new)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRuleParameters(rule: ComplianceRule): string {
  switch (rule.type) {
    case 'MAX_HOURS_PER_WEEK':
      return `Maximum ${rule.parameters.maxHours} hours per week`;
    case 'MIN_REST_BETWEEN_SHIFTS':
      return `Minimum ${rule.parameters.minHours} hours rest between shifts`;
    case 'MAX_CONSECUTIVE_DAYS':
      return `Maximum ${rule.parameters.maxDays} consecutive days`;
    case 'REQUIRED_CERTIFICATIONS':
      return `Required certifications: ${rule.parameters.certifications.join(
        ', '
      )}`;
    case 'BREAK_REQUIREMENTS':
      return `${rule.parameters.breakMinutes} minute break required after ${rule.parameters.workHours} hours`;
    default:
      return JSON.stringify(rule.parameters);
  }
}

function getSeverityColor(severity: ComplianceViolation['severity']): string {
  switch (severity) {
    case 'LOW':
      return 'bg-blue-100 text-blue-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800';
    case 'CRITICAL':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusColor(status: ComplianceViolation['status']): string {
  switch (status) {
    case 'OPEN':
      return 'bg-yellow-100 text-yellow-800';
    case 'RESOLVED':
      return 'bg-green-100 text-green-800';
    case 'WAIVED':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
