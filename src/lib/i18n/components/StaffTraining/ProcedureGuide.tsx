import React from 'react';
import { useMedicalTranslation } from '../../hooks/useMedicalTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';

interface Props {
  procedureType: 'wound' | 'mobility';
  procedure: string;
}

export const ProcedureGuide: React.FC<Props> = ({
  procedureType,
  procedure
}) => {
  const { translateTerm, getCommonPhrases } = useMedicalTranslation();
  const commonSteps = getCommonPhrases('procedure');
  
  const procedureName = translateTerm(procedure, {
    category: 'procedure',
    specialty: procedureType
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{procedureName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {commonSteps.map((step, index) => (
            <AccordionItem key={step} value={`step-${index}`}>
              <AccordionTrigger>{step}</AccordionTrigger>
              <AccordionContent>
                {/* This would be populated with actual procedure steps */}
                {`Detailed instructions for ${step.toLowerCase()} would go here`}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
