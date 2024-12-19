/**
 * @fileoverview Tests for audit service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AuditService } from '../services/auditService';
import { AuditRepository } from '../database/repositories/auditRepository';
import { AuditLogEntry, AuditLogFilter } from '../types/audit.types';
import { DomainError } from '@/features/carehome/types/errors';

// Mock the repository
jest.mock('../database/repositories/auditRepository');

describe('AuditService', () => {
  let service: AuditService;
  let mockRepository: jest.Mocked<AuditRepository>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset singleton instance
    (AuditService as any).instance = null;
    (AuditRepository as any).instance = null;
    
    // Setup mock repository
    mockRepository = {
      getInstance: jest.fn().mockReturnThis(),
      createLog: jest.fn(),
      findLogs: jest.fn(),
      getEntityHistory: jest.fn(),
      getStats: jest.fn(),
      archiveOldLogs: jest.fn(),
    } as unknown as jest.Mocked<AuditRepository>;

    (AuditRepository.getInstance as jest.Mock).mockReturnValue(mockRepository);
    
    // Get service instance
    service = AuditService.getInstance();
  });

  describe('logActivity', () => {
    const validEntry: Omit<AuditLogEntry, 'id' | 'timestamp'> = {
      entityType: 'CareHome',
      entityId: '123',
      action: 'CREATE',
      actorId: 'user123',
      actorType: 'USER',
      organizationId: 'org123',
      status: 'SUCCESS',
    };

    it('should create a valid audit log entry', async () => {
      mockRepository.createLog.mockResolvedValue({ ...validEntry, id: '1', timestamp: new Date() });

      const result = await service.logActivity(validEntry);

      expect(result).toBeDefined();
      expect(mockRepository.createLog).toHaveBeenCalledWith(validEntry);
    });

    it('should throw error for invalid entry', async () => {
      const invalidEntry = { ...validEntry, entityType: '' };

      await expect(service.logActivity(invalidEntry)).rejects.toThrow(DomainError);
    });
  });

  describe('searchLogs', () => {
    const validFilter: AuditLogFilter = {
      entityType: 'CareHome',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      limit: 10,
    };

    it('should return filtered logs', async () => {
      const mockLogs = [{ id: '1', ...validFilter }];
      mockRepository.findLogs.mockResolvedValue(mockLogs);

      const result = await service.searchLogs(validFilter);

      expect(result).toEqual(mockLogs);
      expect(mockRepository.findLogs).toHaveBeenCalledWith(validFilter);
    });

    it('should throw error for invalid filter', async () => {
      const invalidFilter = { ...validFilter, limit: -1 };

      await expect(service.searchLogs(invalidFilter)).rejects.toThrow(DomainError);
    });
  });

  describe('getEntityHistory', () => {
    it('should return entity history', async () => {
      const mockHistory = {
        current: [{ id: '1' }],
        archived: [{ id: '2', archivedAt: new Date() }],
      };
      mockRepository.getEntityHistory.mockResolvedValue(mockHistory);

      const result = await service.getEntityHistory('CareHome', '123');

      expect(result).toEqual(mockHistory);
      expect(mockRepository.getEntityHistory).toHaveBeenCalledWith('CareHome', '123');
    });

    it('should throw error for missing parameters', async () => {
      await expect(service.getEntityHistory('', '123')).rejects.toThrow(DomainError);
    });
  });

  describe('archiveOldLogs', () => {
    it('should archive logs older than specified days', async () => {
      mockRepository.archiveOldLogs.mockResolvedValue(5);

      const result = await service.archiveOldLogs(90);

      expect(result).toBe(5);
      expect(mockRepository.archiveOldLogs).toHaveBeenCalledWith(90);
    });

    it('should throw error for invalid days', async () => {
      await expect(service.archiveOldLogs(0)).rejects.toThrow(DomainError);
    });
  });

  describe('exportLogs', () => {
    const exportOptions = {
      format: 'JSON' as const,
      filter: { entityType: 'CareHome' },
      includeArchived: false,
    };

    it('should export logs in JSON format', async () => {
      const mockLogs = [{ id: '1' }];
      mockRepository.findLogs.mockResolvedValue(mockLogs);

      const result = await service.exportLogs(exportOptions);

      expect(result).toBeInstanceOf(Buffer);
      expect(JSON.parse(result.toString())).toEqual(mockLogs);
    });

    it('should throw error for unsupported format', async () => {
      const invalidOptions = {
        ...exportOptions,
        format: 'INVALID' as any,
      };

      await expect(service.exportLogs(invalidOptions)).rejects.toThrow(DomainError);
    });
  });
}); 


