/**
 * @writecarenotes.com
 * @fileoverview OnCall Authentication Middleware Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Request, Response } from 'express';
import { getSession } from 'next-auth/react';
import { OnCallStaffService } from '../../services/StaffService';
import { requireOnCallAuth, requireEmergencyAuth } from '../auth';

// Mock next-auth
jest.mock('next-auth/react');
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

// Mock StaffService
jest.mock('../../services/StaffService', () => ({
  OnCallStaffService: {
    getInstance: jest.fn(() => ({
      listAvailableOnCallStaff: jest.fn()
    }))
  }
}));

describe('Authentication Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockStaffService: jest.Mocked<OnCallStaffService>;

  beforeEach(() => {
    mockReq = {
      body: { region: 'england' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    mockStaffService = OnCallStaffService.getInstance() as jest.Mocked<OnCallStaffService>;
  });

  describe('requireOnCallAuth', () => {
    it('should allow authenticated on-call staff', async () => {
      // Mock authenticated session
      mockGetSession.mockResolvedValueOnce({
        user: { id: 'staff-1', name: 'Test Staff' }
      });

      // Mock staff service response
      mockStaffService.listAvailableOnCallStaff.mockResolvedValueOnce([
        { id: 'staff-1', status: 'on_call' }
      ]);

      await requireOnCallAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated requests', async () => {
      // Mock no session
      mockGetSession.mockResolvedValueOnce(null);

      await requireOnCallAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject non-oncall staff', async () => {
      // Mock authenticated session
      mockGetSession.mockResolvedValueOnce({
        user: { id: 'staff-1', name: 'Test Staff' }
      });

      // Mock empty staff list (no on-call staff)
      mockStaffService.listAvailableOnCallStaff.mockResolvedValueOnce([]);

      await requireOnCallAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authorized for on-call duties' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireEmergencyAuth', () => {
    it('should allow authenticated emergency staff', async () => {
      // Mock authenticated session
      mockGetSession.mockResolvedValueOnce({
        user: { id: 'staff-1', name: 'Test Staff' }
      });

      // Mock staff service response
      mockStaffService.listAvailableOnCallStaff.mockResolvedValueOnce([
        { id: 'staff-1', status: 'emergency' }
      ]);

      await requireEmergencyAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject non-emergency staff', async () => {
      // Mock authenticated session
      mockGetSession.mockResolvedValueOnce({
        user: { id: 'staff-1', name: 'Test Staff' }
      });

      // Mock empty staff list (no emergency staff)
      mockStaffService.listAvailableOnCallStaff.mockResolvedValueOnce([]);

      await requireEmergencyAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Not authorized for emergency response' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      // Mock authenticated session
      mockGetSession.mockResolvedValueOnce({
        user: { id: 'staff-1', name: 'Test Staff' }
      });

      // Mock service error
      mockStaffService.listAvailableOnCallStaff.mockRejectedValueOnce(new Error('Service error'));

      await requireEmergencyAuth(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 