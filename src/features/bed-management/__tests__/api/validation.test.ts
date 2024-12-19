// src/features/bed-management/__tests__/api/validation.test.ts

import { 
  bedSchema,
  bedAllocationSchema,
  bedTransferSchema,
  bedMaintenanceSchema
} from '../../api/validation'
import { BedType, BedStatus } from '../../types/bed.types'

describe('Bed Management Validation Schemas', () => {
  describe('bedSchema', () => {
    it('validates a valid bed', () => {
      const validBed = {
        number: 'A101',
        type: BedType.STANDARD,
        status: BedStatus.AVAILABLE,
        floor: 1,
        wing: 'A',
        features: ['window', 'bathroom'],
      }

      const result = bedSchema.safeParse(validBed)
      expect(result.success).toBe(true)
    })

    it('rejects invalid bed data', () => {
      const invalidBed = {
        number: '',  // empty string
        type: 'INVALID_TYPE',
        status: 'INVALID_STATUS',
        floor: 0,  // non-positive
        wing: '',  // empty string
        features: 'not-an-array'
      }

      const result = bedSchema.safeParse(invalidBed)
      expect(result.success).toBe(false)
    })
  })

  describe('bedAllocationSchema', () => {
    it('validates a valid allocation', () => {
      const validAllocation = {
        bedId: '123e4567-e89b-12d3-a456-426614174000',
        residentId: '123e4567-e89b-12d3-a456-426614174001',
        startDate: new Date(),
        reason: 'New admission',
        priority: 'HIGH'
      }

      const result = bedAllocationSchema.safeParse(validAllocation)
      expect(result.success).toBe(true)
    })

    it('rejects invalid allocation data', () => {
      const invalidAllocation = {
        bedId: 'not-a-uuid',
        residentId: 'not-a-uuid',
        startDate: 'not-a-date',
        reason: '',
        priority: 'INVALID'
      }

      const result = bedAllocationSchema.safeParse(invalidAllocation)
      expect(result.success).toBe(false)
    })
  })

  describe('bedTransferSchema', () => {
    it('validates a valid transfer', () => {
      const validTransfer = {
        sourceBedId: '123e4567-e89b-12d3-a456-426614174000',
        targetBedId: '123e4567-e89b-12d3-a456-426614174001',
        residentId: '123e4567-e89b-12d3-a456-426614174002',
        scheduledDate: new Date(),
        reason: 'Room preference'
      }

      const result = bedTransferSchema.safeParse(validTransfer)
      expect(result.success).toBe(true)
    })

    it('rejects invalid transfer data', () => {
      const invalidTransfer = {
        sourceBedId: 'not-a-uuid',
        targetBedId: 'not-a-uuid',
        residentId: 'not-a-uuid',
        scheduledDate: 'not-a-date',
        reason: ''
      }

      const result = bedTransferSchema.safeParse(invalidTransfer)
      expect(result.success).toBe(false)
    })
  })

  describe('bedMaintenanceSchema', () => {
    it('validates a valid maintenance schedule', () => {
      const validMaintenance = {
        bedId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'ROUTINE',
        scheduledDate: new Date(),
        notes: 'Regular maintenance check'
      }

      const result = bedMaintenanceSchema.safeParse(validMaintenance)
      expect(result.success).toBe(true)
    })

    it('rejects invalid maintenance data', () => {
      const invalidMaintenance = {
        bedId: 'not-a-uuid',
        type: 'INVALID_TYPE',
        scheduledDate: 'not-a-date',
        notes: 123  // should be string
      }

      const result = bedMaintenanceSchema.safeParse(invalidMaintenance)
      expect(result.success).toBe(false)
    })
  })
})


