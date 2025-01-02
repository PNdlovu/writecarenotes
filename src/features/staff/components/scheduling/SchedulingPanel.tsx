'use client';

import React, { useState } from 'react';
import { useCreateSchedule } from '../../hooks';
import { getShiftTimes, getDateRange } from '../../utils';
import { Calendar } from "@/components/ui/Calendar";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { StaffSchedule, ShiftType } from '../../types';
import { StaffSchedulesView } from './StaffSchedulesView';

export function SchedulingPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedShift, setSelectedShift] = useState<ShiftType>();
  const createSchedule = useCreateSchedule();
  const { startDate, endDate } = getDateRange(7); // Show next 7 days

  const handleCreateSchedule = () => {
    if (!selectedDate || !selectedShift) return;

    const { startTime, endTime } = getShiftTimes(selectedDate, selectedShift);

    createSchedule.mutate({
      staffId: '', // This should be set based on selected staff member
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      shiftType: selectedShift,
      status: 'SCHEDULED'
    });

    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>Create New Schedule</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            <Select onValueChange={(value) => setSelectedShift(value as ShiftType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shift type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ShiftType.MORNING}>Morning Shift</SelectItem>
                <SelectItem value={ShiftType.AFTERNOON}>Afternoon Shift</SelectItem>
                <SelectItem value={ShiftType.NIGHT}>Night Shift</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreateSchedule}>Create Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      <StaffSchedulesView
        startDate={startDate}
        endDate={endDate}
      />
    </div>
  );
}
