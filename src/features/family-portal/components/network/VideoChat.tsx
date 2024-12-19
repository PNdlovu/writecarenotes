import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/form/input";
import { Badge } from "@/components/ui/badge";

interface VideoChatProps {
  residentId: string;
  familyMemberId: string;
}

export const VideoChat: React.FC<VideoChatProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM',
    '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Schedule a Video Call</h3>
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
            <Select
              value={selectedTime}
              onValueChange={setSelectedTime}
            >
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
            <Input
              placeholder="Purpose of call"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
            <Button className="w-full">
              Schedule Call
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Upcoming Calls</h3>
          <div className="space-y-4">
            {/* Mock upcoming calls - replace with actual data */}
            <div className="flex justify-between items-center p-2 border rounded-lg">
              <div>
                <p className="font-medium">Family Check-in</p>
                <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</p>
              </div>
              <Button>
                Join
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recent Recordings</h3>
          <div className="space-y-4">
            {/* Mock recordings - replace with actual data */}
            <div className="flex justify-between items-center p-2 border rounded-lg">
              <div>
                <p className="font-medium">Care Plan Discussion</p>
                <p className="text-sm text-muted-foreground">Recorded on Dec 10</p>
              </div>
              <Button variant="outline">
                Watch
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};


