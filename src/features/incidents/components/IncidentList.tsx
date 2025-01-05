/**
 * @writecarenotes.com
 * @fileoverview Incident list component for displaying incidents
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * React component for displaying a list of incidents with filtering,
 * sorting, and pagination capabilities. Implements responsive design
 * and accessibility features. Supports offline data display and
 * real-time updates when online.
 */

import React from 'react';
import { Table, Badge, Button, Pagination } from '@/components/ui';
import { useIncidentList } from '../hooks/useIncidentList';
import { formatDate, formatTime } from '../utils/formatters';
import { Incident, IncidentType, IncidentSeverity, IncidentStatus } from '../types';

interface IncidentListProps {
  incidents: Incident[];
  onViewIncident: (id: string) => void;
  onEditIncident: (id: string) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onViewIncident,
  onEditIncident,
  pagination,
  onPageChange,
  isLoading,
}) => {
  const { sortedIncidents, sortConfig, requestSort } = useIncidentList(incidents);

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return 'bg-red-100 text-red-800';
      case IncidentSeverity.MAJOR:
        return 'bg-orange-100 text-orange-800';
      case IncidentSeverity.MINOR:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.REPORTED:
        return 'bg-blue-100 text-blue-800';
      case IncidentStatus.INVESTIGATING:
        return 'bg-purple-100 text-purple-800';
      case IncidentStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case IncidentStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              onClick={() => requestSort('dateTime')}
              sortDirection={
                sortConfig?.key === 'dateTime' ? sortConfig.direction : undefined
              }
            >
              Date/Time
            </Table.HeaderCell>
            <Table.HeaderCell
              onClick={() => requestSort('type')}
              sortDirection={
                sortConfig?.key === 'type' ? sortConfig.direction : undefined
              }
            >
              Type
            </Table.HeaderCell>
            <Table.HeaderCell
              onClick={() => requestSort('severity')}
              sortDirection={
                sortConfig?.key === 'severity' ? sortConfig.direction : undefined
              }
            >
              Severity
            </Table.HeaderCell>
            <Table.HeaderCell
              onClick={() => requestSort('status')}
              sortDirection={
                sortConfig?.key === 'status' ? sortConfig.direction : undefined
              }
            >
              Status
            </Table.HeaderCell>
            <Table.HeaderCell>Location</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {isLoading ? (
            <Table.Row>
              <Table.Cell colSpan={6} className="text-center py-4">
                Loading incidents...
              </Table.Cell>
            </Table.Row>
          ) : sortedIncidents.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={6} className="text-center py-4">
                No incidents found
              </Table.Cell>
            </Table.Row>
          ) : (
            sortedIncidents.map((incident) => (
              <Table.Row key={incident.id}>
                <Table.Cell>
                  <div className="text-sm">
                    <div>{formatDate(incident.dateTime)}</div>
                    <div className="text-gray-500">{formatTime(incident.dateTime)}</div>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {incident.type.replace(/_/g, ' ')}
                </Table.Cell>
                <Table.Cell>
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge className={getStatusColor(incident.status)}>
                    {incident.status.replace(/_/g, ' ')}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{incident.location}</Table.Cell>
                <Table.Cell>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onViewIncident(incident.id)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEditIncident(incident.id)}
                    >
                      Edit
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
          {pagination.total} incidents
        </div>
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(pagination.total / pagination.pageSize)}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}; 