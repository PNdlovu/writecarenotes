import { CareHomeService } from '../services/careHomeService';
import { CareHomeRepository } from '../repositories/careHomeRepository';
import { CareHomeError } from '../types/errors';
import { CreateCareHomeDTO } from '../types/carehome.types';

// Mock the repository
jest.mock('../repositories/careHomeRepository');

describe('CareHomeService', () => {
  let service: CareHomeService;
  let mockRepository: jest.Mocked<CareHomeRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CareHomeService();
    mockRepository = new CareHomeRepository() as jest.Mocked<CareHomeRepository>;
  });

  describe('createCareHome', () => {
    const validData: CreateCareHomeDTO = {
      name: 'Test Care Home',
      type: 'RESIDENTIAL',
      address: {
        street: '123 Test Street',
        city: 'Test City',
        county: 'Test County',
        postcode: 'TE1 1ST',
      },
    };

    it('should create care home with valid data', async () => {
      mockRepository.createCareHome.mockResolvedValue({
        ...validData,
        id: '123',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        residents: [],
        staff: [],
        facilities: [],
      });

      const result = await service.createCareHome(validData);
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
    });

    it('should throw validation error for missing required fields', async () => {
      const invalidData = { ...validData, name: '' };
      await expect(service.createCareHome(invalidData))
        .rejects
        .toThrow(new CareHomeError('Missing required fields', 'VALIDATION_ERROR'));
    });

    it('should throw validation error for invalid address', async () => {
      const invalidData = {
        ...validData,
        address: { ...validData.address, street: '' },
      };
      await expect(service.createCareHome(invalidData))
        .rejects
        .toThrow(new CareHomeError('Invalid address details', 'VALIDATION_ERROR'));
    });
  });

  describe('searchCareHomes', () => {
    it('should search care homes with valid parameters', async () => {
      const mockResults = [
        {
          id: '123',
          name: 'Test Care Home',
          type: 'RESIDENTIAL',
          status: 'ACTIVE',
          residents: [],
          staff: [],
          facilities: [],
        },
      ];

      mockRepository.searchCareHomes.mockResolvedValue(mockResults);
      const result = await service.searchCareHomes({ type: 'RESIDENTIAL' });
      expect(result).toEqual(mockResults);
    });

    it('should throw validation error for short search term', async () => {
      await expect(service.searchCareHomes({ name: 'a' }))
        .rejects
        .toThrow(new CareHomeError('Search term must be at least 2 characters', 'VALIDATION_ERROR'));
    });

    it('should throw validation error for invalid limit', async () => {
      await expect(service.searchCareHomes({}, { limit: 0 }))
        .rejects
        .toThrow(new CareHomeError('Limit must be between 1 and 100', 'VALIDATION_ERROR'));
    });
  });

  describe('deleteCareHome', () => {
    it('should delete care home when no active residents', async () => {
      mockRepository.getCareHomeById.mockResolvedValue({
        id: '123',
        name: 'Test Care Home',
        type: 'RESIDENTIAL',
        status: 'ACTIVE',
        residents: [],
        staff: [],
        facilities: [],
      });

      await service.deleteCareHome('123');
      expect(mockRepository.deleteCareHome).toHaveBeenCalledWith('123');
    });

    it('should throw error when care home has active residents', async () => {
      mockRepository.getCareHomeById.mockResolvedValue({
        id: '123',
        name: 'Test Care Home',
        type: 'RESIDENTIAL',
        status: 'ACTIVE',
        residents: [{ id: '1', status: 'ACTIVE' } as any],
        staff: [],
        facilities: [],
      });

      await expect(service.deleteCareHome('123'))
        .rejects
        .toThrow(new CareHomeError('Cannot delete care home with active residents', 'VALIDATION_ERROR'));
    });
  });

  describe('getStats', () => {
    it('should return care home statistics', async () => {
      const mockStats = {
        total: 10,
        activeCount: 8,
        byType: { RESIDENTIAL: 5, NURSING: 5 },
        byRegion: { 'Test County': 10 },
      };

      mockRepository.getStats.mockResolvedValue(mockStats);
      const result = await service.getStats();
      expect(result).toEqual(mockStats);
    });
  });
}); 


