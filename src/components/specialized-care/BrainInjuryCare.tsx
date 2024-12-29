import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasePerson, BrainInjuryAssessment } from '@/types/care';

interface BrainInjuryCareProps {
  person: BasePerson;
  assessment?: BrainInjuryAssessment;
}

export const BrainInjuryCare: React.FC<BrainInjuryCareProps> = ({
  person,
  assessment
}) => {
  return (
    <Tabs defaultValue="injury" className="space-y-6">
      <TabsList>
        <TabsTrigger value="injury">Injury Details</TabsTrigger>
        <TabsTrigger value="cognitive">Cognitive Assessment</TabsTrigger>
        <TabsTrigger value="rehabilitation">Rehabilitation</TabsTrigger>
      </TabsList>

      <TabsContent value="injury">
        <Card>
          <CardHeader>
            <CardTitle>Injury Information</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.injury && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Type of Injury:</span>
                    <p className="text-sm font-medium">{assessment.injury.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Date of Injury:</span>
                    <p className="text-sm font-medium">{assessment.injury.date}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Impact Areas</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.injury.impact.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cognitive">
        <Card>
          <CardHeader>
            <CardTitle>Cognitive Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.cognitive && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Memory</h4>
                  <p className="text-sm">{assessment.cognitive.memory}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Attention</h4>
                  <p className="text-sm">{assessment.cognitive.attention}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Processing</h4>
                  <p className="text-sm">{assessment.cognitive.processing}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Communication</h4>
                  <p className="text-sm">{assessment.cognitive.communication}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="rehabilitation">
        <Card>
          <CardHeader>
            <CardTitle>Rehabilitation Program</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.rehabilitation && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Therapy Programs</h4>
                  {assessment.rehabilitation.therapies.map((therapy, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 mb-4">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <p className="text-sm">{therapy.type}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Frequency:</span>
                          <p className="text-sm">{therapy.frequency}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Goals:</span>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          {therapy.goals.map((goal, gIndex) => (
                            <li key={gIndex}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Progress Notes</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.rehabilitation.progress.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
