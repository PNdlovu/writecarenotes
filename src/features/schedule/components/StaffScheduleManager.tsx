import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { scheduleAPI } from '../api/schedule-api';

interface StaffScheduleManagerProps {
  staffId: string;
}

export function StaffScheduleManager({ staffId }: StaffScheduleManagerProps) {
  const { data: swapRequests = [] } = useQuery({
    queryKey: ['swap-requests', staffId],
    queryFn: () => scheduleAPI.getSwapRequests(staffId),
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ['staff-shifts', staffId],
    queryFn: () =>
      scheduleAPI.getShifts(
        new Date().toISOString(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
  });

  const pendingRequests = swapRequests.filter(
    (request) => request.status === 'PENDING'
  );

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Schedule Management
        </h3>
        
        {/* Pending Swap Requests */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">
            Pending Swap Requests ({pendingRequests.length})
          </h4>
          <div className="mt-2 divide-y divide-gray-200">
            {pendingRequests.map((request) => (
              <div key={request.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Swap Request from {request.requestingStaffId}
                    </p>
                    <p className="text-sm text-gray-500">{request.notes}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        scheduleAPI.respondToSwapRequest(request.id, true)
                      }
                      className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() =>
                        scheduleAPI.respondToSwapRequest(request.id, false)
                      }
                      className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Shifts */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900">
            Upcoming Shifts ({shifts.length})
          </h4>
          <div className="mt-2 space-y-2">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="p-3 bg-gray-50 rounded-md flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(shift.startTime), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(shift.startTime), 'h:mm a')} -{' '}
                    {format(new Date(shift.endTime), 'h:mm a')}
                  </p>
                </div>
                {shift.notes && (
                  <p className="text-sm text-gray-500">{shift.notes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
