import React, { useState } from 'react';
import { format, addMinutes } from 'date-fns';
import { Calendar } from '@/components/ui/Calendar';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/Textarea';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Visit, VISIT_STATUS, VISIT_TYPE } from '../../types/visit.types';
import { CARE_SETTING } from '../../types/assessment.types';

interface VisitSchedulerProps {
  assessment: {
    id: string;
    residentId: string;
    location?: {
      address: string;
      postcode: string;
      accessNotes?: string;
    };
  };
  onSchedule: (visit: Omit<Visit, 'id'>) => Promise<void>;
  existingVisits?: Visit[];
  availableAssessors?: Array<{ id: string; name: string; specialties: string[] }>;
}

export function VisitScheduler({
  assessment,
  onSchedule,
  existingVisits = [],
  availableAssessors = [],
}: VisitSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [selectedAssessor, setSelectedAssessor] = useState('');
  const [visitType, setVisitType] = useState<VISIT_TYPE>(VISIT_TYPE.INITIAL_ASSESSMENT);
  const [notes, setNotes] = useState('');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedAssessor) return;

    setLoading(true);
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(hours, minutes);

      const visitData: Omit<Visit, 'id'> = {
        assessmentId: assessment.id,
        residentId: assessment.residentId,
        assessorId: selectedAssessor,
        visitType,
        status: VISIT_STATUS.SCHEDULED,
        scheduledDateTime,
        estimatedDuration: duration,
        careSetting: CARE_SETTING.HOME,
        location: assessment.location || {
          address: '',
          postcode: '',
        },
        notes,
        mobileEquipmentNeeded: equipment,
      };

      await onSchedule(visitData);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (date: Date) => {
    return !existingVisits?.some(visit => {
      const visitStart = new Date(visit.scheduledDateTime);
      const visitEnd = addMinutes(visitStart, visit.estimatedDuration);
      return date >= visitStart && date <= visitEnd;
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="max-w-2xl mx-auto p-4">
        <Card className="shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Schedule Home Visit</h3>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="date" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="date">Date & Time</TabsTrigger>
                <TabsTrigger value="details">Visit Details</TabsTrigger>
              </TabsList>

              <TabsContent value="date" className="space-y-4 mt-4">
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => !isSlotAvailable(date)}
                    className="rounded-md border"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
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
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Assessor</Label>
                  <Select value={selectedAssessor} onValueChange={setSelectedAssessor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAssessors.map((assessor) => (
                        <SelectItem key={assessor.id} value={assessor.id}>
                          {assessor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visit Type</Label>
                  <Select value={visitType} onValueChange={(v) => setVisitType(v as VISIT_TYPE)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visit type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(VISIT_TYPE).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Required Equipment</Label>
                  <Textarea
                    value={equipment.join('\n')}
                    onChange={(e) => setEquipment(e.target.value.split('\n').filter(Boolean))}
                    placeholder="Enter required equipment, one per line"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about the visit"
                    rows={3}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Button
                className="w-full"
                onClick={handleSchedule}
                disabled={!selectedDate || !selectedAssessor || loading}
              >
                {loading ? 'Scheduling...' : 'Schedule Visit'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
