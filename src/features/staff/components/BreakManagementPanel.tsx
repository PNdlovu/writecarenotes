import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../services/staffService';
import { Break, BreakType, ShiftAssignment } from '../../types/staff';
import { Dialog } from '@headlessui/react';
import { format, setHours, setMinutes } from 'date-fns';
import { toast } from 'react-hot-toast';
import { PauseIcon, PlayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface BreakManagementPanelProps {
  shiftId: string;
  breaks: Break[];
  onUpdate: () => void;
}

export const BreakManagementPanel: React.FC<BreakManagementPanelProps> = ({
  shiftId,
  breaks,
  onUpdate,
}) => {
  const [isCreateBreakOpen, setIsCreateBreakOpen] = useState(false);
  const [newBreak, setNewBreak] = useState<Partial<Break>>({
    type: BreakType.LUNCH,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60000).toISOString(), // Default 30 min break
  });

  const queryClient = useQueryClient();

  const startBreakMutation = useMutation({
    mutationFn: (breakData: Omit<Break, 'id' | 'status'>) =>
      staffService.startBreak(shiftId, breakData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Break started successfully');
      setIsCreateBreakOpen(false);
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to start break');
      console.error('Start break error:', error);
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: ({ breakId, endTime }: { breakId: string; endTime: string }) =>
      staffService.endBreak(shiftId, breakId, endTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Break ended successfully');
      onUpdate();
    },
    onError: (error) => {
      toast.error('Failed to end break');
      console.error('End break error:', error);
    },
  });

  const handleCreateBreak = () => {
    if (newBreak.type && newBreak.startTime && newBreak.endTime) {
      startBreakMutation.mutate(newBreak as Omit<Break, 'id' | 'status'>);
    }
  };

  const handleEndBreak = (breakId: string) => {
    endBreakMutation.mutate({
      breakId,
      endTime: new Date().toISOString(),
    });
  };

  const getBreakDuration = (breakItem: Break) => {
    const start = new Date(breakItem.startTime);
    const end = breakItem.status === 'COMPLETED' 
      ? new Date(breakItem.endTime)
      : new Date();
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${diffMinutes} min`;
  };

  const renderBreakCard = (breakItem: Break) => {
    const isActive = breakItem.status === 'IN_PROGRESS';
    return (
      <div
        key={breakItem.id}
        className={`bg-white rounded-lg shadow p-4 mb-2 ${
          isActive ? 'border-2 border-green-500' : ''
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold">{breakItem.type}</h3>
            <div className="text-sm text-gray-600">
              {format(new Date(breakItem.startTime), 'HH:mm')} -{' '}
              {breakItem.status === 'COMPLETED'
                ? format(new Date(breakItem.endTime), 'HH:mm')
                : 'In Progress'}
            </div>
            <div className="text-sm text-gray-500">
              Duration: {getBreakDuration(breakItem)}
            </div>
          </div>
          {isActive && (
            <button
              onClick={() => handleEndBreak(breakItem.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Breaks</h2>
        <button
          onClick={() => setIsCreateBreakOpen(true)}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
        >
          <PauseIcon className="w-4 h-4 mr-1" />
          Start Break
        </button>
      </div>

      <div className="space-y-2">
        {breaks.map(renderBreakCard)}
      </div>

      <Dialog
        open={isCreateBreakOpen}
        onClose={() => setIsCreateBreakOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium mb-4">
              Start New Break
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <select
                  value={newBreak.type}
                  onChange={(e) =>
                    setNewBreak({ ...newBreak, type: e.target.value as BreakType })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(BreakType).map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                    selected={new Date(newBreak.startTime || '')}
                    onChange={(date) =>
                      setNewBreak({
                        ...newBreak,
                        startTime: date?.toISOString(),
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
                    selected={new Date(newBreak.endTime || '')}
                    onChange={(date) =>
                      setNewBreak({
                        ...newBreak,
                        endTime: date?.toISOString(),
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
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setIsCreateBreakOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBreak}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Start Break
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};


