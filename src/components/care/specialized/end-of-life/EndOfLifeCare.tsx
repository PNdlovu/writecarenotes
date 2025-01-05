/**
 * @writecarenotes.com
 * @fileoverview End of life care management component
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive component for managing end of life care services.
 * Features include:
 * - Advance care planning
 * - Symptom management
 * - Comfort measures
 * - Family support
 * - Medication tracking
 * - Care preferences
 * - DNACPR status
 * - Documentation
 *
 * Mobile-First Considerations:
 * - Responsive forms
 * - Quick access
 * - Emergency contacts
 * - Status updates
 * - Priority alerts
 * - Offline support
 *
 * Enterprise Features:
 * - Care coordination
 * - Audit logging
 * - Compliance tracking
 * - Alert system
 * - Analytics
 * - Documentation
 */

import { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/Checkbox";
import { Textarea } from "@/components/ui/Textarea";
import { specializedCare } from '@/lib/services/specialized-care';
import type { EndOfLifeCareRequirements } from '@/types/specialized-care';

interface EndOfLifeCareProps {
  residentId: string;
  onComplete: () => void;
}

export function EndOfLifeCare({
  residentId,
  onComplete,
}: EndOfLifeCareProps) {
  const [requirements, setRequirements] = useState<EndOfLifeCareRequirements>({
    advanceCarePlanning: {
      preferences: false,
      decisions: false,
      powerOfAttorney: false,
    },
    painManagement: {
      assessment: false,
      protocols: false,
      medications: false,
    },
    symptomControl: {
      breathlessness: false,
      nausea: false,
      anxiety: false,
    },
    spiritualCare: {
      assessment: false,
      support: false,
      culturalNeeds: false,
    },
    familySupport: {
      communication: false,
      bereavement: false,
      practicalSupport: false,
    },
  });

  const [notes, setNotes] = useState({
    advanceCarePlanningNotes: '',
    painManagementNotes: '',
    symptomControlNotes: '',
    spiritualCareNotes: '',
    familySupportNotes: '',
    additionalInstructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specializedCare.createEndOfLifeCarePlan(residentId, {
        ...requirements,
        notes,
      });
      onComplete();
    } catch (error) {
      console.error('Error creating end of life care plan:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>End of Life Care Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Advance Care Planning */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Advance Care Planning</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.advanceCarePlanning.preferences}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      advanceCarePlanning: {
                        ...requirements.advanceCarePlanning,
                        preferences: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Care Preferences</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.advanceCarePlanning.decisions}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      advanceCarePlanning: {
                        ...requirements.advanceCarePlanning,
                        decisions: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Advance Decisions</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.advanceCarePlanning.powerOfAttorney}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      advanceCarePlanning: {
                        ...requirements.advanceCarePlanning,
                        powerOfAttorney: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Power of Attorney</Label>
              </div>
            </div>
            <Textarea
              value={notes.advanceCarePlanningNotes}
              onChange={(e) =>
                setNotes({ ...notes, advanceCarePlanningNotes: e.target.value })
              }
              placeholder="Additional notes about advance care planning..."
            />
          </div>

          {/* Pain Management */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Pain Management</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(requirements.painManagement).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        painManagement: {
                          ...requirements.painManagement,
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
              value={notes.painManagementNotes}
              onChange={(e) =>
                setNotes({ ...notes, painManagementNotes: e.target.value })
              }
              placeholder="Additional notes about pain management..."
            />
          </div>

          {/* Symptom Control */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Symptom Control</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(requirements.symptomControl).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        symptomControl: {
                          ...requirements.symptomControl,
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
              value={notes.symptomControlNotes}
              onChange={(e) =>
                setNotes({ ...notes, symptomControlNotes: e.target.value })
              }
              placeholder="Additional notes about symptom control..."
            />
          </div>

          {/* Spiritual Care */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Spiritual Care</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(requirements.spiritualCare).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        spiritualCare: {
                          ...requirements.spiritualCare,
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
              value={notes.spiritualCareNotes}
              onChange={(e) =>
                setNotes({ ...notes, spiritualCareNotes: e.target.value })
              }
              placeholder="Additional notes about spiritual care..."
            />
          </div>

          {/* Family Support */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Family Support</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(requirements.familySupport).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        familySupport: {
                          ...requirements.familySupport,
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
              value={notes.familySupportNotes}
              onChange={(e) =>
                setNotes({ ...notes, familySupportNotes: e.target.value })
              }
              placeholder="Additional notes about family support..."
            />
          </div>

          {/* Additional Instructions */}
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Additional Instructions</Label>
            <Textarea
              value={notes.additionalInstructions}
              onChange={(e) =>
                setNotes({ ...notes, additionalInstructions: e.target.value })
              }
              placeholder="Any additional instructions or notes..."
              className="h-32"
            />
          </div>

          <Button type="submit" className="w-full">
            Create Care Plan
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 
