import React from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { MealService, MealType } from '../../types/dietary';
import { format } from 'date-fns';

interface MealServicesPanelProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  useMealServices: (date: Date, mealType?: MealType) => UseQueryResult<MealService[]>;
  useRecordMealService: () => UseMutationResult<MealService, unknown, Omit<MealService, 'id'>>;
}

export const MealServicesPanel: React.FC<MealServicesPanelProps> = ({
  selectedDate,
  setSelectedDate,
  useMealServices,
  useRecordMealService,
}) => {
  const [selectedMealType, setSelectedMealType] = React.useState<MealType | undefined>();
  const [showForm, setShowForm] = React.useState(false);

  const { data: mealServices, isLoading } = useMealServices(selectedDate, selectedMealType);
  const recordMealService = useRecordMealService();

  const handleRecordService = async (formData: Omit<MealService, 'id'>) => {
    await recordMealService.mutateAsync(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Meal Services</h2>
          <p className="text-sm text-gray-500">
            Record and track meal services for residents
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Record Service
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
        <select
          value={selectedMealType}
          onChange={(e) => setSelectedMealType(e.target.value as MealType)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Meal Types</option>
          {Object.values(MealType).map((type) => (
            <option key={type} value={type}>
              {type.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Meal Services List */}
      {isLoading ? (
        <div className="text-center py-8">Loading meal services...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {mealServices?.map((service) => (
              <li key={service.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {service.mealType.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(service.dateServed), 'h:mm a')}
                      </span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="text-gray-500">Resident:</span>{' '}
                      <span className="font-medium">{service.residentId}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {service.itemsServed.map((item, index) => (
                        <div key={index} className="text-sm">
                          <span>{item.menuItemId}:</span>{' '}
                          <span className="text-gray-500">{item.consumed}% consumed</span>
                          {item.notes && (
                            <span className="text-gray-500"> - {item.notes}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    {service.hydrationAmount && (
                      <div className="mt-1 text-sm text-gray-500">
                        Hydration: {service.hydrationAmount}ml
                      </div>
                    )}
                    {service.assistanceRequired && (
                      <div className="mt-1 text-sm text-gray-500">
                        Assistance Required
                        {service.assistanceNotes && ` - ${service.assistanceNotes}`}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Served by: {service.servedBy}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Record Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Record Meal Service
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

      {mealServices?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No meal services found for the selected date and meal type
        </div>
      )}
    </div>
  );
};


