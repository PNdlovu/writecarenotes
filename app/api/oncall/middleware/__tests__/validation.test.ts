/**
 * @writecarenotes.com
 * @fileoverview OnCall Validation Middleware Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Request, Response } from 'express';
import {
  validateRegion,
  validateCallPriority,
  validateCallStatus,
  validateStaffStatus,
  validateDateRange,
  validatePhoneNumber,
  validateStaffId,
  validateCallId
} from '../validation';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('validateRegion', () => {
    it('should allow valid regions', () => {
      const validRegions = ['england', 'wales', 'scotland', 'northern_ireland', 'ireland'];
      
      validRegions.forEach(region => {
        mockReq.body = { region };
        validateRegion(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('should reject invalid regions', () => {
      mockReq.body = { region: 'invalid' };
      validateRegion(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid region' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateCallPriority', () => {
    it('should allow valid priorities', () => {
      const validPriorities = ['low', 'normal', 'high', 'emergency'];
      
      validPriorities.forEach(priority => {
        mockReq.body = { priority };
        validateCallPriority(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('should reject invalid priorities', () => {
      mockReq.body = { priority: 'invalid' };
      validateCallPriority(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid call priority' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateCallStatus', () => {
    it('should allow valid statuses', () => {
      const validStatuses = ['pending', 'active', 'completed', 'missed', 'emergency'];
      
      validStatuses.forEach(status => {
        mockReq.body = { status };
        validateCallStatus(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('should reject invalid statuses', () => {
      mockReq.body = { status: 'invalid' };
      validateCallStatus(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid call status' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateStaffStatus', () => {
    it('should allow valid statuses', () => {
      const validStatuses = ['available', 'on_call', 'busy', 'offline', 'emergency'];
      
      validStatuses.forEach(status => {
        mockReq.body = { status };
        validateStaffStatus(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('should reject invalid statuses', () => {
      mockReq.body = { status: 'invalid' };
      validateStaffStatus(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid staff status' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateDateRange', () => {
    it('should allow valid date ranges', () => {
      mockReq.body = {
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-02T00:00:00Z'
      };
      validateDateRange(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing dates', () => {
      mockReq.body = { startTime: '2024-01-01T00:00:00Z' };
      validateDateRange(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Start and end times are required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid date formats', () => {
      mockReq.body = {
        startTime: 'invalid',
        endTime: '2024-01-02T00:00:00Z'
      };
      validateDateRange(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid date format' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject end date before start date', () => {
      mockReq.body = {
        startTime: '2024-01-02T00:00:00Z',
        endTime: '2024-01-01T00:00:00Z'
      };
      validateDateRange(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Start time must be before end time' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validatePhoneNumber', () => {
    it('should allow valid phone numbers', () => {
      const validNumbers = [
        '+447911123456',
        '+353871234567',
        '+12025550179'
      ];
      
      validNumbers.forEach(phoneNumber => {
        mockReq.body = { phoneNumber };
        validatePhoneNumber(mockReq as Request, mockRes as Response, mockNext);
        expect(mockNext).toHaveBeenCalled();
        mockNext.mockClear();
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidNumbers = [
        'invalid',
        '+44',
        '12345',
        '+44abc123456'
      ];
      
      invalidNumbers.forEach(phoneNumber => {
        mockReq.body = { phoneNumber };
        validatePhoneNumber(mockReq as Request, mockRes as Response, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid phone number format' });
        expect(mockNext).not.toHaveBeenCalled();
        mockRes.status.mockClear();
        mockRes.json.mockClear();
      });
    });
  });

  describe('validateStaffId', () => {
    it('should allow valid staff IDs', () => {
      mockReq.params = { staffId: 'staff-123' };
      validateStaffId(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid staff IDs', () => {
      mockReq.params = { staffId: '' };
      validateStaffId(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid staff ID' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateCallId', () => {
    it('should allow valid call IDs', () => {
      mockReq.params = { callId: 'call-123' };
      validateCallId(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject invalid call IDs', () => {
      mockReq.params = { callId: '' };
      validateCallId(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid call ID' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 