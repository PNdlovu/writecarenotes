import { ComplianceService } from '../ComplianceService';
import { ComplianceRepository } from '../../repositories/complianceRepository';
import { Region } from '../../types/compliance.types';

// Mock the repository
jest.mock('../../repositories/complianceRepository');

describe('ComplianceService', () => {
  let service: ComplianceService;
  let mockRepository: jest.Mocked<ComplianceRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new mock repository instance
    mockRepository = new ComplianceRepository() as jest.Mocked<ComplianceRepository>;
    
    // Create a new service instance with the mock repository
    service = new ComplianceService('UK' as Region, mockRepository);
  });

  describe('getFrameworks', () => {
    it('should return frameworks for the specified region', async () => {
      const mockFrameworks = [
        {
          id: '1',
          name: 'Test Framework',
          version: '1.0',
          region: 'UK' as Region,
          requirements: [],
          lastUpdated: new Date()
        }
      ];

      mockRepository.getFrameworks.mockResolvedValue(mockFrameworks);

      const result = await service.getFrameworks();

      expect(result).toEqual(mockFrameworks);
      expect(mockRepository.getFrameworks).toHaveBeenCalledWith('UK');
    });

    it('should handle repository errors', async () => {
      mockRepository.getFrameworks.mockRejectedValue(new Error('Database error'));

      await expect(service.getFrameworks()).rejects.toThrow('Database error');
    });
  });

  describe('validateCompliance', () => {
    it('should throw error if framework not found', async () => {
      mockRepository.getFramework.mockResolvedValue(null);

      await expect(
        service.validateCompliance('org1', 'care1', 'framework1')
      ).rejects.toThrow('Compliance framework not found');
    });

    it('should validate compliance correctly', async () => {
      const mockFramework = {
        id: '1',
        name: 'Test Framework',
        version: '1.0',
        region: 'UK' as Region,
        requirements: [
          {
            id: 'req1',
            code: 'R1',
            category: 'Safety',
            description: 'Test requirement',
            guidance: 'Test guidance',
            evidenceRequired: ['document'],
            applicableRoles: ['manager'],
            riskLevel: 'HIGH' as const
          }
        ],
        lastUpdated: new Date()
      };

      const mockEvidence = [
        {
          id: 'ev1',
          requirementId: 'req1',
          type: 'document',
          content: 'Test evidence',
          uploadedBy: 'user1',
          uploadedAt: new Date(),
          metadata: {}
        }
      ];

      mockRepository.getFramework.mockResolvedValue(mockFramework);
      mockRepository.getEvidence.mockResolvedValue(mockEvidence);
      mockRepository.createAudit.mockImplementation(audit => Promise.resolve({ ...audit, id: '1' }));

      const result = await service.validateCompliance('org1', 'care1', '1');

      expect(result).toBeDefined();
      expect(result.organizationId).toBe('org1');
      expect(result.careHomeId).toBe('care1');
      expect(result.frameworkId).toBe('1');
      expect(mockRepository.createAudit).toHaveBeenCalled();
    });
  });

  describe('getAudits', () => {
    it('should return audits for the organization', async () => {
      const mockAudits = [
        {
          id: '1',
          frameworkId: 'f1',
          organizationId: 'org1',
          careHomeId: 'care1',
          auditedBy: 'user1',
          auditDate: new Date(),
          findings: [],
          score: 80,
          nextAuditDue: new Date(),
          status: 'APPROVED' as const
        }
      ];

      mockRepository.getAudits.mockResolvedValue(mockAudits);

      const result = await service.getAudits('org1', 'care1');

      expect(result).toEqual(mockAudits);
      expect(mockRepository.getAudits).toHaveBeenCalledWith('org1', 'care1');
    });
  });
});


