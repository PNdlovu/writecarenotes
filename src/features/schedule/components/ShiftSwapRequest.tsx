import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { scheduleAPI } from '../api/schedule-api';
import { ScheduleShiftWithStaff } from '../api/schedule-api';

interface ShiftSwapRequestProps {
  shift: ScheduleShiftWithStaff;
  isOpen: boolean;
  onClose: () => void;
}

interface SwapRequest {
  id: string;
  requestingShiftId: string;
  targetShiftId?: string;
  requestingStaffId: string;
  targetStaffId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  notes: string;
  createdAt: string;
}

export function ShiftSwapRequest({
  shift,
  isOpen,
  onClose,
}: ShiftSwapRequestProps) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [targetStaffId, setTargetStaffId] = useState<string>();
  const [targetShiftId, setTargetShiftId] = useState<string>();

  const { data: staff = [] } = useQuery({
    queryKey: ['staff'],
    queryFn: () => scheduleAPI.getStaffMembers(),
  });

  const { data: eligibleShifts = [] } = useQuery({
    queryKey: ['eligible-swap-shifts', shift.id, targetStaffId],
    queryFn: () =>
      scheduleAPI.getEligibleSwapShifts(shift.id, targetStaffId || ''),
    enabled: !!targetStaffId,
  });

  const createSwapRequestMutation = useMutation({
    mutationFn: (data: {
      requestingShiftId: string;
      targetShiftId?: string;
      targetStaffId?: string;
      notes: string;
    }) => scheduleAPI.createSwapRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swap-requests'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSwapRequestMutation.mutate({
      requestingShiftId: shift.id,
      targetShiftId,
      targetStaffId,
      notes,
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            Request Shift Swap
          </Dialog.Title>

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Your Shift</h3>
            <p className="text-sm text-gray-600">
              {format(new Date(shift.startTime), 'MMM d, yyyy')}
              <br />
              {format(new Date(shift.startTime), 'h:mm a')} -{' '}
              {format(new Date(shift.endTime), 'h:mm a')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Swap With Staff Member
              </label>
              <select
                value={targetStaffId || ''}
                onChange={(e) => {
                  setTargetStaffId(e.target.value);
                  setTargetShiftId(undefined);
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select staff member</option>
                {staff
                  .filter((s) => s.id !== shift.staff.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {targetStaffId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Shift (Optional)
                </label>
                <select
                  value={targetShiftId || ''}
                  onChange={(e) => setTargetShiftId(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Any shift</option>
                  {eligibleShifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {format(new Date(s.startTime), 'MMM d')} -{' '}
                      {format(new Date(s.startTime), 'h:mm a')} to{' '}
                      {format(new Date(s.endTime), 'h:mm a')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Add any additional information..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!targetStaffId}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Request Swap
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
