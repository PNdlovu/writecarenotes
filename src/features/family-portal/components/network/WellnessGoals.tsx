import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/form/textarea";
import { Calendar } from "@/components/ui/calendar";

interface WellnessGoalsProps {
  residentId: string;
}

export const WellnessGoals: React.FC<WellnessGoalsProps> = ({
  residentId,
}) => {
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Wellness Goals</h3>
        <Button onClick={() => setIsAddGoalOpen(true)}>
          Add New Goal
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Active Goals */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Active Goals</h4>
          <div className="space-y-4">
            {/* Mock goal - replace with actual data */}
            <div className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-semibold">Daily Walking Routine</h5>
                  <p className="text-sm text-muted-foreground">Target: 20 minutes daily</p>
                </div>
                <Badge>In Progress</Badge>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>75%</span>
                </div>
                <Progress value={75} />
              </div>
              <div className="mt-2">
                <p className="text-sm"><strong>Supporters:</strong> Jane, John</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">Update Progress</Button>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Recent Achievements</h4>
          <div className="space-y-4">
            {/* Mock achievement - replace with actual data */}
            <div className="border rounded-lg p-3 border-green-200 bg-green-50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <h5 className="font-semibold">Weekly Exercise Goal Met!</h5>
                  <p className="text-sm text-muted-foreground">Completed 3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Milestones */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Upcoming Milestones</h4>
          <div className="space-y-4">
            {/* Mock milestone - replace with actual data */}
            <div className="border rounded-lg p-3">
              <h5 className="font-semibold">Complete 30 Days of Morning Walks</h5>
              <p className="text-sm text-muted-foreground">Due in 5 days</p>
              <Progress value={85} className="mt-2" />
            </div>
          </div>
        </Card>

        {/* Support Network */}
        <Card className="p-4">
          <h4 className="font-medium mb-4">Support Network</h4>
          <div className="space-y-4">
            <Button className="w-full">
              Invite Supporters
            </Button>
            {/* Mock supporters - replace with actual data */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  JD
                </div>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-sm text-muted-foreground">Supporting 2 goals</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Wellness Goal</DialogTitle>
            <DialogDescription>
              Set a new wellness goal and track progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="goal-title">Goal Title</Label>
              <Input id="goal-title" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" />
            </div>
            <div>
              <Label>Target Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


