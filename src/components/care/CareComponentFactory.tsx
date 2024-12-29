import React from 'react';
import { CareType, BasePerson } from '../../types/care';
import { Region } from '../../types/regulatory';
import { MentalHealthCare } from '../specialized-care/MentalHealthCare';
import { LearningDisabilitySupport } from '../specialized-care/LearningDisabilitySupport';
import { EndOfLifeCare } from '../specialized-care/EndOfLifeCare';
import { DementiaCare } from '../specialized-care/DementiaCare';
import { PhysicalDisabilitiesCare } from '../specialized-care/PhysicalDisabilitiesCare';
import { DomiciliaryCare } from '../specialized-care/DomiciliaryCare';
import { SupportedLiving } from '../specialized-care/SupportedLiving';
import { SubstanceMisuse } from '../specialized-care/SubstanceMisuse';
import { BrainInjuryCare } from '../specialized-care/BrainInjuryCare';
import { ChildrensCare } from '../specialized-care/ChildrensCare';
import { withRegulatory } from '../regulatory/withRegulatory';

interface CareComponentFactoryProps {
  careType: CareType;
  person: BasePerson;
  region: Region;
  regulatoryData: any;
}

export const CareComponentFactory: React.FC<CareComponentFactoryProps> = ({ 
  careType, 
  person,
  region,
  regulatoryData
}) => {
  // Create regulatory-wrapped versions of our components
  const RegulatedMentalHealthCare = withRegulatory(MentalHealthCare);
  const RegulatedLearningDisabilitySupport = withRegulatory(LearningDisabilitySupport);
  const RegulatedEndOfLifeCare = withRegulatory(EndOfLifeCare);
  const RegulatedDementiaCare = withRegulatory(DementiaCare);
  const RegulatedPhysicalDisabilitiesCare = withRegulatory(PhysicalDisabilitiesCare);
  const RegulatedDomiciliaryCare = withRegulatory(DomiciliaryCare);
  const RegulatedSupportedLiving = withRegulatory(SupportedLiving);
  const RegulatedSubstanceMisuse = withRegulatory(SubstanceMisuse);
  const RegulatedBrainInjuryCare = withRegulatory(BrainInjuryCare);
  const RegulatedChildrensCare = withRegulatory(ChildrensCare);

  // Common props for regulatory components
  const regulatoryProps = {
    region,
    careType,
    regulatoryData
  };

  // Return the appropriate component based on care type
  switch (careType) {
    case 'elderly-care':
      return person.hasEndOfLifeCare ? 
        <RegulatedEndOfLifeCare person={person} {...regulatoryProps} /> : 
        <RegulatedDementiaCare person={person} {...regulatoryProps} />;
    
    case 'mental-health':
      return <RegulatedMentalHealthCare person={person} {...regulatoryProps} />;
    
    case 'learning-disabilities':
      return <RegulatedLearningDisabilitySupport person={person} {...regulatoryProps} />;
    
    case 'physical-disabilities':
      return (
        <RegulatedPhysicalDisabilitiesCare
          person={person}
          assessments={person.physicalAssessment}
          rehabilitation={person.rehabilitationPlan}
          {...regulatoryProps}
        />
      );
    
    case 'domiciliary-care':
      return (
        <RegulatedDomiciliaryCare
          person={person}
          carePackage={person.carePackage}
          homeAssessment={person.homeAssessment}
          {...regulatoryProps}
        />
      );

    case 'supported-living':
      return (
        <RegulatedSupportedLiving
          person={person}
          assessment={person.supportedLivingAssessment}
          {...regulatoryProps}
        />
      );

    case 'substance-misuse':
      return (
        <RegulatedSubstanceMisuse
          person={person}
          assessment={person.substanceMisuseAssessment}
          {...regulatoryProps}
        />
      );

    case 'brain-injury':
      return (
        <RegulatedBrainInjuryCare
          person={person}
          assessment={person.brainInjuryAssessment}
          {...regulatoryProps}
        />
      );

    case 'childrens':
      return (
        <RegulatedChildrensCare
          person={person}
          ofstedData={person.ofstedRequirements}
          {...regulatoryProps}
        />
      );
    
    default:
      console.warn(`No specialized component found for care type: ${careType}`);
      return null;
  }
};
