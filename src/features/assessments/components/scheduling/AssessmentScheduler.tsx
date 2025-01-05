import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  FileText,
  AlertCircle,
  Plus,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Calendar } from '@/components/ui/Calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select/Select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/Dialog';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/label';
import { addDays, format, isSameDay, parseISO, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { RecurringAssessmentConfig } from './RecurringAssessmentConfig';

interface Assessment {
  id: string;
  title: string;
  date: Date;
  time: string;
  participants: number;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
  };
}

interface AssessmentSchedulerProps {
  assessments: Assessment[];
  onScheduleAssessment: (assessment: Omit<Assessment, 'id'>) => void;
  onUpdateAssessment: (assessment: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
}

export function AssessmentScheduler({
  assessments,
  onScheduleAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
}: AssessmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewAssessmentDialog, setShowNewAssessmentDialog] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    time: '09:00',
    participants: 1,
    isRecurring: false,
  });

  const todaysAssessments = assessments.filter((assessment) =>
    isSameDay(assessment.date, selectedDate)
  );

  const upcomingAssessments = assessments
    .filter((assessment) => isAfter(assessment.date, new Date()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const handleScheduleAssessment = () => {
    onScheduleAssessment({
      ...newAssessment,
      date: selectedDate,
    });
    setShowNewAssessmentDialog(false);
    setNewAssessment({
      title: '',
      time: '09:00',
      participants: 1,
      isRecurring: false,
    });
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <Card className="col-span-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Assessment Schedule</h2>
          <Dialog open={showNewAssessmentDialog} onOpenChange={setShowNewAssessmentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Assessment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Assessment</DialogTitle>
                <DialogDescription>
                  Create a new assessment by filling out the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Assessment Title</Label>
                  <Input
                    id="title"
                    value={newAssessment.title}
                    onChange={(e) =>
                      setNewAssessment({ ...newAssessment, title: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAssessment.time}
                    onChange={(e) =>
                      setNewAssessment({ ...newAssessment, time: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="participants">Number of Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    value={newAssessment.participants}
                    onChange={(e) =>
                      setNewAssessment({
                        ...newAssessment,
                        participants: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="recurring">Recurring Assessment</Label>
                  <input
                    id="recurring"
                    type="checkbox"
                    checked={newAssessment.isRecurring}
                    onChange={(e) =>
                      setNewAssessment({
                        ...newAssessment,
                        isRecurring: e.target.checked,
                      })
                    }
                  />
                </div>
                {newAssessment.isRecurring && (
                  <RecurringAssessmentConfig
                    onConfigChange={(config) =>
                      setNewAssessment({
                        ...newAssessment,
                        recurringPattern: config,
                      })
                    }
                  />
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewAssessmentDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleScheduleAssessment}>Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
          components={{
            DayContent: ({ date }) => (
              <div className="relative w-full h-full p-2">
                <span>{format(date, 'd')}</span>
                {assessments.some((a) => isSameDay(a.date, date)) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                  </div>
                )}
              </div>
            ),
          }}
        />
      </Card>
      <Card className="col-span-4 p-4">
        <h3 className="text-xl font-semibold mb-4">
          {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <ScrollArea className="h-[300px]">
          {todaysAssessments.length > 0 ? (
            todaysAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="mb-4 p-3 border rounded-lg hover:bg-accent"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{assessment.title}</h4>
                  {assessment.isRecurring && (
                    <Badge variant="secondary">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Recurring
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {assessment.time}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {assessment.participants} participants
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No assessments scheduled for this day
            </div>
          )}
        </ScrollArea>
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Upcoming Assessments</h3>
          {upcomingAssessments.map((assessment) => (
            <div
              key={assessment.id}
              className="mb-2 p-2 border rounded-lg text-sm"
            >
              <div className="flex justify-between items-center">
                <span>{assessment.title}</span>
                <span className="text-muted-foreground">
                  {format(assessment.date, 'MMM d')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


