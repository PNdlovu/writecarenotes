import React, { useState } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { MealPlan, MealType, MenuItem } from '../../types/dietary';
import { format } from 'date-fns';

interface MealPlansPanelProps {
  dateRange: [Date | null, Date | null];
  useMealPlans: (params: { startDate: Date; endDate: Date }) => UseQueryResult<MealPlan[]>;
  useCreateMealPlan: () => UseMutationResult<MealPlan, unknown, Omit<MealPlan, 'id'>>;
  useUpdateMealPlan: () => UseMutationResult<MealPlan, unknown, { id: string; mealPlan: Partial<MealPlan> }>;
}

export const MealPlansPanel: React.FC<MealPlansPanelProps> = ({
  dateRange,
  useMealPlans,
  useCreateMealPlan,
  useUpdateMealPlan,
}) => {
  const [startDate, endDate] = dateRange;
  const { data: mealPlans, isLoading } = useMealPlans({
    startDate: startDate || new Date(),
    endDate: endDate || new Date(),
  });

  const createMealPlan = useCreateMealPlan();
  const updateMealPlan = useUpdateMealPlan();

  const [selectedMealPlan, setSelectedMealPlan] = useState<MealPlan | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleCreateMealPlan = async (formData: Omit<MealPlan, 'id'>) => {
    await createMealPlan.mutateAsync(formData);
    setShowForm(false);
  };

  const handleUpdateMealPlan = async (id: string, updates: Partial<MealPlan>) => {
    await updateMealPlan.mutateAsync({ id, mealPlan: updates });
    setSelectedMealPlan(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Meal Plans</h2>
          <p className="text-sm text-gray-500">
            Manage and schedule meal plans for your facility
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Meal Plan
        </button>
      </div>

      {/* Meal Plans List */}
      {isLoading ? (
        <div className="text-center py-8">Loading meal plans...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {mealPlans?.map((plan) => (
              <li
                key={plan.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedMealPlan(plan)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {format(new Date(plan.date), 'MMMM d, yyyy')}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {Object.entries(plan.menu).map(([mealType, items]) => (
                        <div key={mealType} className="mt-1">
                          <span className="font-medium">{mealType}:</span>{' '}
                          {items.map((item: MenuItem) => item.name).join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMealPlan(plan);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showForm || selectedMealPlan) && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedMealPlan ? 'Edit Meal Plan' : 'Create Meal Plan'}
            </h3>
            {/* Form implementation */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedMealPlan(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save
                  setShowForm(false);
                  setSelectedMealPlan(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {mealPlans?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No meal plans found for the selected date range
        </div>
      )}
    </div>
  );
};


