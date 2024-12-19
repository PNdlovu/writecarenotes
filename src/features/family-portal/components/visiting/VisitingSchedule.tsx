import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Textarea } from "@/components/ui/form/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Visit {
  id: string;
  visitorId: string;
  visitorName: string;
  date: Date;
  duration: number;
  purpose: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  recurring?: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}

interface VisitingScheduleProps {
  residentId: string;
  familyMemberId: string;
}

export const VisitingSchedule: React.FC<VisitingScheduleProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isScheduleVisitOpen, setIsScheduleVisitOpen] = useState(false);

  // Mock data - replace with actual API calls
  const visits: Visit[] = [
    {
      id: '1',
      visitorId: 'user1',
      visitorName: 'Jane Doe',
      date: new Date(),
      duration: 60,
      purpose: 'Regular family visit',
      status: 'SCHEDULED',
      recurring: true,
      frequency: 'WEEKLY'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Visiting Schedule</h2>
          <p className="text-muted-foreground">
            Coordinate and manage family visits
          </p>
        </div>
        <Button onClick={() => setIsScheduleVisitOpen(true)}>
          Schedule Visit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Upcoming Visits</h3>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{visit.visitorName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {visit.date.toLocaleString()} • {visit.duration} minutes
                      </p>
                    </div>
                    <Badge>{visit.status}</Badge>
                  </div>
                  <p className="mt-2">{visit.purpose}</p>
                  {visit.recurring && (
                    <Badge variant="outline" className="mt-2">
                      Recurring {visit.frequency?.toLowerCase()}
                    </Badge>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Visit Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Visits This Month</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Visit Duration</p>
              <p className="text-2xl font-bold">45 min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Frequent Visitor</p>
              <p className="text-2xl font-bold">Jane Doe</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Visiting Guidelines</h3>
          <div className="space-y-2 text-sm">
            <p>• Best visiting hours: 9:00 AM - 8:00 PM</p>
            <p>• Please notify staff 24 hours in advance</p>
            <p>• Maximum 3 visitors at a time</p>
            <p>• Meals can be arranged with advance notice</p>
            <p>• Special arrangements needed for children under 12</p>
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Full Guidelines
          </Button>
        </Card>
      </div>

      <Dialog open={isScheduleVisitOpen} onOpenChange={setIsScheduleVisitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Visit</DialogTitle>
            <DialogDescription>
              Plan your next visit with your loved one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date and Time</Label>
              <Input type="datetime-local" />
            </div>
            <div>
              <Label>Duration</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Purpose of Visit</Label>
              <Textarea placeholder="Brief description of the visit" />
            </div>
            <div>
              <Label>Number of Visitors</Label>
              <Input type="number" min="1" max="3" />
            </div>
            <div className="flex items-center space-x-2">
              <Input type="checkbox" id="recurring" />
              <Label htmlFor="recurring">Make this a recurring visit</Label>
            </div>
            <div>
              <Label>Special Requirements</Label>
              <Textarea placeholder="Any special arrangements needed?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleVisitOpen(false)}>
              Cancel
            </Button>
            <Button>Schedule Visit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


