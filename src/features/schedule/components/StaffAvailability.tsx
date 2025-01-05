import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleAPI } from '../api/schedule-api';
import { format } from 'date-fns';

interface AvailabilitySlot {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  type: 'PREFERRED' | 'UNAVAILABLE';
}

interface StaffAvailabilityProps {
  staffId: string;
  isOpen: boolean;
  onClose: () => void;
}

const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function StaffAvailability({
  staffId,
  isOpen,
  onClose,
}: StaffAvailabilityProps) {
  const queryClient = useQueryClient();
  const [newSlot, setNewSlot] = useState<Partial<AvailabilitySlot>>({
    staffId,
    type: 'PREFERRED',
    startTime: '09:00',
    endTime: '17:00',
  });

  const { data: availabilitySlots = [] } = useQuery<AvailabilitySlot[]>({
    queryKey: ['staff-availability', staffId],
    queryFn: () => scheduleAPI.getStaffAvailability(staffId),
  });

  const addSlotMutation = useMutation({
    mutationFn: (slot: Omit<AvailabilitySlot, 'id'>) =>
      scheduleAPI.addAvailabilitySlot(slot),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
      setNewSlot({ staffId, type: 'PREFERRED', startTime: '09:00', endTime: '17:00' });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: (slotId: string) => scheduleAPI.deleteAvailabilitySlot(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-availability'] });
    },
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newSlot.dayOfWeek !== undefined &&
      newSlot.startTime &&
      newSlot.endTime &&
      newSlot.type
    ) {
      addSlotMutation.mutate({
        staffId,
        dayOfWeek: newSlot.dayOfWeek,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        type: newSlot.type,
      } as Omit<AvailabilitySlot, 'id'>);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Staff Availability
          </Dialog.Title>

          <form onSubmit={handleAddSlot} className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Day of Week
                </label>
                <select
                  value={newSlot.dayOfWeek || ''}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      dayOfWeek: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select day</option>
                  {daysOfWeek.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={newSlot.type}
                  onChange={(e) =>
                    setNewSlot({
                      ...newSlot,
                      type: e.target.value as 'PREFERRED' | 'UNAVAILABLE',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="PREFERRED">Preferred</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Availability Slot
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">
              Current Availability
            </h3>
            {daysOfWeek.map((day, dayIndex) => {
              const daySlots = availabilitySlots.filter(
                (slot) => slot.dayOfWeek === dayIndex
              );
              if (daySlots.length === 0) return null;

              return (
                <div key={day} className="border rounded-md p-4">
                  <h4 className="font-medium text-gray-700 mb-2">{day}</h4>
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                              slot.type === 'PREFERRED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {slot.type}
                          </span>
                          <span className="ml-2">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteSlotMutation.mutate(slot.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
