import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useChildrenInCareTranslation } from '../../hooks/useChildrenInCareTranslation';

export const ChildrenInCareDashboard = () => {
  const {
    getRegionalBody,
    getFramework,
    getRatings,
    getAreas,
    getPolicies,
    getRecords,
    getAssessments,
    getRoles,
    getQualifications,
    getRatios,
    getEnvironmentRequirements,
    getCareRequirements,
    getSafeguardingRequirements,
  } = useChildrenInCareTranslation();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{getRegionalBody()}</CardTitle>
          <CardDescription>
            Framework: {getFramework()}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="ratings">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="care">Care</TabsTrigger>
          <TabsTrigger value="safeguarding">Safeguarding</TabsTrigger>
        </TabsList>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getRatings().map(({ key, value }) => (
                  <Badge key={key} variant="outline">
                    {value}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="areas">
          <Card>
            <CardHeader>
              <CardTitle>Inspection Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {getAreas().map(({ key, value }) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Required Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {getPolicies().map(({ key, value }) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Records</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {getRecords().map(({ key, value }) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {getAssessments().map(({ key, value }) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staffing">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Staff Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {getRoles().map(({ key, value }) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {getQualifications().map(({ key, value }) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staff-to-Child Ratios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-6 space-y-2">
                  {getRatios().map(({ key, value }) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environment">
          <Card>
            <CardHeader>
              <CardTitle>Environment Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {getEnvironmentRequirements().map(({ key, value }) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care">
          <Card>
            <CardHeader>
              <CardTitle>Care Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {getCareRequirements().map(({ key, value }) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safeguarding">
          <Card>
            <CardHeader>
              <CardTitle>Safeguarding Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {getSafeguardingRequirements().map(({ key, value }) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
