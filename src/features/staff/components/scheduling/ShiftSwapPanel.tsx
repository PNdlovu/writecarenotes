import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../services/staffService';
import { ShiftSwapRequest, ShiftAssignment, StaffMember } from '../../types/staff';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  ArrowsRightLeftIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface ShiftSwapPanelProps {
  currentStaffId: string;
  currentShiftId: string;
  onUpdate: () => void;
}

export const ShiftSwapPanel: React.FC<ShiftSwapPanelProps> = ({
  currentStaffId,
  currentShiftId,
  onUpdate,
}) => {
  const [isCreateSwapOpen, setIsCreateSwapOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [swapNotes, setSwapNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: swapRequests, isLoading: isLoadingSwaps } = useQuery({
    queryKey: ['shiftSwaps', currentStaffId],
    queryFn: () =>
      staffService.getShiftSwapRequests({ staffId: currentStaffId }),
  });

  const { data: availableShifts } = useQuery({
    queryKey: ['shifts', 'available'],
    queryFn: () =>
      staffService.getShiftAssignments({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      }),
  });

  const { data: staffMembers } = useQuery({
    queryKey: ['staffMembers'],
    queryFn: () => staffService.getStaffMembers(),
  });

  const createSwapMutation = useMutation({
    mutationFn: (request: Omit<ShiftSwapRequest, 'id'>) =>
      staffService.createShiftSwapRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shiftSwaps'] });
      toast.success('Shift swap request created successfully');
      setIsCreateSwapOpen(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to create shift swap request');
      console.error('Create swap request error:', error);
    },
  });

  const respondToSwapMutation = useMutation({
    mutationFn: ({
      id,
      response,
      notes,
    }: {
      id: string;
      response: 'APPROVED' | 'REJECTED';
      notes?: string;
    }) => staffService.respondToShiftSwapRequest(id, response, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shiftSwaps'] });
      toast.success('Response submitted successfully');
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to respond to swap request');
      console.error('Respond to swap request error:', error);
    },
  });

  const handleCreateSwap = () => {
    if (selectedShift) {
      createSwapMutation.mutate({
        requestingStaffId: currentStaffId,
        targetShiftId: selectedShift,
        offeredShiftId: currentShiftId,
        status: 'PENDING',
        requestDate: new Date().toISOString(),
        notes: swapNotes,
      });
    }
  };

  const getStaffName = (staffId: string) => {
    const staff = staffMembers?.find((s) => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff';
  };

  const getShiftDetails = (shiftId: string) => {
    const shift = availableShifts?.find((s) => s.id === shiftId);
    return shift
      ? `${format(new Date(shift.startTime), 'MMM dd, HH:mm')} - ${format(
          new Date(shift.endTime),
          'HH:mm'
        )}`
      : 'Unknown Shift';
  };

  const renderSwapRequest = (request: ShiftSwapRequest) => {
    const isIncoming = request.targetShiftId === currentShiftId;
    return (
      <div
        key={request.id}
        className={`bg-white rounded-lg shadow p-4 mb-2 ${
          request.status === 'PENDING' ? 'border-l-4 border-yellow-500' : ''
        }`}
      >
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium">
                {isIncoming ? 'Incoming Request' : 'Outgoing Request'}
              </span>
              <div className="text-sm text-gray-600">
                {isIncoming
                  ? `From: ${getStaffName(request.requestingStaffId)}`
                  : `To: ${getStaffName(
                      availableShifts?.find((s) => s.id === request.targetShiftId)
                        ?.staffId || ''
                    )}`}
              </div>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                request.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : request.status === 'APPROVED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {request.status}
            </span>
          </div>
          <div className="text-sm">
            <div>
              Offered Shift: {getShiftDetails(request.offeredShiftId || '')}
            </div>
            <div>
              Requested Shift: {getShiftDetails(request.targetShiftId)}
            </div>
          </div>
          {request.notes && (
            <div className="text-sm text-gray-600">
              Notes: {request.notes}
            </div>
          )}
          {request.status === 'PENDING' && isIncoming && (
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() =>
                  respondToSwapMutation.mutate({
                    id: request.id,
                    response: 'REJECTED',
                  })
                }
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Reject
              </button>
              <button
                onClick={() =>
                  respondToSwapMutation.mutate({
                    id: request.id,
                    response: 'APPROVED',
                  })
                }
                className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Accept
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Shift Swaps</h2>
        <button
          onClick={() => setIsCreateSwapOpen(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
        >
          <ArrowsRightLeftIcon className="w-4 h-4 mr-1" />
          Request Swap
        </button>
      </div>

      {isLoadingSwaps ? (
        <p className="text-gray-500">Loading swap requests...</p>
      ) : (
        <div className="space-y-2">
          {swapRequests?.map(renderSwapRequest)}
        </div>
      )}

      <Dialog
        open={isCreateSwapOpen}
        onClose={() => setIsCreateSwapOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Request Shift Swap
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Shift to Swap With
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a shift</option>
                  {availableShifts
                    ?.filter(
                      (shift) =>
                        shift.id !== currentShiftId &&
                        shift.staffId !== currentStaffId
                    )
                    .map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {getStaffName(shift.staffId)} -{' '}
                        {format(new Date(shift.startTime), 'MMM dd, HH:mm')} -{' '}
                        {format(new Date(shift.endTime), 'HH:mm')}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={swapNotes}
                  onChange={(e) => setSwapNotes(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  placeholder="Add any additional notes or reason for the swap request..."
                />
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsCreateSwapOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSwap}
                  disabled={!selectedShift}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Request Swap
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};


