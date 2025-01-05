import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  EmergencyDrillRecord,
  EmergencyType,
} from '../../types/emergency';
import { useEmergencyResponse } from '../../hooks/useEmergencyResponse';

export const DrillsPanel: React.FC = () => {
  const [selectedType, setSelectedType] = useState<EmergencyType>();
  const [showForm, setShowForm] = useState(false);
  const [selectedDrill, setSelectedDrill] = useState<string>();

  const {
    useDrills,
    useCreateDrill,
  } = useEmergencyResponse();

  const { data: drills, isLoading } = useDrills({
    type: selectedType,
  });

  const createDrill = useCreateDrill();

  const handleCreateDrill = async (formData: Omit<EmergencyDrillRecord, 'id'>) => {
    await createDrill.mutateAsync(formData);
    setShowForm(false);
  };

  const getPerformanceColor = (performance: 'EXCELLENT' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT') => {
    switch (performance) {
      case 'EXCELLENT':
        return 'bg-green-100 text-green-800';
      case 'SATISFACTORY':
        return 'bg-blue-100 text-blue-800';
      case 'NEEDS_IMPROVEMENT':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Emergency Drills</h2>
          <p className="text-sm text-gray-500">
            Schedule and track emergency response drills
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Schedule Drill
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

      {/* Drills List */}
      {isLoading ? (
        <div className="text-center py-8">Loading drills...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {drills?.map((drill) => (
              <li
                key={drill.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedDrill(drill.id)}
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {drill.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(drill.date), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Duration:</span>{' '}
                        <span className="font-medium">{drill.duration} minutes</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Protocol:</span>{' '}
                        <span className="font-medium">{drill.protocol}</span>
                      </div>
                    </div>

                    {/* Objectives */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Objectives:</h4>
                      <div className="mt-1 space-y-1">
                        {drill.objectives.map((objective, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={drill.completedObjectives.includes(objective)}
                              readOnly
                              className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Participants */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900">Participants:</h4>
                      <div className="mt-1 space-y-2">
                        {drill.participants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="font-medium">{participant.name}</span>
                              <span className="text-gray-500"> - {participant.role}</span>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getPerformanceColor(
                                participant.performance
                              )}`}
                            >
                              {participant.performance.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    Conducted by: {drill.conductedBy}
                    {drill.reviewedBy && (
                      <div className="mt-1">Reviewed by: {drill.reviewedBy}</div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Drill Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Schedule Emergency Drill
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
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {drills?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No drills found matching your criteria
        </div>
      )}
    </div>
  );
};


