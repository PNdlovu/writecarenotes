import { BedService } from '../../services/bedService'
import { BedRepository } from '../../database/repositories/bedRepository'
import { BedError, BedErrorCode } from '../../types/errors'
import type { ServiceContext } from '@/types/context'

jest.mock('../../database/repositories/bedRepository')

const mockContext: ServiceContext = {
  userId: 'user1',
  careHomeId: 'care1',
  tenantId: 'tenant1',
  region: 'US',
  language: 'en'
}

describe('BedService', () => {
  let service: BedService
  let repository: jest.Mocked<BedRepository>

  beforeEach(() => {
    jest.clearAllMocks()
    repository = BedRepository.getInstance() as jest.Mocked<BedRepository>
    service = BedService.getInstance()
  })

  describe('getBed', () => {
    it('returns bed when found', async () => {
      const mockBed = {
        id: '123',
        roomId: '456',
        careHomeId: 'care1',
        number: 'A101',
        type: 'STANDARD',
        status: 'AVAILABLE',
        features: [],
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user1',
          updatedBy: 'user1'
        }
      }

      repository.findById.mockResolvedValue(mockBed)
      const result = await service.getBed('123', mockContext)
      expect(result).toEqual(mockBed)
    })

    it('throws error when bed not found', async () => {
      repository.findById.mockResolvedValue(null)
      await expect(service.getBed('123', mockContext))
        .rejects
        .toThrow(new BedError('Bed not found: 123', BedErrorCode.NOT_FOUND))
    })
  })

  describe('assignResident', () => {
    it('assigns resident to available bed', async () => {
      const mockBed = {
        id: '123',
        status: 'AVAILABLE',
        roomId: '456',
        careHomeId: 'care1'
      }

      repository.findById.mockResolvedValue(mockBed)
      repository.update.mockImplementation(async (id, data) => ({
        ...mockBed,
        ...data
      }))

      const result = await service.assignResident(
        '123',
        'resident1',
        {
          admissionDate: new Date(),
          careLevel: 'MEDIUM',
          specialRequirements: []
        },
        mockContext
      )

      expect(result.status).toBe('OCCUPIED')
      expect(repository.update).toHaveBeenCalled()
    })

    it('throws error when bed is not available', async () => {
      const mockBed = {
        id: '123',
        status: 'OCCUPIED',
        roomId: '456',
        careHomeId: 'care1'
      }

      repository.findById.mockResolvedValue(mockBed)

      await expect(
        service.assignResident(
          '123',
          'resident1',
          {
            admissionDate: new Date(),
            careLevel: 'MEDIUM',
            specialRequirements: []
          },
          mockContext
        )
      ).rejects.toThrow(BedError)
    })
  })
})


