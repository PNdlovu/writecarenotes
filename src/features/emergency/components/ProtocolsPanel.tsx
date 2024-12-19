import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  EmergencyProtocol,
  EmergencyType,
} from '../../types/emergency';
import { useEmergencyResponse } from '../../hooks/useEmergencyResponse';

export const ProtocolsPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<EmergencyType>();
  const [showForm, setShowForm] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string>();

  const {
    useProtocols,
    useProtocolDetails,
    useCreateProtocol,
  } = useEmergencyResponse();

  const { data: protocols, isLoading } = useProtocols(selectedType);
  const { data: selectedProtocolDetails } = useProtocolDetails(selectedProtocol || '');

  const createProtocol = useCreateProtocol();

  const handleCreateProtocol = async (formData: Omit<EmergencyProtocol, 'id'>) => {
    await createProtocol.mutateAsync(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Emergency Protocols</h2>
          <p className="text-sm text-gray-500">
            Manage and review emergency response protocols
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Protocol
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
      </div>

      {/* Protocols Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading protocols...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {protocols?.map((protocol) => (
            <div
              key={protocol.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProtocol(protocol.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{protocol.title}</h3>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {protocol.type}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  v{protocol.version}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                {protocol.description}
              </p>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Required Resources:</h4>
                <div className="mt-1 flex flex-wrap gap-1">
                  {protocol.requiredResources.map((resource, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Last updated: {format(new Date(protocol.lastUpdated), 'MMM d, yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protocol Details Modal */}
      {selectedProtocolDetails && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedProtocolDetails.title}
                </h3>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  {selectedProtocolDetails.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedProtocol(undefined)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {selectedProtocolDetails.description}
            </p>

            {/* Steps */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Protocol Steps:</h4>
              <div className="mt-2 space-y-4">
                {selectedProtocolDetails.steps.map((step) => (
                  <div
                    key={step.order}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {step.order}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{step.instruction}</p>
                      {step.assignedRole && (
                        <p className="mt-1 text-sm text-gray-500">
                          Assigned to: {step.assignedRole}
                        </p>
                      )}
                      {step.estimatedDuration && (
                        <p className="mt-1 text-sm text-gray-500">
                          Estimated duration: {step.estimatedDuration} minutes
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Sequence */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">Contact Sequence:</h4>
              <div className="mt-2">
                <ol className="list-decimal list-inside text-sm text-gray-600">
                  {selectedProtocolDetails.contactSequence.map((contactId) => (
                    <li key={contactId}>{contactId}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedProtocol(undefined)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Handle protocol activation
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Activate Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Protocol Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Emergency Protocol
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
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {protocols?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No protocols found matching your criteria
        </div>
      )}
    </div>
  );
};


