import { useState } from 'react';
import { ProgressTracking } from './types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ProgressSectionProps {
  data: ProgressTracking;
  onChange: (data: ProgressTracking) => void;
}

export function ProgressSection({ data, onChange }: ProgressSectionProps) {
  const addGoal = () => {
    onChange({
      ...data,
      goals: [
        ...data.goals,
        {
          description: '',
          strategies: [],
          progress: '',
        },
      ],
    });
  };

  const removeGoal = (index: number) => {
    const newGoals = [...data.goals];
    newGoals.splice(index, 1);
    onChange({
      ...data,
      goals: newGoals,
    });
  };

  const updateGoal = (index: number, field: keyof typeof data.goals[0], value: any) => {
    const newGoals = [...data.goals];
    newGoals[index] = {
      ...newGoals[index],
      [field]: value,
    };
    onChange({
      ...data,
      goals: newGoals,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Progress Tracking</h3>
          <Button onClick={addGoal} size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.goals.map((goal, index) => (
            <div key={index} className="p-4 border rounded-lg relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeGoal(index)}
              >
                <TrashIcon className="h-4 w-4 text-red-500" />
              </Button>

              <div className="space-y-4">
                <div>
                  <Label>Goal Description</Label>
                  <Input
                    value={goal.description}
                    onChange={(e) =>
                      updateGoal(index, 'description', e.target.value)
                    }
                    placeholder="Enter goal description"
                  />
                </div>

                <div>
                  <Label>Implementation Strategies</Label>
                  <Textarea
                    value={goal.strategies.join('\n')}
                    onChange={(e) =>
                      updateGoal(
                        index,
                        'strategies',
                        e.target.value.split('\n').filter(Boolean)
                      )
                    }
                    placeholder="Enter each strategy on a new line"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Progress Notes</Label>
                  <Textarea
                    value={goal.progress}
                    onChange={(e) =>
                      updateGoal(index, 'progress', e.target.value)
                    }
                    placeholder="Document progress, challenges, and achievements"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <Label>General Observations</Label>
            <Textarea
              value={data.observations.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  observations: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter each observation on a new line"
              rows={4}
            />
          </div>

          <div>
            <Label>Adaptation Effectiveness</Label>
            <Textarea
              value={data.adaptationEffectiveness.join('\n')}
              onChange={(e) =>
                onChange({
                  ...data,
                  adaptationEffectiveness: e.target.value.split('\n').filter(Boolean),
                })
              }
              placeholder="Enter effectiveness notes for each adaptation"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
