import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress/Progress";
import { BasePerson, OfstedRequirements } from '@/types/regulatory';

interface ChildrensCareProps {
  person: BasePerson;
  ofstedData?: OfstedRequirements;
}

export const ChildrensCare: React.FC<ChildrensCareProps> = ({
  person,
  ofstedData
}) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="inspections">Inspections</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="safeguarding">Safeguarding</TabsTrigger>
        <TabsTrigger value="health">Health & Wellbeing</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent>
            {ofstedData?.registration && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Registration Number</span>
                    <p className="text-sm font-medium">{ofstedData.registration.registrationNumber}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Registration Type</span>
                    <p className="text-sm font-medium">{ofstedData.registration.registrationType}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Conditions</span>
                  <ul className="mt-2 space-y-2">
                    {ofstedData.registration.conditions.map((condition, index) => (
                      <li key={index} className="text-sm">{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="inspections">
        <Card>
          <CardHeader>
            <CardTitle>Inspection History</CardTitle>
          </CardHeader>
          <CardContent>
            {ofstedData?.inspections.map((inspection, index) => (
              <div key={index} className="mb-6 last:mb-0 border-b pb-6 last:border-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Date</span>
                    <p className="text-sm font-medium">
                      {new Date(inspection.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Type</span>
                    <p className="text-sm font-medium">{inspection.type}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium">Overall Effectiveness</span>
                    <p className={`text-sm mt-1 ${
                      inspection.overallEffectiveness === 'OUTSTANDING' ? 'text-green-600' :
                      inspection.overallEffectiveness === 'GOOD' ? 'text-blue-600' :
                      inspection.overallEffectiveness === 'REQUIRES_IMPROVEMENT' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {inspection.overallEffectiveness.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(inspection.outcomes).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <p className="text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="education">
        <Card>
          <CardHeader>
            <CardTitle>Education Provision</CardTitle>
          </CardHeader>
          <CardContent>
            {ofstedData?.educationProvision && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Arrangements</h4>
                  <p className="text-sm">Type: {ofstedData.educationProvision.arrangements.type.replace('_', ' ')}</p>
                  <div className="mt-4">
                    <span className="text-sm font-medium">Providers</span>
                    {ofstedData.educationProvision.arrangements.providers.map((provider, index) => (
                      <div key={index} className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Name</span>
                          <p className="text-sm">{provider.name}</p>
                        </div>
                        {provider.ofstedRating && (
                          <div>
                            <span className="text-sm text-muted-foreground">Ofsted Rating</span>
                            <p className="text-sm">{provider.ofstedRating}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Attendance Monitoring</h4>
                  {ofstedData.educationProvision.monitoring.attendance.map((record, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">{record.period}</span>
                        <span className="text-sm font-medium">{record.percentage}%</span>
                      </div>
                      <Progress value={record.percentage} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="safeguarding">
        <Card>
          <CardHeader>
            <CardTitle>Safeguarding</CardTitle>
          </CardHeader>
          <CardContent>
            {ofstedData?.safeguarding && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Designated Lead</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Name</span>
                      <p className="text-sm">{ofstedData.safeguarding.designatedLead.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Qualification</span>
                      <p className="text-sm">{ofstedData.safeguarding.designatedLead.qualification}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Training Status</h4>
                  {ofstedData.safeguarding.training.map((training, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <span className="text-sm font-medium">{training.type}</span>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-sm text-muted-foreground">Completed</span>
                          <p className="text-sm">{training.completedBy.length} staff</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Due</span>
                          <p className="text-sm">{training.dueBy.length} staff</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="health">
        <Card>
          <CardHeader>
            <CardTitle>Health & Wellbeing</CardTitle>
          </CardHeader>
          <CardContent>
            {ofstedData?.healthAndWellbeing && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Medical Officer</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Name</span>
                      <p className="text-sm">{ofstedData.healthAndWellbeing.medicalOfficer.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Registration</span>
                      <p className="text-sm">{ofstedData.healthAndWellbeing.medicalOfficer.registrationNumber}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Health Assessments</h4>
                  {ofstedData.healthAndWellbeing.healthAssessments.map((assessment, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Type</span>
                          <p className="text-sm">{assessment.type}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Frequency</span>
                          <p className="text-sm">{assessment.frequency}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Next Due</span>
                        <p className="text-sm">
                          {new Date(assessment.nextDue).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
