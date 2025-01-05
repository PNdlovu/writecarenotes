import { BasePerson, CareType } from '@/types/care';
import { Region } from '@/types/regulatory';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateCareRequirements = (
  person: BasePerson,
  careType: CareType,
  region: Region
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Common validations for all care types
  if (!person.id || !person.name) {
    result.errors.push('Basic person information is missing');
  }

  // Care type specific validations
  switch (careType) {
    case 'childrens':
      if (!person.ofstedRequirements) {
        result.errors.push('Ofsted requirements are missing for children\'s care');
      } else {
        const { ofstedRequirements } = person;
        
        // Registration validation
        if (!ofstedRequirements.registration.registrationNumber) {
          result.errors.push('Ofsted registration number is required');
        }
        
        // Safeguarding validation
        if (!ofstedRequirements.safeguarding.designatedLead) {
          result.errors.push('Safeguarding lead must be assigned');
        }
        
        // Education validation
        if (!ofstedRequirements.educationProvision.arrangements) {
          result.errors.push('Education arrangements must be specified');
        }
      }
      break;

    case 'elderly-care':
      if (person.hasEndOfLifeCare && !person.carePackage) {
        result.errors.push('Care package is required for end of life care');
      }
      break;

    case 'physical-disabilities':
      if (!person.physicalAssessment) {
        result.errors.push('Physical assessment is required');
      }
      if (!person.rehabilitationPlan) {
        result.warnings.push('Rehabilitation plan should be considered');
      }
      break;

    case 'mental-health':
      if (!person.mentalHealthAssessment) {
        result.errors.push('Mental health assessment is required');
      }
      if (!person.riskAssessment) {
        result.errors.push('Risk assessment is required for mental health care');
      }
      if (!person.carePlan?.mentalHealthCrisisPlan) {
        result.errors.push('Mental health crisis plan is required');
      }
      if (!person.medicationManagement) {
        result.warnings.push('Medication management plan should be documented');
      }
      break;

    case 'learning-disabilities':
      if (!person.learningDisabilityAssessment) {
        result.errors.push('Learning disability assessment is required');
      }
      if (!person.communicationPlan) {
        result.errors.push('Communication plan is required');
      }
      if (!person.supportPlan) {
        result.errors.push('Support plan is required');
      }
      if (!person.capacityAssessment) {
        result.warnings.push('Capacity assessment should be considered');
      }
      break;

    case 'domiciliary-care':
      if (!person.carePackage || !person.homeAssessment) {
        result.errors.push('Care package and home assessment are required for domiciliary care');
      }
      break;

    case 'supported-living':
      if (!person.supportedLivingAssessment) {
        result.errors.push('Supported living assessment is required');
      }
      break;

    case 'substance-misuse':
      if (!person.substanceMisuseAssessment) {
        result.errors.push('Substance misuse assessment is required');
      }
      break;

    case 'brain-injury':
      if (!person.brainInjuryAssessment) {
        result.errors.push('Brain injury assessment is required');
      }
      break;
  }

  // Region specific validations
  switch (region) {
    case 'ENGLAND':
      if (!person.cqcRequirements) {
        result.warnings.push('CQC requirements should be documented');
      }
      break;

    case 'WALES':
      if (!person.ciwRequirements) {
        result.warnings.push('CIW requirements should be documented');
      }
      break;

    case 'SCOTLAND':
      if (!person.careInspectorateRequirements) {
        result.warnings.push('Care Inspectorate requirements should be documented');
      }
      break;

    case 'NORTHERN_IRELAND':
      if (!person.rqiaRequirements) {
        result.warnings.push('RQIA requirements should be documented');
      }
      break;

    case 'IRELAND':
      if (!person.hiqaRequirements) {
        result.warnings.push('HIQA requirements should be documented');
      }
      break;
  }

  result.isValid = result.errors.length === 0;
  return result;
};

export const validateStaffRequirements = (
  staff: any,
  careType: CareType
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Common staff validations
  if (!staff.dbs || !staff.dbs.isValid) {
    result.errors.push('Valid DBS check is required');
  }
  if (!staff.qualifications || staff.qualifications.length === 0) {
    result.errors.push('Staff qualifications must be documented');
  }
  if (!staff.training || !staff.training.safeguarding) {
    result.errors.push('Safeguarding training is required');
  }

  // Care type specific staff validations
  switch (careType) {
    case 'childrens':
      if (!staff.ofstedQualifications) {
        result.errors.push('Ofsted-approved qualifications are required');
      }
      if (!staff.pediatricFirstAid) {
        result.errors.push('Pediatric first aid certification is required');
      }
      break;

    case 'mental-health':
      if (!staff.mentalHealthQualifications) {
        result.errors.push('Mental health qualifications are required');
      }
      if (!staff.deEscalationTraining) {
        result.errors.push('De-escalation training is required');
      }
      break;

    case 'learning-disabilities':
      if (!staff.learningDisabilityQualifications) {
        result.errors.push('Learning disability qualifications are required');
      }
      if (!staff.communicationTraining) {
        result.warnings.push('Communication training is recommended');
      }
      break;
  }

  result.isValid = result.errors.length === 0;
  return result;
};

export const validateFacilityRequirements = (
  facility: any,
  careType: CareType,
  region: Region
): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Common facility validations
  if (!facility.registration || !facility.registration.isValid) {
    result.errors.push('Valid facility registration is required');
  }
  if (!facility.fireInspection || !facility.fireInspection.isValid) {
    result.errors.push('Valid fire inspection is required');
  }
  if (!facility.healthAndSafety || !facility.healthAndSafety.isValid) {
    result.errors.push('Valid health and safety assessment is required');
  }

  // Care type specific facility validations
  switch (careType) {
    case 'childrens':
      if (!facility.ofstedRegistration) {
        result.errors.push('Ofsted registration is required');
      }
      if (!facility.safeguardingMeasures) {
        result.errors.push('Safeguarding measures must be documented');
      }
      break;

    case 'elderly-care':
      if (!facility.accessibilityAssessment) {
        result.errors.push('Accessibility assessment is required');
      }
      if (!facility.nurseCallSystem) {
        result.errors.push('Nurse call system is required');
      }
      break;

    case 'mental-health':
      if (!facility.securityMeasures) {
        result.errors.push('Security measures must be documented');
      }
      if (!facility.ligatureAssessment) {
        result.errors.push('Ligature assessment is required');
      }
      break;
  }

  // Region specific facility validations
  switch (region) {
    case 'ENGLAND':
      if (!facility.cqcRegistration) {
        result.errors.push('CQC registration is required');
      }
      break;
    case 'WALES':
      if (!facility.ciwRegistration) {
        result.errors.push('CIW registration is required');
      }
      break;
    // Add other regions...
  }

  result.isValid = result.errors.length === 0;
  return result;
};
