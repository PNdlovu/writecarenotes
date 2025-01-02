import React from 'react';
import { useCareHomeTranslation, CareHomeRegion } from '../../hooks/useCareHomeTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';

interface Props {
  defaultRegion?: CareHomeRegion;
}

export const OfstedGuide: React.FC<Props> = ({
  defaultRegion = 'en-GB'
}) => {
  const { 
    getOfstedInfo,
    getOfstedRequirements,
    getOfstedCurriculum,
    getOfstedStaffing,
    getOfstedDocumentation,
    getOfstedQuality
  } = useCareHomeTranslation();

  const ofstedInfo = getOfstedInfo(defaultRegion);
  const requirements = getOfstedRequirements(defaultRegion);
  const curriculum = getOfstedCurriculum(defaultRegion);
  const staffing = getOfstedStaffing(defaultRegion);
  const documentation = getOfstedDocumentation(defaultRegion);
  const quality = getOfstedQuality(defaultRegion);

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Regulatory Body</h3>
          <p>{ofstedInfo.body} ({ofstedInfo.abbreviation})</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Framework</h3>
          <p>{ofstedInfo.framework}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Ratings</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ofstedInfo.ratings).map(([key, value]) => (
            <Badge key={key} variant={key === 'outstanding' ? 'default' : key === 'good' ? 'secondary' : 'destructive'}>
              {value}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Inspection Areas</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ofstedInfo.areas).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCurriculum = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="areas">
        <AccordionTrigger>Learning Areas</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(curriculum.areas).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="planning">
        <AccordionTrigger>Planning</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(curriculum.planning).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="assessment">
        <AccordionTrigger>Assessment</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(curriculum.assessment).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderStaffing = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="roles">
        <AccordionTrigger>Staff Roles</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(staffing.roles).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="qualifications">
        <AccordionTrigger>Required Qualifications</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(staffing.qualifications).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="ratios">
        <AccordionTrigger>Staff Ratios</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(staffing.ratios).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderDocumentation = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="policies">
        <AccordionTrigger>Required Policies</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(documentation.policies).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="records">
        <AccordionTrigger>Required Records</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(documentation.records).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="assessment">
        <AccordionTrigger>Assessment Records</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(documentation.assessment).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  const renderQuality = () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="monitoring">
        <AccordionTrigger>Quality Monitoring</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(quality.monitoring).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="improvement">
        <AccordionTrigger>Quality Improvement</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(quality.improvement).map(([key, value]) => (
              <div key={key} className="p-2 bg-muted rounded-md">
                {value}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ofsted Requirements Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="staffing">Staffing</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="quality">Quality</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {renderOverview()}
            </TabsContent>
            
            <TabsContent value="curriculum" className="space-y-4">
              {renderCurriculum()}
            </TabsContent>
            
            <TabsContent value="staffing" className="space-y-4">
              {renderStaffing()}
            </TabsContent>
            
            <TabsContent value="documentation" className="space-y-4">
              {renderDocumentation()}
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-4">
              {renderQuality()}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
