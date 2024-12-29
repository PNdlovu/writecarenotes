import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/form/radio-group";
import { specializedCare } from '@/lib/services/specialized-care';
import type { MentalHealthRequirements } from '@/types/specialized-care';

interface MentalHealthCareProps {
  residentId: string;
  onComplete: () => void;
}

export function MentalHealthCare({
  residentId,
  onComplete,
}: MentalHealthCareProps) {
  const [requirements, setRequirements] = useState<MentalHealthRequirements>({
    assessments: {
      mentalState: false,
      riskAssessment: false,
      wellbeingChecks: false,
    },
    treatment: {
      medicationManagement: false,
      therapySupport: false,
      crisisIntervention: false,
    },
    monitoring: {
      moodTracking: false,
      behaviorMonitoring: false,
      sleepPatterns: false,
    },
    support: {
      dailyActivities: false,
      socialEngagement: false,
      copingStrategies: false,
    },
    riskLevel: 'low',
    notes: {
      assessmentNotes: '',
      treatmentNotes: '',
      monitoringNotes: '',
      supportNotes: '',
      generalNotes: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specializedCare.updateMentalHealthCare(residentId, requirements);
      onComplete();
    } catch (error) {
      console.error('Error updating mental health care:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mental Health Care Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Risk Level Assessment */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Risk Level Assessment</Label>
            <RadioGroup
              value={requirements.riskLevel}
              onValueChange={(value) =>
                setRequirements({
                  ...requirements,
                  riskLevel: value as 'low' | 'medium' | 'high',
                })
              }
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="risk-low" />
                <Label htmlFor="risk-low">Low Risk</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="risk-medium" />
                <Label htmlFor="risk-medium">Medium Risk</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="risk-high" />
                <Label htmlFor="risk-high">High Risk</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Assessments */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Assessments</Label>
            <div className="space-y-2">
              {Object.entries(requirements.assessments).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        assessments: {
                          ...requirements.assessments,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.split(/(?=[A-Z])/).join(' ')}</Label>
                </div>
              ))}
            </div>
            <Textarea
              value={requirements.notes.assessmentNotes}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  notes: {
                    ...requirements.notes,
                    assessmentNotes: e.target.value,
                  },
                })
              }
              placeholder="Assessment notes..."
            />
          </div>

          {/* Treatment */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Treatment</Label>
            <div className="space-y-2">
              {Object.entries(requirements.treatment).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        treatment: {
                          ...requirements.treatment,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.split(/(?=[A-Z])/).join(' ')}</Label>
                </div>
              ))}
            </div>
            <Textarea
              value={requirements.notes.treatmentNotes}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  notes: {
                    ...requirements.notes,
                    treatmentNotes: e.target.value,
                  },
                })
              }
              placeholder="Treatment notes..."
            />
          </div>

          {/* Monitoring */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Monitoring</Label>
            <div className="space-y-2">
              {Object.entries(requirements.monitoring).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        monitoring: {
                          ...requirements.monitoring,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.split(/(?=[A-Z])/).join(' ')}</Label>
                </div>
              ))}
            </div>
            <Textarea
              value={requirements.notes.monitoringNotes}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  notes: {
                    ...requirements.notes,
                    monitoringNotes: e.target.value,
                  },
                })
              }
              placeholder="Monitoring notes..."
            />
          </div>

          {/* Support */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Support</Label>
            <div className="space-y-2">
              {Object.entries(requirements.support).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        support: {
                          ...requirements.support,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.split(/(?=[A-Z])/).join(' ')}</Label>
                </div>
              ))}
            </div>
            <Textarea
              value={requirements.notes.supportNotes}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  notes: {
                    ...requirements.notes,
                    supportNotes: e.target.value,
                  },
                })
              }
              placeholder="Support notes..."
            />
          </div>

          {/* General Notes */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">General Notes</Label>
            <Textarea
              value={requirements.notes.generalNotes}
              onChange={(e) =>
                setRequirements({
                  ...requirements,
                  notes: {
                    ...requirements.notes,
                    generalNotes: e.target.value,
                  },
                })
              }
              placeholder="Any additional notes or observations..."
              className="h-32"
            />
          </div>

          <Button type="submit" className="w-full">
            Update Care Plan
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 


