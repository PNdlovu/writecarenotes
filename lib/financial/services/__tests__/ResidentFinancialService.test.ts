import { PrismaClient } from '@prisma/client';
import { ResidentFinancialService } from '../ResidentFinancialService';
import { FinancialError } from '../../utils/errors';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('@prisma/client');

describe('ResidentFinancialService', () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let service: ResidentFinancialService;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    service = new ResidentFinancialService(prisma);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  describe('upsertFinancialProfile', () => {
    const mockProfile = {
      id: '1',
      tenantId: 'tenant1',
      residentId: 'resident1',
      roomRate: 1000,
      carePackageRate: 500,
      paymentMethod: 'DIRECT_DEBIT',
      billingDay: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a new financial profile successfully', async () => {
      prisma.residentFinancial.upsert.mockResolvedValue(mockProfile);

      const result = await service.upsertFinancialProfile('tenant1', {
        residentId: 'resident1',
        roomRate: 1000,
        carePackageRate: 500,
        paymentMethod: 'DIRECT_DEBIT',
        billingDay: 1,
      });

      expect(result).toEqual(mockProfile);
      expect(prisma.residentFinancial.upsert).toHaveBeenCalledWith({
        where: { residentId: 'resident1' },
        create: expect.any(Object),
        update: expect.any(Object),
      });
    });

    it('should throw FinancialError when upsert fails', async () => {
      prisma.residentFinancial.upsert.mockRejectedValue(new Error('Database error'));

      await expect(
        service.upsertFinancialProfile('tenant1', {
          residentId: 'resident1',
          roomRate: 1000,
          carePackageRate: 500,
          paymentMethod: 'DIRECT_DEBIT',
          billingDay: 1,
        })
      ).rejects.toThrow(FinancialError);
    });
  });

  describe('addFundingSource', () => {
    const mockFunding = {
      id: '1',
      tenantId: 'tenant1',
      residentId: 'resident1',
      fundingSourceId: 'source1',
      startDate: new Date(),
      weeklyAmount: 500,
      contribution: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should add a new funding source successfully', async () => {
      prisma.residentFunding.findFirst.mockResolvedValue(null);
      prisma.residentFunding.create.mockResolvedValue(mockFunding);

      const result = await service.addFundingSource('tenant1', {
        residentId: 'resident1',
        fundingSourceId: 'source1',
        startDate: new Date(),
        weeklyAmount: 500,
        contribution: 0,
      });

      expect(result).toEqual(mockFunding);
      expect(prisma.residentFunding.create).toHaveBeenCalled();
    });

    it('should throw FinancialError when funding period overlaps', async () => {
      prisma.residentFunding.findFirst.mockResolvedValue(mockFunding);

      await expect(
        service.addFundingSource('tenant1', {
          residentId: 'resident1',
          fundingSourceId: 'source1',
          startDate: new Date(),
          weeklyAmount: 500,
          contribution: 0,
        })
      ).rejects.toThrow(FinancialError);
    });
  });

  describe('calculateWeeklyFunding', () => {
    const mockFundings = [
      {
        id: '1',
        weeklyAmount: 300,
        startDate: new Date('2024-01-01'),
        endDate: null,
      },
      {
        id: '2',
        weeklyAmount: 200,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    ];

    it('should calculate total weekly funding correctly', async () => {
      prisma.residentFunding.findMany.mockResolvedValue(mockFundings);

      const result = await service.calculateWeeklyFunding('resident1');

      expect(result).toBe(500);
      expect(prisma.residentFunding.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
      });
    });

    it('should return 0 when no funding sources exist', async () => {
      prisma.residentFunding.findMany.mockResolvedValue([]);

      const result = await service.calculateWeeklyFunding('resident1');

      expect(result).toBe(0);
    });
  });

  describe('calculateResidentContribution', () => {
    const mockProfile = {
      roomRate: 1000,
      carePackageRate: 500,
      fundingSources: [],
    };

    it('should calculate resident contribution correctly', async () => {
      prisma.residentFinancial.findUnique.mockResolvedValue(mockProfile);
      prisma.residentFunding.findMany.mockResolvedValue([
        { weeklyAmount: 800 },
      ]);

      const result = await service.calculateResidentContribution('resident1');

      expect(result).toBe(700); // 1500 (total) - 800 (funding) = 700
    });

    it('should return total cost when no funding exists', async () => {
      prisma.residentFinancial.findUnique.mockResolvedValue(mockProfile);
      prisma.residentFunding.findMany.mockResolvedValue([]);

      const result = await service.calculateResidentContribution('resident1');

      expect(result).toBe(1500); // 1000 + 500 = 1500
    });
  });

  describe('validatePaymentDetails', () => {
    it('should validate direct debit details correctly', () => {
      const validDetails = {
        accountName: 'John Doe',
        accountNumber: '12345678',
        sortCode: '123456',
      };

      expect(service.validatePaymentDetails('DIRECT_DEBIT', validDetails)).toBe(true);
      expect(service.validatePaymentDetails('DIRECT_DEBIT', {})).toBe(false);
    });

    it('should validate SEPA direct debit details correctly', () => {
      const validDetails = {
        accountName: 'John Doe',
        iban: 'IE12345678901234567890',
        bic: 'AIBKIE2D',
      };

      expect(service.validatePaymentDetails('SEPA_DIRECT_DEBIT', validDetails)).toBe(true);
      expect(service.validatePaymentDetails('SEPA_DIRECT_DEBIT', {})).toBe(false);
    });

    it('should validate card payment details correctly', () => {
      const validDetails = {
        cardType: 'VISA',
        lastFourDigits: '1234',
        expiryMonth: 12,
        expiryYear: 2025,
      };

      expect(service.validatePaymentDetails('CARD_PAYMENT', validDetails)).toBe(true);
      expect(service.validatePaymentDetails('CARD_PAYMENT', {})).toBe(false);
    });

    it('should return true for other payment methods', () => {
      expect(service.validatePaymentDetails('CASH', {})).toBe(true);
      expect(service.validatePaymentDetails('CHEQUE', {})).toBe(true);
    });
  });
});
