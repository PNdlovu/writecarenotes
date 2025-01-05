/**
 * @writecarenotes.com
 * @fileoverview Tests for Compliance Repository
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '../../../../../src/lib/prisma';
import { ComplianceRepository } from '../ComplianceRepository';
import { Compliance, ComplianceStatus, Region } from '../../types';

// Mock Prisma client
jest.mock('../../../../../src/lib/prisma', () => ({
  prisma: {
    onCallCompliance: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  },
}));

describe('ComplianceRepository', () => {
  let repository: ComplianceRepository;
  const mockCompliance: Compliance = {
    id: '1',
    callId: 'call_1',
    region: 'england' as Region,
    regulatoryBody: 'CQC',
    status: 'compliant' as ComplianceStatus,
    checkType: 'recording_retention',
    details: {
      retentionPeriod: '7 years',
      encryptionLevel: 'AES-256',
      accessControls: ['role_based', 'mfa_required'],
    },
    organizationId: 'org_1',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = ComplianceRepository.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = ComplianceRepository.getInstance();
      const instance2 = ComplianceRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createCompliance', () => {
    it('should create a compliance record', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockCompliance;
      (prisma.onCallCompliance.create as jest.Mock).mockResolvedValue(mockCompliance);

      const result = await repository.createCompliance(createData);

      expect(prisma.onCallCompliance.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockCompliance);
    });

    it('should validate regulatory body', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockCompliance;
      const invalidData = {
        ...createData,
        regulatoryBody: 'INVALID_BODY',
      };

      await expect(repository.createCompliance(invalidData)).rejects.toThrow(
        'Invalid regulatory body for region'
      );
    });
  });

  describe('updateCompliance', () => {
    it('should update a compliance record', async () => {
      const updates = {
        status: 'non_compliant' as ComplianceStatus,
        details: {
          ...mockCompliance.details,
          encryptionLevel: 'AES-512',
        },
      };
      const updatedCompliance = { ...mockCompliance, ...updates };
      (prisma.onCallCompliance.update as jest.Mock).mockResolvedValue(updatedCompliance);

      const result = await repository.updateCompliance(mockCompliance.id, updates);

      expect(prisma.onCallCompliance.update).toHaveBeenCalledWith({
        where: { id: mockCompliance.id },
        data: {
          ...updates,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedCompliance);
    });
  });

  describe('getComplianceById', () => {
    it('should find compliance by id', async () => {
      (prisma.onCallCompliance.findUnique as jest.Mock).mockResolvedValue(mockCompliance);

      const result = await repository.getComplianceById(mockCompliance.id);

      expect(prisma.onCallCompliance.findUnique).toHaveBeenCalledWith({
        where: { id: mockCompliance.id },
      });
      expect(result).toEqual(mockCompliance);
    });

    it('should return null if compliance not found', async () => {
      (prisma.onCallCompliance.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getComplianceById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('listCompliance', () => {
    it('should list compliance records with filters', async () => {
      const filters = {
        region: 'england' as Region,
        status: 'compliant' as ComplianceStatus,
      };
      const complianceRecords = [mockCompliance];
      (prisma.onCallCompliance.findMany as jest.Mock).mockResolvedValue(complianceRecords);

      const result = await repository.listCompliance(filters);

      expect(prisma.onCallCompliance.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(complianceRecords);
    });

    it('should apply date range filters', async () => {
      const startDate = new Date('2024-03-21');
      const endDate = new Date('2024-03-22');
      const filters = {
        region: 'england' as Region,
        startDate,
        endDate,
      };
      const complianceRecords = [mockCompliance];
      (prisma.onCallCompliance.findMany as jest.Mock).mockResolvedValue(complianceRecords);

      const result = await repository.listCompliance(filters);

      expect(prisma.onCallCompliance.findMany).toHaveBeenCalledWith({
        where: {
          region: 'england',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(complianceRecords);
    });
  });

  describe('deleteCompliance', () => {
    it('should delete a compliance record', async () => {
      await repository.deleteCompliance(mockCompliance.id);

      expect(prisma.onCallCompliance.delete).toHaveBeenCalledWith({
        where: { id: mockCompliance.id },
      });
    });
  });

  describe('getComplianceByCall', () => {
    it('should get compliance records for a call', async () => {
      const callId = 'call_1';
      const complianceRecords = [mockCompliance];
      (prisma.onCallCompliance.findMany as jest.Mock).mockResolvedValue(complianceRecords);

      const result = await repository.getComplianceByCall(callId);

      expect(prisma.onCallCompliance.findMany).toHaveBeenCalledWith({
        where: {
          callId,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(complianceRecords);
    });
  });

  describe('getNonCompliantRecords', () => {
    it('should get non-compliant records', async () => {
      const nonCompliantRecords = [
        { ...mockCompliance, status: 'non_compliant' as ComplianceStatus },
      ];
      (prisma.onCallCompliance.findMany as jest.Mock).mockResolvedValue(nonCompliantRecords);

      const result = await repository.getNonCompliantRecords();

      expect(prisma.onCallCompliance.findMany).toHaveBeenCalledWith({
        where: {
          status: 'non_compliant',
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(nonCompliantRecords);
    });
  });

  describe('getComplianceByRegion', () => {
    it('should get compliance records by region', async () => {
      const region = 'england' as Region;
      const complianceRecords = [mockCompliance];
      (prisma.onCallCompliance.findMany as jest.Mock).mockResolvedValue(complianceRecords);

      const result = await repository.getComplianceByRegion(region);

      expect(prisma.onCallCompliance.findMany).toHaveBeenCalledWith({
        where: {
          region,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(complianceRecords);
    });
  });

  describe('getComplianceByRegulatoryBody', () => {
    it('should get compliance records by regulatory body', async () => {
      const regulatoryBody = 'CQC';
      const complianceRecords = [mockCompliance];
      (prisma.onCallCompliance.findMany as jest.Mock).mockResolvedValue(complianceRecords);

      const result = await repository.getComplianceByRegulatoryBody(regulatoryBody);

      expect(prisma.onCallCompliance.findMany).toHaveBeenCalledWith({
        where: {
          regulatoryBody,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(complianceRecords);
    });
  });
}); 