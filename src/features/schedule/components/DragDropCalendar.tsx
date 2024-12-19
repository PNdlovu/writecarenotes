import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useShifts, useUpdateShift } from '../hooks/useShifts';
import { ScheduleShiftWithStaff } from '../types';
import { ShiftTemplate } from './ShiftTemplate';
import { BatchShiftDialog } from './BatchShiftDialog';

interface ShiftItemProps {
  shift: ScheduleShiftWithStaff;
  onMoveShift: (shiftId: string, date: Date) => void;
}

const ShiftItem: React.FC<ShiftItemProps> = ({ shift, onMoveShift }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SHIFT',
    item: { id: shift.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`px-2 py-1 text-sm rounded ${
        isDragging ? 'opacity-50' : ''
      } bg-blue-100 text-blue-800 cursor-move`}
    >
      {shift.staff.name}
      <div className="text-xs text-blue-600">
        {format(new Date(shift.startTime), 'h:mm a')} -{' '}
        {format(new Date(shift.endTime), 'h:mm a')}
      </div>
    </div>
  );
};

const DayCell: React.FC<{
  date: Date;
  shifts: ScheduleShiftWithStaff[];
  onMoveShift: (shiftId: string, date: Date) => void;
}> = ({ date, shifts, onMoveShift }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'SHIFT',
    drop: (item: { id: string }) => {
      onMoveShift(item.id, date);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`bg-white p-4 min-h-[150px] ${
        isOver ? 'bg-blue-50' : ''
      }`}
    >
      <div className="font-semibold text-sm text-gray-900">
        {format(date, 'EEE')}
      </div>
      <div className="text-sm text-gray-500">{format(date, 'MMM d')}</div>
      <div className="mt-2 space-y-1">
        {shifts.map((shift) => (
          <ShiftItem key={shift.id} shift={shift} onMoveShift={onMoveShift} />
        ))}
      </div>
    </div>
  );
};

export function DragDropCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: shifts = [], isLoading } = useShifts(weekStart, weekEnd);
  const updateShift = useUpdateShift();

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const handleMoveShift = (shiftId: string, newDate: Date) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    const startTime = new Date(shift.startTime);
    const endTime = new Date(shift.endTime);
    const timeDiff = endTime.getTime() - startTime.getTime();

    const newStartTime = new Date(newDate);
    newStartTime.setHours(startTime.getHours());
    newStartTime.setMinutes(startTime.getMinutes());

    const newEndTime = new Date(newStartTime.getTime() + timeDiff);

    updateShift.mutate({
      id: shiftId,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  };

  const getShiftsForDay = (date: Date) => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getDate() === date.getDate() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getFullYear() === date.getFullYear()
      );
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Schedule for week of {format(weekStart, 'MMM d, yyyy')}
          </h2>
          <div className="flex items-center space-x-4">
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
            <div className="flex space-x-2">
              <button
                onClick={() => setIsTemplateDialogOpen(true)}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Shift Templates
              </button>
              <button
                onClick={() => setIsBatchDialogOpen(true)}
                className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Batch Create
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day) => (
            <DayCell
              key={day.toString()}
              date={day}
              shifts={getShiftsForDay(day)}
              onMoveShift={handleMoveShift}
            />
          ))}
        </div>
      </div>

      <ShiftTemplate
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
      />
      
      <BatchShiftDialog
        isOpen={isBatchDialogOpen}
        onClose={() => setIsBatchDialogOpen(false)}
        startDate={weekStart}
        endDate={weekEnd}
      />
    </DndProvider>
  );
}
