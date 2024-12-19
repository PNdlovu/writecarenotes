import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { specializedCare } from '@/lib/services/specialized-care';
import type { LearningDisabilityRequirements } from '@/types/specialized-care';

interface LearningDisabilitySupportProps {
  residentId: string;
  onComplete: () => void;
}

export function LearningDisabilitySupport({
  residentId,
  onComplete,
}: LearningDisabilitySupportProps) {
  const [requirements, setRequirements] = useState<LearningDisabilityRequirements>({
    communicationSupport: {
      assessments: false,
      tools: [],
      staffTraining: false,
    },
    behaviourSupport: {
      plans: false,
      interventions: [],
      monitoring: false,
    },
    skillsDevelopment: {
      assessment: false,
      goals: [],
      progress: false,
    },
    communityInclusion: {
      activities: [],
      support: false,
      outcomes: false,
    },
    healthAction: {
      plans: false,
      monitoring: false,
      reviews: false,
    },
  });

  const [newItem, setNewItem] = useState({
    communicationTool: '',
    intervention: '',
    goal: '',
    activity: '',
  });

  const handleAddItem = (
    field: 'tools' | 'interventions' | 'goals' | 'activities',
    category: 'communicationSupport' | 'behaviourSupport' | 'skillsDevelopment' | 'communityInclusion',
    value: string
  ) => {
    if (value.trim()) {
      setRequirements({
        ...requirements,
        [category]: {
          ...requirements[category],
          [field]: [...requirements[category][field], value.trim()],
        },
      });
      setNewItem({ ...newItem, [field]: '' });
    }
  };

  const handleRemoveItem = (
    field: 'tools' | 'interventions' | 'goals' | 'activities',
    category: 'communicationSupport' | 'behaviourSupport' | 'skillsDevelopment' | 'communityInclusion',
    index: number
  ) => {
    setRequirements({
      ...requirements,
      [category]: {
        ...requirements[category],
        [field]: requirements[category][field].filter((_, i) => i !== index),
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await specializedCare.updateLearningDisabilitySupport(residentId, requirements);
      onComplete();
    } catch (error) {
      console.error('Error updating learning disability support:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Disability Support Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Communication Support */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Communication Support</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.communicationSupport.assessments}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      communicationSupport: {
                        ...requirements.communicationSupport,
                        assessments: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Communication Assessments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.communicationSupport.staffTraining}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      communicationSupport: {
                        ...requirements.communicationSupport,
                        staffTraining: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Staff Training Required</Label>
              </div>
              <div className="space-y-2">
                <Label>Communication Tools</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.communicationTool}
                    onChange={(e) =>
                      setNewItem({ ...newItem, communicationTool: e.target.value })
                    }
                    placeholder="Add communication tool..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'tools',
                        'communicationSupport',
                        newItem.communicationTool
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.communicationSupport.tools.map((tool, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {tool}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('tools', 'communicationSupport', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Behaviour Support */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Behaviour Support</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.behaviourSupport.plans}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      behaviourSupport: {
                        ...requirements.behaviourSupport,
                        plans: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Behaviour Support Plans</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.behaviourSupport.monitoring}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      behaviourSupport: {
                        ...requirements.behaviourSupport,
                        monitoring: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Behaviour Monitoring</Label>
              </div>
              <div className="space-y-2">
                <Label>Interventions</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.intervention}
                    onChange={(e) =>
                      setNewItem({ ...newItem, intervention: e.target.value })
                    }
                    placeholder="Add intervention..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'interventions',
                        'behaviourSupport',
                        newItem.intervention
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.behaviourSupport.interventions.map((intervention, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {intervention}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('interventions', 'behaviourSupport', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Skills Development */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Skills Development</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.skillsDevelopment.assessment}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      skillsDevelopment: {
                        ...requirements.skillsDevelopment,
                        assessment: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Skills Assessment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.skillsDevelopment.progress}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      skillsDevelopment: {
                        ...requirements.skillsDevelopment,
                        progress: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Progress Monitoring</Label>
              </div>
              <div className="space-y-2">
                <Label>Development Goals</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.goal}
                    onChange={(e) =>
                      setNewItem({ ...newItem, goal: e.target.value })
                    }
                    placeholder="Add development goal..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'goals',
                        'skillsDevelopment',
                        newItem.goal
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.skillsDevelopment.goals.map((goal, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {goal}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('goals', 'skillsDevelopment', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Community Inclusion */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Community Inclusion</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.communityInclusion.support}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      communityInclusion: {
                        ...requirements.communityInclusion,
                        support: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Community Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={requirements.communityInclusion.outcomes}
                  onCheckedChange={(checked) =>
                    setRequirements({
                      ...requirements,
                      communityInclusion: {
                        ...requirements.communityInclusion,
                        outcomes: checked as boolean,
                      },
                    })
                  }
                />
                <Label>Outcome Monitoring</Label>
              </div>
              <div className="space-y-2">
                <Label>Community Activities</Label>
                <div className="flex space-x-2">
                  <Input
                    value={newItem.activity}
                    onChange={(e) =>
                      setNewItem({ ...newItem, activity: e.target.value })
                    }
                    placeholder="Add community activity..."
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      handleAddItem(
                        'activities',
                        'communityInclusion',
                        newItem.activity
                      )
                    }
                  >
                    Add
                  </Button>
                </div>
                <ul className="list-disc list-inside">
                  {requirements.communityInclusion.activities.map((activity, index) => (
                    <li key={index} className="flex items-center justify-between">
                      {activity}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveItem('activities', 'communityInclusion', index)
                        }
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Health Action */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Health Action</Label>
            <div className="space-y-2">
              {Object.entries(requirements.healthAction).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={value}
                    onCheckedChange={(checked) =>
                      setRequirements({
                        ...requirements,
                        healthAction: {
                          ...requirements.healthAction,
                          [key]: checked as boolean,
                        },
                      })
                    }
                  />
                  <Label>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Update Support Plan
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}


