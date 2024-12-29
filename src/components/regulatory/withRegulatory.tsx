import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegulatoryCompliance } from './RegulatoryCompliance';
import { Region } from '@/types/regulatory';
import { CareType } from '@/types/care';

interface WithRegulatoryProps {
  region: Region;
  careType: CareType;
  regulatoryData: any; // Type this based on your data structure
}

export const withRegulatory = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithRegulatoryComponent({
    region,
    careType,
    regulatoryData,
    ...props
  }: P & WithRegulatoryProps) {
    return (
      <Tabs defaultValue="care" className="space-y-6">
        <TabsList>
          <TabsTrigger value="care">Care Management</TabsTrigger>
          <TabsTrigger value="compliance">Regulatory Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="care">
          <WrappedComponent {...props as P} />
        </TabsContent>

        <TabsContent value="compliance">
          <RegulatoryCompliance
            region={region}
            careType={careType}
            {...regulatoryData}
          />
        </TabsContent>
      </Tabs>
    );
  };
};
