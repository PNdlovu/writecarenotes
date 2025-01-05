import React from 'react';
import { useCareHomeTranslation, CareHomeRegion } from '../../hooks/useCareHomeTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface Props {
  defaultRegion?: CareHomeRegion;
}

export const RegionalGuide: React.FC<Props> = ({
  defaultRegion = 'en-GB'
}) => {
  const { 
    getRegulatoryBody, 
    getComplianceRatings,
    getQualityMetrics,
    getClinicalForms,
    getFacilityRequirements,
    getFinancialTerms
  } = useCareHomeTranslation();
  
  const [selectedRegion, setSelectedRegion] = React.useState<CareHomeRegion>(defaultRegion);

  const regions: { value: CareHomeRegion; label: string }[] = [
    { value: 'en-GB', label: 'England' },
    { value: 'en-GB-SCT', label: 'Scotland' },
    { value: 'en-GB-WLS', label: 'Wales' },
    { value: 'en-GB-NIR', label: 'Northern Ireland' },
    { value: 'en-IE', label: 'Ireland' }
  ];

  const regulatoryBody = getRegulatoryBody(selectedRegion);
  const complianceRatings = getComplianceRatings(selectedRegion);
  const qualityMetrics = getQualityMetrics(selectedRegion);
  const clinicalForms = getClinicalForms(selectedRegion);
  const facilityReqs = getFacilityRequirements(selectedRegion);
  const financialTerms = getFinancialTerms(selectedRegion);

  const renderRegulationInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium">Regulatory Body</h3>
          <p>{regulatoryBody.name} ({regulatoryBody.abbreviation})</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Framework</h3>
          <p>{regulatoryBody.framework}</p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Compliance Ratings</h3>
        <div className="flex flex-wrap gap-2">
          {complianceRatings.map((rating) => (
            <Badge key={rating.name} variant={rating.color as any}>
              {rating.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQualityInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Key Performance Indicators</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(qualityMetrics.kpis).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Audits</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(qualityMetrics.audits).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderClinicalInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Clinical Assessments</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(clinicalForms.assessments).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Care Plans</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(clinicalForms.care).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinancialInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Funding Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(financialTerms.funding).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Rate Types</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(financialTerms.rates).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFacilityInfo = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Safety Requirements</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(facilityReqs.safety).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Equipment</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(facilityReqs.equipment).map(([key, value]) => (
            <div key={key} className="p-2 bg-muted rounded-md">
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Regional Care Home Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Select
            value={selectedRegion}
            onValueChange={(value) => setSelectedRegion(value as CareHomeRegion)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ScrollArea className="h-[600px] pr-4">
            <Tabs defaultValue="regulation" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="regulation">Regulation</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="clinical">Clinical</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="facility">Facility</TabsTrigger>
              </TabsList>
              
              <TabsContent value="regulation" className="space-y-4">
                {renderRegulationInfo()}
              </TabsContent>
              
              <TabsContent value="quality" className="space-y-4">
                {renderQualityInfo()}
              </TabsContent>
              
              <TabsContent value="clinical" className="space-y-4">
                {renderClinicalInfo()}
              </TabsContent>
              
              <TabsContent value="financial" className="space-y-4">
                {renderFinancialInfo()}
              </TabsContent>
              
              <TabsContent value="facility" className="space-y-4">
                {renderFacilityInfo()}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
