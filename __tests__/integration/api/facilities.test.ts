import { createMocks } from 'node-mocks-http'
import type { NextApiRequest, NextApiResponse } from 'next'
import { mockSession } from '../../setup/providers'
import { mockFacility } from '../../setup/mockData'
import { getServerSession } from 'next-auth'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    facility: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

describe('Facilities API', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
  })

  describe('GET /api/facilities', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      })

      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      // Here you would import and call your actual API handler
      // await handler(req, res)

      expect(res._getStatusCode()).toBe(401)
    })

    it('returns facilities for authenticated requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      })

      // Here you would mock prisma to return facilities
      // await handler(req, res)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          facilities: expect.any(Array),
        })
      )
    })
  })
})
