import { FinancialService } from '../services/financialService';
import { FinancialRepository } from '../database/repositories/financialRepository';
import { FinancialError } from '../utils/errors';
import { mockPrisma } from '@/lib/testing/mockPrisma';

jest.mock('../database/repositories/financialRepository');

describe('FinancialService', () => {
  let service: FinancialService;
  let repository: jest.Mocked<FinancialRepository>;

  beforeEach(() => {
    repository = new FinancialRepository(mockPrisma) as jest.Mocked<FinancialRepository>;
    service = new FinancialService(repository);
  });

  describe('getSettings', () => {
    it('should return default settings if none exist', async () => {
      repository.getSettings.mockResolvedValue(null);
      repository.updateSettings.mockImplementation(async (tenantId, data) => ({
        id: '1',
        tenantId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const result = await service.getSettings('tenant-1');

      expect(result).toMatchObject({
        currency: 'GBP',
        taxRate: 20,
        billingCycle: 'MONTHLY',
        paymentTerms: 30,
        autoInvoicing: false
      });
    });

    it('should return existing settings', async () => {
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

      repository.getSettings.mockResolvedValue(mockSettings);

      const result = await service.getSettings('tenant-1');

      expect(result).toEqual(mockSettings);
    });
  });

  describe('getResidentFinancial', () => {
    it('should validate GDPR consent before returning data', async () => {
      repository.getGDPRConsent.mockResolvedValue({
        id: '1',
        residentId: 'resident-1',
        financialDataProcessing: false,
        marketingCommunications: false,
        dataRetentionPeriod: 84,
        consentDate: new Date(),
        consentVersion: '1.0',
        lastUpdated: new Date()
      });

      await expect(service.getResidentFinancial('resident-1')).rejects.toThrow(
        new FinancialError(
          'GDPR consent for financial data processing not found',
          'GDPR_CONSENT_REQUIRED'
        )
      );
    });

    it('should return resident financial data when GDPR consent exists', async () => {
      const mockFinancial = {
        id: '1',
        residentId: 'resident-1',
        tenantId: 'tenant-1',
        fundingType: 'SELF_FUNDED',
        weeklyFee: 1000,
        paymentMethod: 'DIRECT_DEBIT',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      repository.getGDPRConsent.mockResolvedValue({
        id: '1',
        residentId: 'resident-1',
        financialDataProcessing: true,
        marketingCommunications: false,
        dataRetentionPeriod: 84,
        consentDate: new Date(),
        consentVersion: '1.0',
        lastUpdated: new Date()
      });

      repository.getResidentFinancial.mockResolvedValue(mockFinancial);

      const result = await service.getResidentFinancial('resident-1');

      expect(result).toEqual(mockFinancial);
    });
  });

  describe('processTransaction', () => {
    it('should create a transaction with audit trail', async () => {
      const mockTransaction = {
        amount: 1000,
        currency: 'GBP',
        type: 'CREDIT',
        description: 'Weekly fee payment',
        metadata: {
          residentId: 'resident-1',
          reference: 'INV-001'
        }
      };

      const mockCreatedTransaction = {
        id: '1',
        tenantId: 'tenant-1',
        ...mockTransaction,
        status: 'COMPLETED',
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

      repository.createTransaction.mockResolvedValue(mockCreatedTransaction);

      const result = await service.processTransaction('tenant-1', mockTransaction);

      expect(result).toEqual(mockCreatedTransaction);
      expect(repository.createTransaction).toHaveBeenCalledWith('tenant-1', expect.objectContaining({
        ...mockTransaction,
        audit: expect.any(Object)
      }));
    });

    it('should handle transaction failures', async () => {
      repository.createTransaction.mockRejectedValue(new Error('Database error'));

      await expect(
        service.processTransaction('tenant-1', {
          amount: 1000,
          currency: 'GBP',
          type: 'CREDIT',
          description: 'Weekly fee payment'
        })
      ).rejects.toThrow(FinancialError);
    });
  });
});


