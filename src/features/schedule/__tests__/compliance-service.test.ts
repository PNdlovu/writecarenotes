import { describe, it, expect, beforeEach } from '@jest/globals';
import { OnCallComplianceService } from '@/app/api/oncall/services/ComplianceService';
import { HandoverTask } from '../types/handover';

describe('OnCallComplianceService', () => {
  let complianceService: OnCallComplianceService;

  beforeEach(() => {
    complianceService = OnCallComplianceService.getInstance();
  });

  describe('Regional Compliance Validation', () => {
    it('should validate CQC requirements for elderly care in England', async () => {
      const task: HandoverTask = {
        id: '1',
        handoverSessionId: 'session1',
        title: 'Medication Round',
        category: 'CLINICAL_CARE',
        activity: 'MEDICATION',
        status: 'PENDING',
        priority: 'HIGH',
        regulatoryRequirements: {
          framework: 'CQC',
          standardRef: 'MED001',
          evidenceRequired: true,
        },
      };

      const result = await complianceService.validateCompliance(task, 'ENGLAND', 'ELDERLY_CARE');
      expect(result.valid).toBeTruthy();
    });

    it('should validate Ofsted requirements for children\'s homes', async () => {
      const task: HandoverTask = {
        id: '2',
        handoverSessionId: 'session2',
        title: 'Education Support',
        category: 'CHILDRENS_CARE',
        activity: 'EDUCATION_SUPPORT',
        status: 'PENDING',
        priority: 'MEDIUM',
        regulatoryRequirements: {
          framework: 'Ofsted',
          standardRef: 'EDU001',
          evidenceRequired: true,
        },
      };

      const result = await complianceService.validateCompliance(task, 'ENGLAND', 'CHILDRENS_HOME');
      expect(result.valid).toBeTruthy();
    });

    it('should validate CIW requirements with Welsh language support', async () => {
      const task: HandoverTask = {
        id: '3',
        handoverSessionId: 'session3',
        title: 'Care Plan Review',
        category: 'PERSONAL_CARE',
        status: 'PENDING',
        priority: 'MEDIUM',
        resident: {
          id: 'resident1',
          name: 'John Doe',
          preferences: ['WELSH_LANGUAGE_ASSESSED'],
        },
      };

      const result = await complianceService.validateCompliance(task, 'WALES', 'ELDERLY_CARE');
      expect(result.valid).toBeTruthy();
    });
  });

  describe('Documentation Requirements', () => {
    it('should validate required documentation for nursing homes', async () => {
      const task: HandoverTask = {
        id: '4',
        handoverSessionId: 'session4',
        title: 'Clinical Assessment',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'HIGH',
      };

      const result = await complianceService.validateDocumentation(task, 'ENGLAND', 'NURSING_HOME');
      expect(result.valid).toBeFalsy();
      expect(result.missing).toContain('CQC_Care_Plan');
    });
  });

  describe('Staff Qualification Validation', () => {
    it('should validate staff qualifications for specialist care', async () => {
      const task: HandoverTask = {
        id: '5',
        handoverSessionId: 'session5',
        title: 'Specialist Treatment',
        category: 'CLINICAL_CARE',
        status: 'PENDING',
        priority: 'HIGH',
        assignedTo: {
          id: 'staff1',
          name: 'Jane Smith',
          qualifications: ['NVQ_Level_3', 'Specialist_Care_Cert'],
        },
      };

      const result = await complianceService.validateCompliance(task, 'ENGLAND', 'SPECIALIST_CARE');
      expect(result.valid).toBeTruthy();
    });
  });
});
