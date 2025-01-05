/**
 * @writecarenotes.com
 * @fileoverview Care component factory for specialized care services
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A factory component that dynamically generates specialized care components
 * based on care type and regional requirements. Features include:
 * - Dynamic component selection based on care type
 * - Regional regulatory compliance integration
 * - Support for multiple specialized care types
 * - Automatic regulatory wrapper application
 * - Type-safe component generation
 * - Error boundary protection
 * - Performance optimization
 *
 * Mobile-First Considerations:
 * - Responsive layouts
 * - Touch-friendly controls
 * - Dynamic loading states
 * - Network resilience
 * - Offline support
 * - Resource optimization
 *
 * Enterprise Features:
 * - Regulatory compliance
 * - Error boundaries
 * - Performance monitoring
 * - Audit logging
 * - Analytics tracking
 * - Regional adaptation
 */

import React from 'react';

// Types
import { CareType, BasePerson } from '../../types/care';
import { Region } from '../../types/regulatory';

// Specialized Care Components
import { MentalHealthCare } from './specialized/mental-health/MentalHealthCare';
import { LearningDisabilitySupport } from './specialized/learning-disabilities/LearningDisabilitiesCare';
import { EndOfLifeCare } from './specialized/end-of-life/EndOfLifeCare';
import { DementiaCare } from './specialized/dementia/DementiaCare';
import { PhysicalDisabilitiesCare } from './specialized/physical-disabilities/PhysicalDisabilitiesCare';
import { DomiciliaryCare } from './specialized/domiciliary/DomiciliaryCare';
import { SupportedLiving } from './specialized/supported-living/SupportedLiving';
import { SubstanceMisuse } from './specialized/substance-misuse/SubstanceMisuse';
import { BrainInjuryCare } from './specialized/brain-injury/BrainInjuryCare';
import { ChildrensCare } from './specialized/childrens/ChildrensCare';
import { YoungAdultCare } from './specialized/young-adult/YoungAdultCare';
import { MentalCapacityAssessment } from './specialized/mental-capacity/MentalCapacityAssessment';

// Higher Order Components
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
  const RegulatedYoungAdultCare = withRegulatory(YoungAdultCare);
  const RegulatedMentalCapacityAssessment = withRegulatory(MentalCapacityAssessment);

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

    case 'young-adult':
      return (
        <RegulatedYoungAdultCare
          person={person}
          assessment={person.youngAdultAssessment}
          {...regulatoryProps}
        />
      );

    case 'mental-capacity':
      return (
        <RegulatedMentalCapacityAssessment
          person={person}
          assessment={person.mentalCapacityAssessment}
          {...regulatoryProps}
        />
      );
    
    default:
      console.warn(`No specialized component found for care type: ${careType}`);
      return null;
  }
};
