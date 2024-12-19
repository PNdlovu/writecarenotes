import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { specializedCare } from '@/lib/services/specialized-care';
import type { DementiaCareRequirements } from '@/types/specialized-care';

interface DementiaCareProps {
  residentId: string;
  onComplete: () => void;
}

export function DementiaCare({
  residentId,
  onComplete,
}: DementiaCareProps) {
  const [requirements, setRequirements] = useState<DementiaCareRequirements>({
    environmentAssessment: {
      lighting: false,
      signage: false,
      colorSchemes: false,
      acoustics: false,
      safeWandering: false,
    },
    staffTraining: {
      dementiaAwareness: false,
      behaviourSupport: false,
      communicationSkills: false,
      personCenteredCare: false,
    },
    specializedAssessments: {
      cognition: false,
      behaviour: false,
      nutrition: false,
      mobility: false,
      communication: false,
    },
    carePlanRequirements: {
      lifeHistory: false,
      preferences: false,
      routines: false,
      triggers: false,
      interventions: false,
    },
  });

  const [notes, setNotes] = useState({
    environmentNotes: '',
    trainingNotes: '',
    assessmentNotes: '',
    carePlanNotes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specializedCare.updateDementiaCareRequirements(residentId, {
        ...requirements,
        notes,
      });
      onComplete();
    } catch (error) {
      console.error('Error updating dementia care requirements:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Dementia Care Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Environment Assessment */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Environment Assessment</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.environmentAssessment.lighting}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      environmentAssessment: {
                        ...requirements.environmentAssessment,
                        lighting: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Appropriate Lighting</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.environmentAssessment.signage}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      environmentAssessment: {
                        ...requirements.environmentAssessment,
                        signage: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Clear Signage</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.environmentAssessment.colorSchemes}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      environmentAssessment: {
                        ...requirements.environmentAssessment,
                        colorSchemes: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Appropriate Color Schemes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.environmentAssessment.acoustics}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      environmentAssessment: {
                        ...requirements.environmentAssessment,
                        acoustics: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Acoustic Management</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.environmentAssessment.safeWandering}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      environmentAssessment: {
                        ...requirements.environmentAssessment,
                        safeWandering: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Safe Wandering Areas</Label>
              </div>
            </div>
            <Textarea
              value={notes.environmentNotes}
              onChange={(e) =>
                setNotes({ ...notes, environmentNotes: e.target.value })
              }
              placeholder="Additional notes about environmental requirements..."
            />
          </div>

          {/* Staff Training */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Staff Training Requirements</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.staffTraining.dementiaAwareness}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      staffTraining: {
                        ...requirements.staffTraining,
                        dementiaAwareness: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Dementia Awareness</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.staffTraining.behaviourSupport}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      staffTraining: {
                        ...requirements.staffTraining,
                        behaviourSupport: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Behaviour Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.staffTraining.communicationSkills}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      staffTraining: {
                        ...requirements.staffTraining,
                        communicationSkills: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Communication Skills</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.staffTraining.personCenteredCare}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      staffTraining: {
                        ...requirements.staffTraining,
                        personCenteredCare: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Person-Centered Care</Label>
              </div>
            </div>
            <Textarea
              value={notes.trainingNotes}
              onChange={(e) =>
                setNotes({ ...notes, trainingNotes: e.target.value })
              }
              placeholder="Additional notes about staff training requirements..."
            />
          </div>

          {/* Specialized Assessments */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Specialized Assessments</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(requirements.specializedAssessments).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        specializedAssessments: {
                          ...requirements.specializedAssessments,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)} Assessment</Label>
                </div>
              ))}
            </div>
            <Textarea
              value={notes.assessmentNotes}
              onChange={(e) =>
                setNotes({ ...notes, assessmentNotes: e.target.value })
              }
              placeholder="Additional notes about specialized assessments..."
            />
          </div>

          {/* Care Plan Requirements */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Care Plan Requirements</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(requirements.carePlanRequirements).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        carePlanRequirements: {
                          ...requirements.carePlanRequirements,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                </div>
              ))}
            </div>
            <Textarea
              value={notes.carePlanNotes}
              onChange={(e) =>
                setNotes({ ...notes, carePlanNotes: e.target.value })
              }
              placeholder="Additional notes about care plan requirements..."
            />
          </div>

          <Button type="submit" className="w-full">
            Update Requirements
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 


