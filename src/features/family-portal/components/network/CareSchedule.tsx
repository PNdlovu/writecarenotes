import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CareScheduleProps {
  residentId: string;
}

export const CareSchedule: React.FC<CareScheduleProps> = ({
  residentId,
}) => {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
    '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Care Schedule</h3>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Today's Schedule */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Today's Schedule</h4>
          <div className="space-y-4">
            {/* Mock schedule item - replace with actual data */}
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">Morning Medication</h5>
                  <p className="text-sm text-muted-foreground">8:00 AM</p>
                </div>
                <Badge>Upcoming</Badge>
              </div>
              <div className="mt-2">
                <p className="text-sm"><strong>Assigned to:</strong> Jane Doe</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">Complete</Button>
                  <Button variant="outline" size="sm">Reassign</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Schedule Conflicts */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Schedule Conflicts</h4>
          <div className="space-y-4">
            {/* Mock conflict - replace with actual data */}
            <div className="border rounded-lg p-3 border-yellow-200 bg-yellow-50">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold text-yellow-800">Coverage Gap Detected</h5>
                  <p className="text-sm text-yellow-700">Tomorrow 2:00 PM - 4:00 PM</p>
                </div>
                <Button variant="outline" size="sm">
                  Resolve
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Weekly Overview */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Weekly Overview</h4>
          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day} className="flex items-center gap-2">
                <span className="w-24 text-sm font-medium">{day}</span>
                <div className="flex-1 h-6 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: Math.random() * 100 + '%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Schedule Optimization */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Schedule Optimization</h4>
          <div className="space-y-4">
            <div className="border rounded-lg p-3">
              <h5 className="font-semibold">AI Suggestions</h5>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  • Consider moving afternoon walk to 3 PM for better weather
                </p>
                <p className="text-sm">
                  • Medication schedule can be optimized with meal times
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                Apply Suggestions
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Schedule a new care task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              <Input id="task-name" />
            </div>
            <div>
              <Label htmlFor="time">Preferred Time</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignee">Assign To</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select family member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jane">Jane Doe</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


