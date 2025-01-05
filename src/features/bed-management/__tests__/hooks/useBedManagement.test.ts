import { renderHook, act } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useBedManagement } from '../../hooks/useBedManagement'
import { BedService } from '../../services/bedService'

jest.mock('next-auth/react')
jest.mock('../../services/bedService')

const mockSession = {
  user: {
    id: 'user1',
    tenantId: 'tenant1',
    careHomeId: 'care1',
    region: 'US',
    language: 'en'
  }
}

describe('useBedManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated'
    })
  })

  it('fetches bed and stats on mount', async () => {
    const mockBed = {
      id: '123',
      number: 'A101',
      status: 'AVAILABLE'
    }

    const mockStats = {
      total: 10,
      occupied: 5,
      available: 5,
      occupancyRate: 50
    }

    const mockService = {
      getBed: jest.fn().mockResolvedValue(mockBed),
      getOccupancyStats: jest.fn().mockResolvedValue(mockStats)
    }

    ;(BedService.getInstance as jest.Mock).mockReturnValue(mockService)

    const { result } = renderHook(() => useBedManagement('123'))

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.bed).toEqual(mockBed)
    expect(result.current.stats).toEqual(mockStats)
    expect(mockService.getBed).toHaveBeenCalledWith('123', expect.any(Object))
    expect(mockService.getOccupancyStats).toHaveBeenCalledWith(expect.any(Object))
  })

  it('handles errors gracefully', async () => {
    const error = new Error('Failed to fetch')
    const mockService = {
      getBed: jest.fn().mockRejectedValue(error),
      getOccupancyStats: jest.fn().mockRejectedValue(error)
    }

    ;(BedService.getInstance as jest.Mock).mockReturnValue(mockService)

    const { result } = renderHook(() => useBedManagement('123'))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(error)
    expect(result.current.bed).toBe(null)
    expect(result.current.stats).toBe(null)
  })

  it('does not fetch if no session', async () => {
    ;(useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    const mockService = {
      getBed: jest.fn(),
      getOccupancyStats: jest.fn()
    }

    ;(BedService.getInstance as jest.Mock).mockReturnValue(mockService)

    const { result } = renderHook(() => useBedManagement('123'))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.loading).toBe(false)
    expect(mockService.getBed).not.toHaveBeenCalled()
    expect(mockService.getOccupancyStats).not.toHaveBeenCalled()
  })
})


