import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  EmergencyIncident,
  EmergencyType,
  EmergencyStatus,
  EmergencyPriority,
} from '../../types/emergency';
import { useEmergencyResponse } from '../../hooks/useEmergencyResponse';

export const IncidentsPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<EmergencyType>();
  const [selectedStatus, setSelectedStatus] = useState<EmergencyStatus>();
  const [selectedPriority, setSelectedPriority] = useState<EmergencyPriority>();
  const [showForm, setShowForm] = useState(false);

  const {
    useIncidents,
    useCreateIncident,
    useResolveIncident,
  } = useEmergencyResponse();

  const { data: incidents, isLoading } = useIncidents({
    type: selectedType,
    status: selectedStatus,
    priority: selectedPriority,
  });

  const createIncident = useCreateIncident();
  const resolveIncident = useResolveIncident();

  const handleCreateIncident = async (formData: Omit<EmergencyIncident, 'id'>) => {
    await createIncident.mutateAsync(formData);
    setShowForm(false);
  };

  const handleResolveIncident = async (id: string, notes: string) => {
    await resolveIncident.mutateAsync({ id, notes });
  };

  const getPriorityColor = (priority: EmergencyPriority) => {
    switch (priority) {
      case EmergencyPriority.HIGH:
        return 'bg-red-100 text-red-800';
      case EmergencyPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case EmergencyPriority.LOW:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusColor = (status: EmergencyStatus) => {
    switch (status) {
      case EmergencyStatus.ACTIVE:
        return 'bg-red-100 text-red-800';
      case EmergencyStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case EmergencyStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case EmergencyStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Emergency Incidents</h2>
          <p className="text-sm text-gray-500">
            Track and manage emergency incidents
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Report Incident
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as EmergencyType)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {Object.values(EmergencyType).map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as EmergencyStatus)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {Object.values(EmergencyStatus).map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value as EmergencyPriority)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          {Object.values(EmergencyPriority).map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      {/* Incidents List */}
      {isLoading ? (
        <div className="text-center py-8">Loading incidents...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {incidents?.map((incident) => (
              <li key={incident.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          incident.priority
                        )}`}
                      >
                        {incident.priority}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(incident.reportedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="font-medium">
                        {incident.type} - {incident.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {incident.description}
                      </p>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Location:</span>{' '}
                      <span className="font-medium">
                        {incident.location.building}, Floor {incident.location.floor}
                        {incident.location.room && `, Room ${incident.location.room}`}
                      </span>
                    </div>

                    {incident.affectedResidents && incident.affectedResidents.length > 0 && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Affected Residents:</span>{' '}
                        <span className="font-medium">
                          {incident.affectedResidents.join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Timeline */}
                    {incident.timeline.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900">Timeline</h5>
                        <ul className="mt-2 space-y-2">
                          {incident.timeline.map((event, index) => (
                            <li key={index} className="text-sm">
                              <span className="text-gray-500">
                                {format(new Date(event.timestamp), 'h:mm a')}
                              </span>{' '}
                              - {event.action}
                              {event.notes && (
                                <span className="text-gray-500"> ({event.notes})</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {incident.status === EmergencyStatus.ACTIVE && (
                      <button
                        onClick={() => handleResolveIncident(incident.id, '')}
                        className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Resolve
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // View details
                      }}
                      className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Incident Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Report Emergency Incident
            </h3>
            {/* Form implementation */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save
                  setShowForm(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {incidents?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No incidents found matching your criteria
        </div>
      )}
    </div>
  );
};


