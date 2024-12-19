import { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';
import { useShifts } from '../hooks/useSchedule';
import { ScheduleShiftWithStaff } from '../api/schedule-api';
import { AddShiftButton } from './AddShiftButton';
import { BatchShiftDialog } from './BatchShiftDialog';
import { StaffAvailability } from './StaffAvailability';
import { ShiftSwapRequest } from './ShiftSwapRequest';
import { ShiftTemplate } from './ShiftTemplate';
import { validateShift } from '../utils/validation';

interface ShiftCardProps {
  shift: ScheduleShiftWithStaff;
  onSwapClick: (shift: ScheduleShiftWithStaff) => void;
}

function ShiftCard({ shift, onSwapClick }: ShiftCardProps) {
  return (
    <div className="p-2 mb-2 bg-white rounded shadow-sm border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-sm">{shift.staff.name}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(shift.startTime), 'h:mm a')} -{' '}
            {format(new Date(shift.endTime), 'h:mm a')}
          </p>
        </div>
        <button
          onClick={() => onSwapClick(shift)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Swap
        </button>
      </div>
      {shift.notes && (
        <p className="mt-1 text-xs text-gray-600">{shift.notes}</p>
      )}
    </div>
  );
}

export function ShiftCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ScheduleShiftWithStaff>();
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  
  const { data: shifts = [], isLoading } = useShifts(
    weekStart.toISOString(),
    weekEnd.toISOString()
  );

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const handleSwapClick = (shift: ScheduleShiftWithStaff) => {
    setSelectedShift(shift);
    setIsSwapDialogOpen(true);
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    return date;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear() &&
        (!selectedStaff || shift.staff.id === selectedStaff)
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule for week of {format(weekStart, 'MMM d, yyyy')}
            </h2>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsTemplateDialogOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Manage Templates
              </button>
              <button
                onClick={() => setIsBatchDialogOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Multiple Shifts
              </button>
              <button
                onClick={() => setIsAvailabilityDialogOpen(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Staff Availability
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              <button
                onClick={prevWeek}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={nextWeek}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {days.map((day) => (
              <div key={day.toString()} className="bg-white p-4">
                <div className="font-medium text-sm text-gray-900 mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {format(day, 'MMM d')}
                </div>
                <div>
                  {getShiftsForDay(day).map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      onSwapClick={handleSwapClick}
                    />
                  ))}
                </div>
                <AddShiftButton
                  onAddShift={(newShift) => {
                    const errors = validateShift(newShift, shifts);
                    if (errors.length > 0) {
                      alert(errors.map((e) => e.message).join('\n'));
                      return false;
                    }
                    return true;
                  }}
                  date={day}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <BatchShiftDialog
        isOpen={isBatchDialogOpen}
        onClose={() => setIsBatchDialogOpen(false)}
        startDate={weekStart}
        endDate={weekEnd}
      />

      <ShiftTemplate
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
      />

      {selectedStaff && (
        <StaffAvailability
          staffId={selectedStaff}
          isOpen={isAvailabilityDialogOpen}
          onClose={() => setIsAvailabilityDialogOpen(false)}
        />
      )}

      {selectedShift && (
        <ShiftSwapRequest
          shift={selectedShift}
          isOpen={isSwapDialogOpen}
          onClose={() => setIsSwapDialogOpen(false)}
        />
      )}
    </div>
  );
}
