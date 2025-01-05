import React, { useState } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { NutritionLog } from '../../types/dietary';
import { format } from 'date-fns';

interface NutritionLogsPanelProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  useNutritionLogs: (date: Date, residentId?: string) => UseQueryResult<NutritionLog[]>;
  useCreateNutritionLog: () => UseMutationResult<NutritionLog, unknown, Omit<NutritionLog, 'id'>>;
}

export const NutritionLogsPanel: React.FC<NutritionLogsPanelProps> = ({
  selectedDate,
  setSelectedDate,
  useNutritionLogs,
  useCreateNutritionLog,
}) => {
  const [selectedResidentId, setSelectedResidentId] = useState<string>();
  const [showForm, setShowForm] = useState(false);

  const { data: nutritionLogs, isLoading } = useNutritionLogs(selectedDate, selectedResidentId);
  const createNutritionLog = useCreateNutritionLog();

  const handleCreateLog = async (formData: Omit<NutritionLog, 'id'>) => {
    await createNutritionLog.mutateAsync(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Nutrition Logs</h2>
          <p className="text-sm text-gray-500">
            Track and monitor resident nutrition data
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Log
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <input
          type="text"
          placeholder="Search by resident ID..."
          value={selectedResidentId}
          onChange={(e) => setSelectedResidentId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Nutrition Logs List */}
      {isLoading ? (
        <div className="text-center py-8">Loading nutrition logs...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {nutritionLogs?.map((log) => (
              <li key={log.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Resident ID: {log.residentId}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'h:mm a')}
                      </span>
                    </div>

                    {/* Nutrition Summary */}
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Calories</span>
                        <div className="font-medium">{log.totalCalories} kcal</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Protein</span>
                        <div className="font-medium">{log.totalProtein}g</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Carbs</span>
                        <div className="font-medium">{log.totalCarbohydrates}g</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Fat</span>
                        <div className="font-medium">{log.totalFat}g</div>
                      </div>
                    </div>

                    {/* Hydration */}
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Hydration</span>
                      <div className="font-medium">{log.hydrationAmount}ml</div>
                    </div>

                    {/* Notes */}
                    {log.notes && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Notes</span>
                        <div className="text-sm mt-1">{log.notes}</div>
                      </div>
                    )}

                    {/* Concerns */}
                    {log.concerns && log.concerns.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-500">Concerns</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {log.concerns.map((concern, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                            >
                              {concern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recorded By */}
                  <div className="text-sm text-gray-500">
                    Recorded by: {log.recordedBy}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Log Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Create Nutrition Log
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

      {nutritionLogs?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No nutrition logs found for the selected date and resident
        </div>
      )}
    </div>
  );
};


