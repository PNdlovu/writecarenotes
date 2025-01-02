import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { Input } from "@/components/ui/Form/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/Form/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";

interface FamilyDecisionBoardProps {
  residentId: string;
}

export const FamilyDecisionBoard: React.FC<FamilyDecisionBoardProps> = ({
  residentId,
}) => {
  const [isNewDecisionOpen, setIsNewDecisionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Family Decision Board</h3>
        <Button onClick={() => setIsNewDecisionOpen(true)}>
          New Decision Topic
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active Decisions */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Active Decisions</h4>
          <div className="space-y-4">
            {/* Mock decision - replace with actual data */}
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">Weekly Activity Schedule Changes</h5>
                  <p className="text-sm text-muted-foreground">Deadline: In 2 days</p>
                </div>
                <Badge>Open</Badge>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Morning Yoga</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">4 votes</span>
                    <Button variant="outline" size="sm">Vote</Button>
                  </div>
                </div>
                <Progress value={40} />

                <div className="flex justify-between items-center">
                  <span className="text-sm">Walking Group</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">6 votes</span>
                    <Button variant="outline" size="sm">Vote</Button>
                  </div>
                </div>
                <Progress value={60} />
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" className="w-full">
                  View Discussion
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Decisions */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Recent Decisions</h4>
          <div className="space-y-4">
            {/* Mock past decision - replace with actual data */}
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">Medication Schedule Adjustment</h5>
                  <p className="text-sm text-muted-foreground">Closed 2 days ago</p>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="mt-2">
                <p className="text-sm"><strong>Outcome:</strong> Evening medication time changed to 8 PM</p>
                <p className="text-sm text-muted-foreground">8 family members participated</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Decisions */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Upcoming Decisions</h4>
          <div className="space-y-4">
            {/* Mock upcoming decision - replace with actual data */}
            <div className="border rounded-lg p-3">
              <h5 className="font-semibold">Holiday Care Planning</h5>
              <p className="text-sm text-muted-foreground">Opens in 5 days</p>
              <div className="mt-2">
                <Button variant="outline" size="sm">Set Reminder</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Decision Analytics */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Decision Analytics</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <h5 className="text-sm font-medium">Participation Rate</h5>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </div>
              <div className="border rounded-lg p-3">
                <h5 className="text-sm font-medium">Avg. Response Time</h5>
                <p className="text-2xl font-bold">1.5 days</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isNewDecisionOpen} onOpenChange={setIsNewDecisionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Decision Topic</DialogTitle>
            <DialogDescription>
              Start a new family decision-making process
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" />
            </div>
            <div>
              <Label>Options</Label>
              <div className="space-y-2">
                <Input placeholder="Option 1" />
                <Input placeholder="Option 2" />
                <Button variant="outline" size="sm" className="w-full">
                  + Add Option
                </Button>
              </div>
            </div>
            <div>
              <Label>Deadline</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDecisionOpen(false)}>
              Cancel
            </Button>
            <Button>Create Decision</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


