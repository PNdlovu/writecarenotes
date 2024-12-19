import React from 'react';
import { useMedicalTranslation } from '../../hooks/useMedicalTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  category?: 'medication' | 'condition' | 'procedure' | 'vital';
}

export const MedicalTerminologyHelper: React.FC<Props> = ({ 
  category = 'medication'
}) => {
  const { translateTerm, getCommonPhrases } = useMedicalTranslation();
  const commonPhrases = getCommonPhrases(category);

  const renderAbbreviations = () => {
    const abbreviations = {
      vital: ['BP', 'HR', 'RR', 'SpO2'],
      condition: ['AF', 'MI', 'COPD'],
      procedure: ['VAC'],
      medication: ['INR']
    };

    return (
      <div className="space-y-2">
        {abbreviations[category]?.map((abbr) => (
          <div key={abbr} className="p-2 bg-muted rounded-md">
            {translateTerm(abbr, { category, isAbbreviation: true })}
          </div>
        ))}
      </div>
    );
  };

  const renderCommonPhrases = () => (
    <div className="space-y-2">
      {commonPhrases.map((phrase) => (
        <div key={phrase} className="p-2 bg-muted rounded-md">
          {phrase}
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medical Terminology Helper</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="abbreviations">
          <TabsList>
            <TabsTrigger value="abbreviations">Abbreviations</TabsTrigger>
            <TabsTrigger value="common">Common Phrases</TabsTrigger>
          </TabsList>
          <TabsContent value="abbreviations">
            {renderAbbreviations()}
          </TabsContent>
          <TabsContent value="common">
            {renderCommonPhrases()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
