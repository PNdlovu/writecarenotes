import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../services/staffService';
import { Availability } from '../../types/staff';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface StaffAvailabilityPanelProps {
  staffId: string;
  onUpdate: () => void;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const StaffAvailabilityPanel: React.FC<StaffAvailabilityPanelProps> = ({
  staffId,
  onUpdate,
}) => {
  const [isCreateAvailabilityOpen, setIsCreateAvailabilityOpen] = useState(false);
  const [newAvailability, setNewAvailability] = useState<
    Omit<Availability, 'id' | 'staffId'>
  >({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isPreferred: false,
    notes: '',
  });

  const queryClient = useQueryClient();

  const { data: availabilities, isLoading } = useQuery({
    queryKey: ['staffAvailability', staffId],
    queryFn: () => staffService.getStaffAvailability(staffId),
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: (availability: Omit<Availability, 'id' | 'staffId'>[]) =>
      staffService.updateAvailability(staffId, availability),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffAvailability'] });
      toast.success('Availability updated successfully');
      setIsCreateAvailabilityOpen(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to update availability');
      console.error('Update availability error:', error);
    },
  });

  const handleAddAvailability = () => {
    const currentAvailabilities = availabilities || [];
    updateAvailabilityMutation.mutate([
      ...currentAvailabilities,
      newAvailability,
    ]);
  };

  const handleRemoveAvailability = (index: number) => {
    const currentAvailabilities = availabilities || [];
    updateAvailabilityMutation.mutate(
      currentAvailabilities.filter((_, i) => i !== index)
    );
  };

  const renderAvailabilityCard = (availability: Availability, index: number) => {
    return (
      <div
        key={availability.id}
        className={`bg-white rounded-lg shadow p-4 mb-2 ${
          availability.isPreferred ? 'border-l-4 border-green-500' : ''
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{DAYS_OF_WEEK[availability.dayOfWeek]}</h3>
            <div className="text-sm text-gray-600">
              {availability.startTime} - {availability.endTime}
            </div>
            {availability.notes && (
              <div className="text-sm text-gray-500 mt-1">
                Note: {availability.notes}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {availability.isPreferred && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Preferred
              </span>
            )}
            <button
              onClick={() => handleRemoveAvailability(index)}
              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Availability</h2>
        <button
          onClick={() => setIsCreateAvailabilityOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Availability
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading availability...</p>
      ) : (
        <div className="space-y-2">
          {availabilities?.map((availability, index) =>
            renderAvailabilityCard(availability, index)
          )}
        </div>
      )}

      <Dialog
        open={isCreateAvailabilityOpen}
        onClose={() => setIsCreateAvailabilityOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Add Availability
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={newAvailability.dayOfWeek}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      dayOfWeek: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <DatePicker
                    selected={new Date(`2023-01-01T${newAvailability.startTime}`)}
                    onChange={(date) =>
                      setNewAvailability({
                        ...newAvailability,
                        startTime: format(date || new Date(), 'HH:mm'),
                      })
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <DatePicker
                    selected={new Date(`2023-01-01T${newAvailability.endTime}`)}
                    onChange={(date) =>
                      setNewAvailability({
                        ...newAvailability,
                        endTime: format(date || new Date(), 'HH:mm'),
                      })
                    }
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPreferred"
                  checked={newAvailability.isPreferred}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      isPreferred: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isPreferred"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Preferred Time Slot
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newAvailability.notes}
                  onChange={(e) =>
                    setNewAvailability({
                      ...newAvailability,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsCreateAvailabilityOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAvailability}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Availability
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};


