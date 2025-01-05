// src/features/bed-management/__tests__/hooks/useFeature.test.ts

import { renderHook, act } from '@testing-library/react'
import { useFeature } from '../../hooks/useFeature'
import { BedService } from '../../services'
import { mockSession } from '@/test/mocks/session'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: mockSession, status: 'authenticated' })
}))

// Mock BedService
jest.mock('../../services/bedService')

describe('useFeature', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch stats successfully', async () => {
    const mockStats = {
      totalBeds: 100,
      occupiedBeds: 75,
      availableBeds: 20,
      maintenanceBeds: 5,
      occupancyRate: 0.75
    }

    // Mock implementation
    BedService.getInstance = jest.fn().mockReturnValue({
      getOccupancyStats: jest.fn().mockResolvedValue(mockStats)
    })

    const { result } = renderHook(() => useFeature())

    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toBeNull()

    await act(async () => {
      await result.current.fetchStats()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toEqual(mockStats)
    expect(result.current.error).toBeNull()
  })

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch stats')

    // Mock implementation with error
    BedService.getInstance = jest.fn().mockReturnValue({
      getOccupancyStats: jest.fn().mockRejectedValue(error)
    })

    const { result } = renderHook(() => useFeature())

    await act(async () => {
      await result.current.fetchStats()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.stats).toBeNull()
    expect(result.current.error).toEqual(error)
  })
})


