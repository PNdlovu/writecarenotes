import React, { useState } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { DietaryAlert, AlertSeverity } from '../../types/dietary';
import { format } from 'date-fns';

interface DietaryAlertsPanelProps {
  useDietaryAlerts: (params?: {
    severity?: AlertSeverity;
    resolved?: boolean;
  }) => UseQueryResult<DietaryAlert[]>;
  useCreateAlert: () => UseMutationResult<DietaryAlert, unknown, Omit<DietaryAlert, 'id'>>;
  useUpdateAlert: () => UseMutationResult<DietaryAlert, unknown, DietaryAlert>;
}

export const DietaryAlertsPanel: React.FC<DietaryAlertsPanelProps> = ({
  useDietaryAlerts,
  useCreateAlert,
  useUpdateAlert,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | undefined>();
  const [showResolved, setShowResolved] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: alerts, isLoading } = useDietaryAlerts({
    severity: selectedSeverity,
    resolved: showResolved,
  });

  const createAlert = useCreateAlert();
  const updateAlert = useUpdateAlert();

  const handleCreateAlert = async (formData: Omit<DietaryAlert, 'id'>) => {
    await createAlert.mutateAsync(formData);
    setShowForm(false);
  };

  const handleResolveAlert = async (alert: DietaryAlert) => {
    await updateAlert.mutateAsync({
      ...alert,
      resolved: true,
      resolvedAt: new Date().toISOString(),
    });
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.HIGH:
        return 'bg-red-100 text-red-800';
      case AlertSeverity.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case AlertSeverity.LOW:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dietary Alerts</h2>
          <p className="text-sm text-gray-500">
            Monitor and manage dietary alerts and notifications
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Alert
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={selectedSeverity}
          onChange={(e) => setSelectedSeverity(e.target.value as AlertSeverity)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Severities</option>
          {Object.values(AlertSeverity).map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Show Resolved</span>
        </label>
      </div>

      {/* Alerts List */}
      {isLoading ? (
        <div className="text-center py-8">Loading alerts...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {alerts?.map((alert) => (
              <li
                key={alert.id}
                className={`p-4 hover:bg-gray-50 ${
                  alert.resolved ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(alert.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>

                    <div className="mt-2">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        {alert.description}
                      </p>
                    </div>

                    {alert.residentId && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-500">Resident:</span>{' '}
                        <span className="font-medium">{alert.residentId}</span>
                      </div>
                    )}

                    {alert.resolved && (
                      <div className="mt-2 text-sm text-gray-500">
                        Resolved on{' '}
                        {format(new Date(alert.resolvedAt!), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    {!alert.resolved && (
                      <button
                        onClick={() => handleResolveAlert(alert)}
                        className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Alert Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Alert
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
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {alerts?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No alerts found matching your criteria
        </div>
      )}
    </div>
  );
};


