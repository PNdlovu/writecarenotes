import {
  validateCareRequirements,
  validateStaffRequirements,
  validateFacilityRequirements
} from '@/utils/careValidation';
import { mockPerson } from '../mocks/personData';

describe('Care Validation Utils', () => {
  describe('validateCareRequirements', () => {
    it('validates children\'s care requirements correctly', () => {
      const result = validateCareRequirements(mockPerson, 'childrens', 'ENGLAND');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates mental health care requirements correctly', () => {
      const person = {
        ...mockPerson,
        mentalHealthAssessment: null,
        riskAssessment: null
      };
      const result = validateCareRequirements(person, 'mental-health', 'ENGLAND');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mental health assessment is required');
      expect(result.errors).toContain('Risk assessment is required for mental health care');
    });

    it('validates learning disabilities requirements correctly', () => {
      const person = {
        ...mockPerson,
        learningDisabilityAssessment: true,
        communicationPlan: true,
        supportPlan: true
      };
      const result = validateCareRequirements(person, 'learning-disabilities', 'ENGLAND');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Capacity assessment should be considered');
    });

    it('validates region-specific requirements correctly', () => {
      const person = { ...mockPerson, cqcRequirements: null };
      const result = validateCareRequirements(person, 'elderly-care', 'ENGLAND');
      expect(result.warnings).toContain('CQC requirements should be documented');
    });
  });

  describe('validateStaffRequirements', () => {
    const mockStaff = {
      dbs: { isValid: true },
      qualifications: ['Level 3 Diploma'],
      training: { safeguarding: true },
      ofstedQualifications: true,
      pediatricFirstAid: true,
      mentalHealthQualifications: true,
      deEscalationTraining: true,
      learningDisabilityQualifications: true,
      communicationTraining: true
    };

    it('validates common staff requirements correctly', () => {
      const result = validateStaffRequirements(mockStaff, 'childrens');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates children\'s care staff requirements correctly', () => {
      const staff = { ...mockStaff, pediatricFirstAid: false };
      const result = validateStaffRequirements(staff, 'childrens');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Pediatric first aid certification is required');
    });

    it('validates mental health staff requirements correctly', () => {
      const staff = { ...mockStaff, deEscalationTraining: false };
      const result = validateStaffRequirements(staff, 'mental-health');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('De-escalation training is required');
    });

    it('validates learning disabilities staff requirements correctly', () => {
      const staff = { ...mockStaff, communicationTraining: false };
      const result = validateStaffRequirements(staff, 'learning-disabilities');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Communication training is recommended');
    });
  });

  describe('validateFacilityRequirements', () => {
    const mockFacility = {
      registration: { isValid: true },
      fireInspection: { isValid: true },
      healthAndSafety: { isValid: true },
      ofstedRegistration: true,
      safeguardingMeasures: true,
      accessibilityAssessment: true,
      nurseCallSystem: true,
      securityMeasures: true,
      ligatureAssessment: true,
      cqcRegistration: true,
      ciwRegistration: true
    };

    it('validates common facility requirements correctly', () => {
      const result = validateFacilityRequirements(mockFacility, 'childrens', 'ENGLAND');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates children\'s care facility requirements correctly', () => {
      const facility = { ...mockFacility, ofstedRegistration: false };
      const result = validateFacilityRequirements(facility, 'childrens', 'ENGLAND');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ofsted registration is required');
    });

    it('validates elderly care facility requirements correctly', () => {
      const facility = { ...mockFacility, nurseCallSystem: false };
      const result = validateFacilityRequirements(facility, 'elderly-care', 'ENGLAND');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Nurse call system is required');
    });

    it('validates mental health facility requirements correctly', () => {
      const facility = { ...mockFacility, ligatureAssessment: false };
      const result = validateFacilityRequirements(facility, 'mental-health', 'ENGLAND');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ligature assessment is required');
    });

    it('validates region-specific facility requirements correctly', () => {
      const facility = { ...mockFacility, cqcRegistration: false };
      const result = validateFacilityRequirements(facility, 'elderly-care', 'ENGLAND');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('CQC registration is required');
    });
  });
});
