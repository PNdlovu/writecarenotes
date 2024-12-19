'use client';

import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import "react-day-picker/dist/style.css";

const shifts = [
  {
    id: "SH001",
    staffName: "Sarah Wilson",
    role: "Registered Nurse",
    shift: "Morning",
    startTime: "07:00",
    endTime: "15:00",
    unit: "Main Wing",
    status: "Confirmed",
  },
  {
    id: "SH002",
    staffName: "Michael Brown",
    role: "Care Assistant",
    shift: "Morning",
    startTime: "07:00",
    endTime: "15:00",
    unit: "Main Wing",
    status: "Confirmed",
  },
  {
    id: "SH003",
    staffName: "Emma Thompson",
    role: "Registered Nurse",
    shift: "Afternoon",
    startTime: "15:00",
    endTime: "23:00",
    unit: "Memory Care",
    status: "Pending",
  },
  {
    id: "SH004",
    staffName: "David Clark",
    role: "Care Assistant",
    shift: "Night",
    startTime: "23:00",
    endTime: "07:00",
    unit: "Memory Care",
    status: "Confirmed",
  },
  {
    id: "SH005",
    staffName: "Lisa Anderson",
    role: "Senior Care Assistant",
    shift: "Afternoon",
    startTime: "15:00",
    endTime: "23:00",
    unit: "Main Wing",
    status: "Leave Requested",
  },
];

export default function SchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Staff Scheduling</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>{shift.staffName}</TableCell>
                    <TableCell>{shift.role}</TableCell>
                    <TableCell>{shift.shift}</TableCell>
                    <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                    <TableCell>{shift.unit}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${shift.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        shift.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        shift.status === 'Leave Requested' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'}`}>
                        {shift.status}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="col-span-3">
          <div className="rounded-md border p-4">
            <DayPicker
              mode="single"
              selected={date}
              onSelect={setDate}
              className="border-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
