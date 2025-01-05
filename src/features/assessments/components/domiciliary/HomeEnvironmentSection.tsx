import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HomeEnvironmentAssessment } from '../../types/domiciliary.types';
import { RiskLevel } from '@prisma/client';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface HomeEnvironmentSectionProps {
  data: HomeEnvironmentAssessment;
  onChange: (data: HomeEnvironmentAssessment) => void;
}

export function HomeEnvironmentSection({ data, onChange }: HomeEnvironmentSectionProps) {
  const updateEntranceAccess = (field: keyof typeof data.entranceAccess, value: any) => {
    onChange({
      ...data,
      entranceAccess: {
        ...data.entranceAccess,
        [field]: value,
      },
    });
  };

  const updateRoomAssessment = (
    room: keyof typeof data.roomAssessments,
    field: keyof typeof data.roomAssessments.bedroom,
    value: any
  ) => {
    onChange({
      ...data,
      roomAssessments: {
        ...data.roomAssessments,
        [room]: {
          ...data.roomAssessments[room],
          [field]: value,
        },
      },
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] px-2">
      <div className="space-y-4 max-w-2xl mx-auto pb-6">
        <Card className="shadow-sm">
          <CardHeader>
            <h3 className="text-lg font-semibold">Entrance Access</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
                  <Checkbox
                    checked={data.entranceAccess.steps}
                    onCheckedChange={(checked) => updateEntranceAccess('steps', checked)}
                  />
                  <Label className="flex-grow">Steps Present</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
                  <Checkbox
                    checked={data.entranceAccess.ramp}
                    onCheckedChange={(checked) => updateEntranceAccess('ramp', checked)}
                  />
                  <Label className="flex-grow">Ramp Available</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
                  <Checkbox
                    checked={data.entranceAccess.handrails}
                    onCheckedChange={(checked) => updateEntranceAccess('handrails', checked)}
                  />
                  <Label className="flex-grow">Handrails Present</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
                  <Checkbox
                    checked={data.entranceAccess.lighting}
                    onCheckedChange={(checked) => updateEntranceAccess('lighting', checked)}
                  />
                  <Label className="flex-grow">Adequate Lighting</Label>
                </div>
              </div>
              <div>
                <Label>Access Notes</Label>
                <Textarea
                  value={data.entranceAccess.notes}
                  onChange={(e) => updateEntranceAccess('notes', e.target.value)}
                  placeholder="Enter any additional notes about entrance access..."
                  className="mt-1.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          {Object.entries(data.roomAssessments).map(([room, assessment]) => (
            <AccordionItem key={room} value={room}>
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <span className="capitalize">{room} Assessment</span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-2">
                  <div>
                    <Label>Hazards</Label>
                    <Textarea
                      value={assessment.hazards.join('\n')}
                      onChange={(e) =>
                        updateRoomAssessment(
                          room as keyof typeof data.roomAssessments,
                          'hazards',
                          e.target.value.split('\n').filter(Boolean)
                        )
                      }
                      placeholder="Enter hazards, one per line..."
                      className="mt-1.5"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
                      <Checkbox
                        checked={assessment.trippingRisks}
                        onCheckedChange={(checked) =>
                          updateRoomAssessment(
                            room as keyof typeof data.roomAssessments,
                            'trippingRisks',
                            checked
                          )
                        }
                      />
                      <Label className="flex-grow">Tripping Risks Present</Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 bg-background rounded-lg">
                      <Checkbox
                        checked={assessment.adequateLighting}
                        onCheckedChange={(checked) =>
                          updateRoomAssessment(
                            room as keyof typeof data.roomAssessments,
                            'adequateLighting',
                            checked
                          )
                        }
                      />
                      <Label className="flex-grow">Adequate Lighting</Label>
                    </div>
                  </div>

                  <div>
                    <Label>Risk Level</Label>
                    <Select
                      value={assessment.riskLevel}
                      onValueChange={(value) =>
                        updateRoomAssessment(
                          room as keyof typeof data.roomAssessments,
                          'riskLevel',
                          value as RiskLevel
                        )
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Recommendations</Label>
                    <Textarea
                      value={assessment.recommendations.join('\n')}
                      onChange={(e) =>
                        updateRoomAssessment(
                          room as keyof typeof data.roomAssessments,
                          'recommendations',
                          e.target.value.split('\n').filter(Boolean)
                        )
                      }
                      placeholder="Enter recommendations, one per line..."
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ScrollArea>
  );
}
