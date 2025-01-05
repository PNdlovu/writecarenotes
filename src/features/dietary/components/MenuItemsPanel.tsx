import React, { useState } from 'react';
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { MenuItem, DietaryRestriction } from '../../types/dietary';

interface MenuItemsPanelProps {
  useMenuItems: (params?: {
    restrictions?: DietaryRestriction[];
    search?: string;
  }) => UseQueryResult<MenuItem[]>;
  useCreateMenuItem: () => UseMutationResult<MenuItem, unknown, Omit<MenuItem, 'id'>>;
}

export const MenuItemsPanel: React.FC<MenuItemsPanelProps> = ({
  useMenuItems,
  useCreateMenuItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRestrictions, setSelectedRestrictions] = useState<DietaryRestriction[]>([]);
  const [showForm, setShowForm] = useState(false);

  const { data: menuItems, isLoading } = useMenuItems({
    restrictions: selectedRestrictions,
    search: searchTerm,
  });

  const createMenuItem = useCreateMenuItem();

  const handleCreateMenuItem = async (formData: Omit<MenuItem, 'id'>) => {
    await createMenuItem.mutateAsync(formData);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
          <p className="text-sm text-gray-500">
            Manage your menu items and their nutritional information
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          multiple
          value={selectedRestrictions}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value as DietaryRestriction);
            setSelectedRestrictions(values);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.values(DietaryRestriction).map((restriction) => (
            <option key={restriction} value={restriction}>
              {restriction.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading menu items...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems?.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
              
              {/* Dietary Restrictions */}
              {item.restrictions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.restrictions.map((restriction) => (
                    <span
                      key={restriction}
                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {restriction.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Nutrition Info */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Calories:</span>{' '}
                  {item.nutritionInfo.calories}
                </div>
                <div>
                  <span className="font-medium">Protein:</span>{' '}
                  {item.nutritionInfo.protein}g
                </div>
                <div>
                  <span className="font-medium">Carbs:</span>{' '}
                  {item.nutritionInfo.carbohydrates}g
                </div>
                <div>
                  <span className="font-medium">Fat:</span>{' '}
                  {item.nutritionInfo.fat}g
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <span className="font-medium">Serving Size:</span> {item.servingSize}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Menu Item
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

      {menuItems?.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No menu items found matching your criteria
        </div>
      )}
    </div>
  );
};


