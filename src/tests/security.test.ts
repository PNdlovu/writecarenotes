import { SecurityService } from '../services/security'
import jwt from 'jsonwebtoken'

describe('SecurityService', () => {
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidGVuYW50SWQiOiJ0ZXN0LXRlbmFudCIsImV4cCI6OTk5OTk5OTk5OX0.test-signature'
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    role: 'STAFF',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('validateToken', () => {
    it('should validate a valid token', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({
        sub: mockUser.id,
        email: mockUser.email,
      }))

      const result = SecurityService.validateToken(mockToken)
      expect(result).toBeTruthy()
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String))
    })

    it('should reject an invalid token', () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token')
      })

      expect(() => SecurityService.validateToken('invalid-token')).toThrow('Invalid token')
    })
  })

  describe('checkPermissions', () => {
    it('should allow access for users with required role', () => {
      const result = SecurityService.checkPermissions(mockUser, ['STAFF', 'ADMIN'])
      expect(result).toBe(true)
    })

    it('should deny access for users without required role', () => {
      const result = SecurityService.checkPermissions(mockUser, ['ADMIN'])
      expect(result).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove dangerous HTML', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = SecurityService.sanitizeInput(input)
      expect(result).toBe('Hello')
    })

    it('should allow safe HTML', () => {
      const input = '<p>Hello <b>World</b></p>'
      const result = SecurityService.sanitizeInput(input)
      expect(result).toBe('<p>Hello <b>World</b></p>')
    })
  })
})


