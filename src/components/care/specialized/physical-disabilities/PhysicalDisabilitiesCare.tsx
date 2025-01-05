import React from 'react';
import { Button } from "@/components/ui/Button/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { BasePerson } from '@/types/care';

interface PhysicalDisabilitiesCareProps {
  person: BasePerson;
  assessments?: {
    mobility: {
      status: string;
      aids: string[];
      notes: string;
    };
    activities: {
      type: string;
      independence: string;
      support: string;
    }[];
    equipment: {
      item: string;
      status: string;
      lastChecked: string;
    }[];
  };
  rehabilitation?: {
    goals: {
      area: string;
      description: string;
      progress: string;
      target: string;
    }[];
    therapies: {
      type: string;
      provider: string;
      frequency: string;
      notes: string;
    }[];
  };
}

export const PhysicalDisabilitiesCare: React.FC<PhysicalDisabilitiesCareProps> = ({
  person,
  assessments,
  rehabilitation
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Physical Support Plan</h1>
          <p className="text-muted-foreground">
            Manage physical support and rehabilitation for {person.firstName} {person.lastName}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Update Assessment</Button>
          <Button>Add Progress Note</Button>
        </div>
      </div>

      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessment">Assessments</TabsTrigger>
          <TabsTrigger value="rehabilitation">Rehabilitation</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mobility Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                {assessments?.mobility && (
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium">Current Status</dt>
                      <dd className="text-sm text-muted-foreground">{assessments.mobility.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Required Aids</dt>
                      <dd>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {assessments.mobility.aids.map((aid, index) => (
                            <li key={index}>{aid}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium">Notes</dt>
                      <dd className="text-sm text-muted-foreground">{assessments.mobility.notes}</dd>
                    </div>
                  </dl>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {assessments?.activities && (
                  <div className="space-y-4">
                    {assessments.activities.map((activity, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-medium">{activity.type}</h4>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Independence Level</dt>
                            <dd>{activity.independence}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Support Required</dt>
                            <dd>{activity.support}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rehabilitation" className="space-y-4">
          {rehabilitation && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Rehabilitation Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rehabilitation.goals.map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-medium">{goal.area}</h4>
                        <dl className="space-y-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Goal</dt>
                            <dd>{goal.description}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Progress</dt>
                            <dd>{goal.progress}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Target Date</dt>
                            <dd>{goal.target}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Therapy Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rehabilitation.therapies.map((therapy, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-medium">{therapy.type}</h4>
                        <dl className="space-y-2 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Provider</dt>
                            <dd>{therapy.provider}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Frequency</dt>
                            <dd>{therapy.frequency}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Notes</dt>
                            <dd>{therapy.notes}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Management</CardTitle>
            </CardHeader>
            <CardContent>
              {assessments?.equipment && (
                <div className="space-y-4">
                  {assessments.equipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">{item.item}</h4>
                        <p className="text-sm text-muted-foreground">Last checked: {item.lastChecked}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${
                          item.status === 'Working' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {item.status}
                        </span>
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
