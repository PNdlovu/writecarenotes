import { describe, it, expect, beforeEach } from 'vitest'
import { mockCareHome } from '../../setup/mockData'
import { prisma } from '@/lib/prisma'
import { createMocks } from 'node-mocks-http'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    careHome: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('Care Homes API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/care-homes', () => {
    it('requires authentication', async () => {
      const { req, res } = createMocks({
        method: 'GET',
      })

      await handler(req, res)
      expect(res._getStatusCode()).toBe(401)
    })

    it('returns care homes for authenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })

      // Mock prisma to return care homes
      vi.mocked(prisma.careHome.findMany).mockResolvedValue([mockCareHome])

      await handler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual({
        careHomes: expect.any(Array),
      })
    })
  })
}) 