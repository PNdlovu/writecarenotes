import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasePerson, SupportedLivingAssessment } from '@/types/care';

interface SupportedLivingProps {
  person: BasePerson;
  assessment?: SupportedLivingAssessment;
}

export const SupportedLiving: React.FC<SupportedLivingProps> = ({
  person,
  assessment
}) => {
  return (
    <Tabs defaultValue="skills" className="space-y-6">
      <TabsList>
        <TabsTrigger value="skills">Independent Living Skills</TabsTrigger>
        <TabsTrigger value="housing">Housing</TabsTrigger>
        <TabsTrigger value="community">Community Engagement</TabsTrigger>
      </TabsList>

      <TabsContent value="skills">
        <Card>
          <CardHeader>
            <CardTitle>Skills Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assessment?.independentLiving.skills.map((skill, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <h4 className="font-medium mb-2">{skill.area}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Capability:</span>
                      <p>{skill.capability}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Support Needed:</span>
                      <p>{skill.supportNeeded}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="housing">
        <Card>
          <CardHeader>
            <CardTitle>Housing Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.housing && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Housing Type</h4>
                  <p className="text-sm">{assessment.housing.type}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Adaptations</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.housing.adaptations.map((adaptation, index) => (
                      <li key={index}>{adaptation}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Support Requirements</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.housing.support.map((support, index) => (
                      <li key={index}>{support}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="community">
        <Card>
          <CardHeader>
            <CardTitle>Community Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            {assessment?.communityEngagement && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Activities</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.communityEngagement.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Support Required</h4>
                  <p className="text-sm">{assessment.communityEngagement.support}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {assessment.communityEngagement.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
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
