import { FinancialRepository } from '../database/repositories/financialRepository';
import { mockPrisma } from '@/lib/testing/mockPrisma';
import { FinancialError } from '../utils/errors';

describe('FinancialRepository', () => {
  let repository: FinancialRepository;

  beforeEach(() => {
    repository = new FinancialRepository(mockPrisma);
  });

  describe('getSettings', () => {
    it('should return financial settings for tenant', async () => {
      const mockSettings = {
        id: '1',
        tenantId: 'tenant-1',
        currency: 'GBP',
        taxRate: 20,
        billingCycle: 'MONTHLY',
        paymentTerms: 30,
        autoInvoicing: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.financialSettings.findUnique.mockResolvedValue(mockSettings);

      const result = await repository.getSettings('tenant-1');

      expect(result).toEqual(mockSettings);
      expect(mockPrisma.financialSettings.findUnique).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-1' }
      });
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings', async () => {
      const mockSettings = {
        id: '1',
        tenantId: 'tenant-1',
        currency: 'EUR',
        taxRate: 19,
        billingCycle: 'QUARTERLY',
        paymentTerms: 45,
        autoInvoicing: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.financialSettings.upsert.mockResolvedValue(mockSettings);

      const result = await repository.updateSettings('tenant-1', {
        currency: 'EUR',
        taxRate: 19
      });

      expect(result).toEqual(mockSettings);
      expect(mockPrisma.financialSettings.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          update: expect.objectContaining({
            currency: 'EUR',
            taxRate: 19
          })
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.financialSettings.upsert.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.updateSettings('tenant-1', { currency: 'EUR' })
      ).rejects.toThrow(FinancialError);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction with audit trail', async () => {
      const mockTransaction = {
        id: '1',
        tenantId: 'tenant-1',
        amount: 1000,
        currency: 'GBP',
        type: 'CREDIT',
        status: 'COMPLETED',
        description: 'Weekly fee payment',
        metadata: {
          residentId: 'resident-1',
          reference: 'INV-001'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        audit: {
          id: '1',
          transactionId: '1',
          createdAt: new Date(),
          createdBy: 'user-1',
          lastModified: new Date(),
          modifiedBy: 'user-1'
        }
      };

      mockPrisma.financialTransaction.create.mockResolvedValue(mockTransaction);

      const result = await repository.createTransaction('tenant-1', {
        amount: 1000,
        currency: 'GBP',
        type: 'CREDIT',
        description: 'Weekly fee payment',
        metadata: {
          residentId: 'resident-1',
          reference: 'INV-001'
        },
        audit: {
          createdBy: 'user-1',
          modifiedBy: 'user-1'
        }
      });

      expect(result).toEqual(mockTransaction);
      expect(mockPrisma.financialTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            amount: 1000,
            currency: 'GBP'
          })
        })
      );
    });
  });

  describe('getGDPRConsent', () => {
    it('should return GDPR consent for resident', async () => {
      const mockConsent = {
        id: '1',
        residentId: 'resident-1',
        financialDataProcessing: true,
        marketingCommunications: false,
        dataRetentionPeriod: 84,
        consentDate: new Date(),
        consentVersion: '1.0',
        lastUpdated: new Date()
      };

      mockPrisma.gdprConsent.findUnique.mockResolvedValue(mockConsent);

      const result = await repository.getGDPRConsent('resident-1');

      expect(result).toEqual(mockConsent);
      expect(mockPrisma.gdprConsent.findUnique).toHaveBeenCalledWith({
        where: { residentId: 'resident-1' }
      });
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log entry', async () => {
      const mockAuditLog = {
        id: '1',
        tenantId: 'tenant-1',
        action: 'UPDATE_SETTINGS',
        resourceType: 'FINANCIAL_SETTINGS',
        resourceId: 'settings-1',
        userId: 'user-1',
        details: { changes: { currency: 'EUR' } },
        timestamp: new Date()
      };

      mockPrisma.auditLog.create.mockResolvedValue(mockAuditLog);

      await repository.createAuditLog('tenant-1', {
        action: 'UPDATE_SETTINGS',
        resourceType: 'FINANCIAL_SETTINGS',
        resourceId: 'settings-1',
        userId: 'user-1',
        details: { changes: { currency: 'EUR' } }
      });

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          action: 'UPDATE_SETTINGS',
          resourceType: 'FINANCIAL_SETTINGS'
        })
      });
    });
  });
});


