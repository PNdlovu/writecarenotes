/**
 * @writecarenotes.com
 * @fileoverview Young adult care management component
 * @version 1.0.0
 * @created 2025-01-02
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A comprehensive component for managing young adult care services.
 * Features include:
 * - Education tracking
 * - Employment support
 * - Independent living skills
 * - Social development
 * - Transition planning
 * - Life skills assessment
 * - Support coordination
 * - Goal setting
 *
 * Mobile-First Considerations:
 * - Easy navigation
 * - Progress tracking
 * - Quick updates
 * - Goal monitoring
 * - Support contacts
 * - Resource access
 *
 * Enterprise Features:
 * - Care protocols
 * - Progress tracking
 * - Support planning
 * - Analytics
 * - Reporting
 * - Documentation
 */

import { useState } from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/Input/Input";
import { specializedCare } from '@/lib/services/specialized-care';
import type { YoungAdultCareRequirements } from '@/types/specialized-care';

interface YoungAdultCareProps {
  residentId: string;
  onComplete: () => void;
}

export function YoungAdultCare({
  residentId,
  onComplete,
}: YoungAdultCareProps) {
  const [requirements, setRequirements] = useState<YoungAdultCareRequirements>({
    education: {
      currentEducation: '',
      educationalNeeds: [],
      supportRequired: false,
    },
    employment: {
      employmentStatus: '',
      careerGoals: [],
      workplaceSupport: false,
    },
    independentLiving: {
      skillsAssessment: false,
      livingArrangements: '',
      supportNeeds: [],
    },
    socialDevelopment: {
      relationships: false,
      communityEngagement: false,
      leisureActivities: [],
    },
    transitionPlanning: {
      goals: [],
      timeline: '',
      supportNetwork: [],
    },
    notes: {
      educationNotes: '',
      employmentNotes: '',
      independentLivingNotes: '',
      socialDevelopmentNotes: '',
      transitionNotes: '',
    },
  });

  const [newItem, setNewItem] = useState({
    educationalNeed: '',
    careerGoal: '',
    supportNeed: '',
    leisureActivity: '',
    transitionGoal: '',
    supportPerson: '',
  });

  const handleAddItem = (
    field: string,
    category: keyof YoungAdultCareRequirements,
    subcategory: string,
    value: string
  ) => {
    if (value.trim()) {
      setRequirements({
        ...requirements,
        [category]: {
          ...requirements[category],
          [subcategory]: [...requirements[category][subcategory], value.trim()],
        },
      });
      setNewItem({ ...newItem, [field]: '' });
    }
  };

  const handleRemoveItem = (
    category: keyof YoungAdultCareRequirements,
    subcategory: string,
    index: number
  ) => {
    setRequirements({
      ...requirements,
      [category]: {
        ...requirements[category],
        [subcategory]: requirements[category][subcategory].filter(
          (_, i) => i !== index
        ),
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specializedCare.updateYoungAdultCare(residentId, requirements);
      onComplete();
    } catch (error) {
      console.error('Error updating young adult care:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Young Adult Care Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Education */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Education</Label>
            <div className="space-y-2">
              <Label>Current Education</Label>
              <Input
                value={requirements.education.currentEducation}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    education: {
                      ...requirements.education,
                      currentEducation: e.target.value,
                    },
                  })
                }
                placeholder="Current educational status..."
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.education.supportRequired}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      education: {
                        ...requirements.education,
                        supportRequired: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Educational Support Required</Label>
              </div>
              <div className="space-y-2">
                <Label>Educational Needs</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.educationalNeed}
                    onChange={(e) =>
                      setNewItem({ ...newItem, educationalNeed: e.target.value })
                    }
                    placeholder="Add educational need..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'educationalNeed',
                        'education',
                        'educationalNeeds',
                        newItem.educationalNeed
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.education.educationalNeeds.map((need, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {need}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('education', 'educationalNeeds', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <Textarea
                value={requirements.notes.educationNotes}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    notes: {
                      ...requirements.notes,
                      educationNotes: e.target.value,
                    },
                  })
                }
                placeholder="Additional education notes..."
              />
            </div>
          </div>

          {/* Employment */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Employment</Label>
            <div className="space-y-2">
              <Label>Employment Status</Label>
              <Input
                value={requirements.employment.employmentStatus}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    employment: {
                      ...requirements.employment,
                      employmentStatus: e.target.value,
                    },
                  })
                }
                placeholder="Current employment status..."
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.employment.workplaceSupport}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      employment: {
                        ...requirements.employment,
                        workplaceSupport: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Workplace Support Required</Label>
              </div>
              <div className="space-y-2">
                <Label>Career Goals</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.careerGoal}
                    onChange={(e) =>
                      setNewItem({ ...newItem, careerGoal: e.target.value })
                    }
                    placeholder="Add career goal..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'careerGoal',
                        'employment',
                        'careerGoals',
                        newItem.careerGoal
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.employment.careerGoals.map((goal, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {goal}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('employment', 'careerGoals', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <Textarea
                value={requirements.notes.employmentNotes}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    notes: {
                      ...requirements.notes,
                      employmentNotes: e.target.value,
                    },
                  })
                }
                placeholder="Additional employment notes..."
              />
            </div>
          </div>

          {/* Independent Living */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Independent Living</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.independentLiving.skillsAssessment}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      independentLiving: {
                        ...requirements.independentLiving,
                        skillsAssessment: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Skills Assessment Required</Label>
              </div>
              <Label>Living Arrangements</Label>
              <Input
                value={requirements.independentLiving.livingArrangements}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    independentLiving: {
                      ...requirements.independentLiving,
                      livingArrangements: e.target.value,
                    },
                  })
                }
                placeholder="Current living arrangements..."
              />
              <div className="space-y-2">
                <Label>Support Needs</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.supportNeed}
                    onChange={(e) =>
                      setNewItem({ ...newItem, supportNeed: e.target.value })
                    }
                    placeholder="Add support need..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'supportNeed',
                        'independentLiving',
                        'supportNeeds',
                        newItem.supportNeed
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.independentLiving.supportNeeds.map((need, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {need}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('independentLiving', 'supportNeeds', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <Textarea
                value={requirements.notes.independentLivingNotes}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    notes: {
                      ...requirements.notes,
                      independentLivingNotes: e.target.value,
                    },
                  })
                }
                placeholder="Additional independent living notes..."
              />
            </div>
          </div>

          {/* Social Development */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Social Development</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.socialDevelopment.relationships}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      socialDevelopment: {
                        ...requirements.socialDevelopment,
                        relationships: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Relationship Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.socialDevelopment.communityEngagement}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      socialDevelopment: {
                        ...requirements.socialDevelopment,
                        communityEngagement: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Community Engagement</Label>
              </div>
              <div className="space-y-2">
                <Label>Leisure Activities</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.leisureActivity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, leisureActivity: e.target.value })
                    }
                    placeholder="Add leisure activity..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'leisureActivity',
                        'socialDevelopment',
                        'leisureActivities',
                        newItem.leisureActivity
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.socialDevelopment.leisureActivities.map(
                    (activity, index) => (
                      <li key={index} className="flex items-center justify-between">
                        {activity}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveItem(
                              'socialDevelopment',
                              'leisureActivities',
                              index
                            )
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <Textarea
                value={requirements.notes.socialDevelopmentNotes}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    notes: {
                      ...requirements.notes,
                      socialDevelopmentNotes: e.target.value,
                    },
                  })
                }
                placeholder="Additional social development notes..."
              />
            </div>
          </div>

          {/* Transition Planning */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Transition Planning</Label>
            <div className="space-y-2">
              <Label>Timeline</Label>
              <Input
                value={requirements.transitionPlanning.timeline}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    transitionPlanning: {
                      ...requirements.transitionPlanning,
                      timeline: e.target.value,
                    },
                  })
                }
                placeholder="Transition timeline..."
              />
              <div className="space-y-2">
                <Label>Transition Goals</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.transitionGoal}
                    onChange={(e) =>
                      setNewItem({ ...newItem, transitionGoal: e.target.value })
                    }
                    placeholder="Add transition goal..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'transitionGoal',
                        'transitionPlanning',
                        'goals',
                        newItem.transitionGoal
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.transitionPlanning.goals.map((goal, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {goal}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('transitionPlanning', 'goals', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <Label>Support Network</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.supportPerson}
                    onChange={(e) =>
                      setNewItem({ ...newItem, supportPerson: e.target.value })
                    }
                    placeholder="Add support person..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'supportPerson',
                        'transitionPlanning',
                        'supportNetwork',
                        newItem.supportPerson
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.transitionPlanning.supportNetwork.map(
                    (person, index) => (
                      <li key={index} className="flex items-center justify-between">
                        {person}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveItem(
                              'transitionPlanning',
                              'supportNetwork',
                              index
                            )
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <Textarea
                value={requirements.notes.transitionNotes}
                onChange={(e) =>
                  setRequirements({
                    ...requirements,
                    notes: {
                      ...requirements.notes,
                      transitionNotes: e.target.value,
                    },
                  })
                }
                placeholder="Additional transition planning notes..."
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Update Care Plan
          </Button>
        </CardContent>
      </Card>
    </form>
  );
} 
