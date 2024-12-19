'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { PlusIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface StaffShiftsProps {
  staffId: string;
}

export default function StaffShifts({ staffId }: StaffShiftsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: shifts, isLoading, error, isPending } = useQuery({
    queryKey: ['staff-shifts', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/shifts`);
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch shifts: ${errorData}`);
      }
      return response.json();
    },
  });

  const addShiftMutation = useMutation({
    mutationFn: async (newShift: Omit<Shift, 'id'>) => {
      const response = await fetch(`/api/staff/${staffId}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to add shift: ${errorData}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-shifts', staffId] });
      setIsModalOpen(false);
    },
  });

  if (error) return <div>Error loading shifts: {error.message}</div>;
  if (isPending) return <div>Loading shifts...</div>;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Shifts</h3>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
            Add Shift
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {shifts?.map((shift: Shift) => (
            <li key={shift.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {format(parseISO(shift.startTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <div className="flex items-center mt-1">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-sm text-gray-500">
                        {format(parseISO(shift.startTime), 'h:mm a')} - {format(parseISO(shift.endTime), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
                {shift.notes && (
                  <p className="text-sm text-gray-500 ml-4">{shift.notes}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Shift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newShift = {
                      startTime: formData.get('startTime') as string,
                      endTime: formData.get('endTime') as string,
                      notes: formData.get('notes') as string,
                    };
                    addShiftMutation.mutate(newShift);
                  }}
                >
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Shift</h3>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                          Start Time
                        </label>
                        <input
                          type="datetime-local"
                          name="startTime"
                          id="startTime"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          name="endTime"
                          id="endTime"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Notes
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Any special instructions or notes for this shift"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="submit"
                      disabled={addShiftMutation.isPending}
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                    >
                      {addShiftMutation.isPending ? 'Adding...' : 'Add Shift'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


