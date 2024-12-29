import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { BasePerson } from '@/types/care';

interface DomiciliaryCareProps {
  person: BasePerson;
  carePackage?: {
    visits: {
      time: string;
      duration: string;
      tasks: string[];
      carers: string[];
    }[];
    preferences: {
      preferredTimes: string[];
      preferredCarers: string[];
      specialInstructions: string[];
    };
  };
  homeAssessment?: {
    environment: {
      area: string;
      risks: string[];
      adaptations: string[];
    }[];
    equipment: {
      item: string;
      location: string;
      status: string;
      lastChecked: string;
    }[];
  };
}

export const DomiciliaryCare: React.FC<DomiciliaryCareProps> = ({
  person,
  carePackage,
  homeAssessment
}) => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domiciliary Care Plan</h1>
          <p className="text-muted-foreground">
            Home care management for {person.firstName} {person.lastName}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Update Care Package</Button>
          <Button>Log Visit</Button>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Care Schedule</TabsTrigger>
          <TabsTrigger value="assessment">Home Assessment</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Visit Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                {carePackage?.visits && (
                  <div className="space-y-4">
                    {carePackage.visits.map((visit, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">{visit.time}</h4>
                          <p className="text-sm text-muted-foreground">Duration: {visit.duration}</p>
                        </div>
                        <div>
                          <Button variant="outline" size="sm">Details</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                {carePackage?.visits && (
                  <div className="space-y-4">
                    {carePackage.visits.map((visit, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-medium">{visit.time}</h4>
                        <ul className="space-y-2">
                          {visit.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">{task}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="text-sm text-muted-foreground">
                          Carers: {visit.carers.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          {homeAssessment && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {homeAssessment.environment.map((area, index) => (
                      <div key={index} className="space-y-2">
                        <h4 className="text-sm font-medium">{area.area}</h4>
                        <dl className="space-y-2">
                          <div>
                            <dt className="text-sm text-muted-foreground">Identified Risks</dt>
                            <dd>
                              <ul className="list-disc list-inside text-sm">
                                {area.risks.map((risk, rIndex) => (
                                  <li key={rIndex}>{risk}</li>
                                ))}
                              </ul>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-sm text-muted-foreground">Required Adaptations</dt>
                            <dd>
                              <ul className="list-disc list-inside text-sm">
                                {area.adaptations.map((adaptation, aIndex) => (
                                  <li key={aIndex}>{adaptation}</li>
                                ))}
                              </ul>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Register</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {homeAssessment.equipment.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">{item.item}</h4>
                          <p className="text-sm text-muted-foreground">Location: {item.location}</p>
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
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          {carePackage?.preferences && (
            <Card>
              <CardHeader>
                <CardTitle>Care Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preferred Times</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {carePackage.preferences.preferredTimes.map((time, index) => (
                        <li key={index}>{time}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Preferred Carers</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {carePackage.preferences.preferredCarers.map((carer, index) => (
                        <li key={index}>{carer}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium mb-2">Special Instructions</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {carePackage.preferences.specialInstructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
