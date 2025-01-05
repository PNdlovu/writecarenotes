import React, { useState } from 'react';
import { format } from 'date-fns';
import { EmergencyResource } from '../../types/emergency';
import { useEmergencyResponse } from '../../hooks/useEmergencyResponse';

export const ResourcesPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<EmergencyResource['status']>();
  const [showForm, setShowForm] = useState(false);

  const {
    useResources,
    useUpdateResourceStatus,
  } = useEmergencyResponse();

  const { data: resources, isLoading } = useResources({
    type: selectedType,
    status: selectedStatus,
  });

  const updateResourceStatus = useUpdateResourceStatus();

  const handleUpdateStatus = async (
    id: string,
    status: EmergencyResource['status'],
    notes?: string
  ) => {
    await updateResourceStatus.mutateAsync({ id, status, notes });
  };

  const getStatusColor = (status: EmergencyResource['status']) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800';
      case 'IN_USE':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEPLETED':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Emergency Resources</h2>
          <p className="text-sm text-gray-500">
            Track and manage emergency response resources
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Filter by type..."
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as EmergencyResource['status'])}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="IN_USE">In Use</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="DEPLETED">Depleted</option>
        </select>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources?.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{resource.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {resource.type}
                  </span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    resource.status
                  )}`}
                >
                  {resource.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Location:</span>{' '}
                  <span className="font-medium">{resource.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Quantity:</span>{' '}
                  <span className="font-medium">{resource.quantity}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Checked:</span>{' '}
                  <span className="font-medium">
                    {format(new Date(resource.lastChecked), 'MMM d, yyyy')}
                  </span>
                </div>
                {resource.nextMaintenanceDate && (
                  <div>
                    <span className="text-gray-500">Next Maintenance:</span>{' '}
                    <span className="font-medium">
                      {format(new Date(resource.nextMaintenanceDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              {resource.notes && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900">Notes:</h4>
                  <p className="mt-1 text-sm text-gray-600">{resource.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.status !== 'AVAILABLE' && (
                  <button
                    onClick={() => handleUpdateStatus(resource.id, 'AVAILABLE')}
                    className="px-2 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md"
                  >
                    Mark Available
                  </button>
                )}
                {resource.status !== 'IN_USE' && (
                  <button
                    onClick={() => handleUpdateStatus(resource.id, 'IN_USE')}
                    className="px-2 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md"
                  >
                    Mark In Use
                  </button>
                )}
                {resource.status !== 'MAINTENANCE' && (
                  <button
                    onClick={() => handleUpdateStatus(resource.id, 'MAINTENANCE')}
                    className="px-2 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded-md"
                  >
                    Schedule Maintenance
                  </button>
                )}
                {resource.status !== 'DEPLETED' && (
                  <button
                    onClick={() => handleUpdateStatus(resource.id, 'DEPLETED')}
                    className="px-2 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md"
                  >
                    Mark Depleted
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Resource Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Emergency Resource
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
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {resources?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No resources found matching your criteria
        </div>
      )}
    </div>
  );
};


