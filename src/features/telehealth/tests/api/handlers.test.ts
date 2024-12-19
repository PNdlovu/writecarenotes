/**
 * @fileoverview Tests for Telehealth API Handlers
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import {
  createConsultationHandler,
  initiateVideoSessionHandler,
  uploadDocumentHandler,
  generateReportHandler,
} from '../../api/handlers';
import { SecurityService } from '../../services/security';
import { EnhancedTelehealth } from '../../services/enhancedTelehealth';
import { VideoConsultationService } from '../../services/videoConsultation';
import { DocumentManagementService } from '../../services/documentManagement';
import { TelehealthAnalytics } from '../../services/analytics';

// Mock services
jest.mock('../../services/security');
jest.mock('../../services/enhancedTelehealth');
jest.mock('../../services/videoConsultation');
jest.mock('../../services/documentManagement');
jest.mock('../../services/analytics');

describe('Telehealth API Handlers', () => {
  let mockReq: Partial<NextApiRequest>;
  let mockRes: Partial<NextApiResponse>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      body: {},
      user: {
        id: 'user-123',
        role: 'CARE_STAFF',
      },
    };

    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  describe('createConsultationHandler', () => {
    const mockConsultationData = {
      careHomeId: 'care-home-123',
      data: {
        residentId: 'resident-123',
        type: 'GP',
        urgency: 'ROUTINE',
        reason: 'Regular checkup',
      },
    };

    it('should create consultation successfully', async () => {
      mockReq.body = mockConsultationData;

      (SecurityService.prototype.validateAccess as jest.Mock).mockResolvedValue(true);
      (EnhancedTelehealth.prototype.facilitateRemoteConsultations as jest.Mock).mockResolvedValue({
        id: 'consultation-123',
        ...mockConsultationData.data,
      });

      await createConsultationHandler(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'consultation-123',
        })
      );
    });

    it('should handle unauthorized access', async () => {
      mockReq.body = mockConsultationData;

      (SecurityService.prototype.validateAccess as jest.Mock).mockRejectedValue(
        new Error('Unauthorized')
      );

      await createConsultationHandler(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });
  });

  describe('initiateVideoSessionHandler', () => {
    const mockSessionData = {
      consultationId: 'consultation-123',
      participants: [
        { id: 'user-123', role: 'GP' },
        { id: 'user-456', role: 'RESIDENT' },
      ],
    };

    it('should initiate video session successfully', async () => {
      mockReq.body = mockSessionData;

      (SecurityService.prototype.validateAccess as jest.Mock).mockResolvedValue(true);
      (VideoConsultationService.prototype.initializeSession as jest.Mock).mockResolvedValue({
        id: 'session-123',
        ...mockSessionData,
      });

      await initiateVideoSessionHandler(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'session-123',
        })
      );
    });
  });

  describe('uploadDocumentHandler', () => {
    const mockDocumentData = {
      consultationId: 'consultation-123',
      residentId: 'resident-123',
      type: 'PRESCRIPTION',
      title: 'Prescription Document',
      content: Buffer.from('test content'),
    };

    it('should upload document successfully', async () => {
      mockReq.body = mockDocumentData;
      mockReq.headers = { 'content-type': 'application/pdf' };

      (SecurityService.prototype.validateAccess as jest.Mock).mockResolvedValue(true);
      (DocumentManagementService.prototype.createDocument as jest.Mock).mockResolvedValue({
        id: 'document-123',
        ...mockDocumentData,
      });

      await uploadDocumentHandler(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'document-123',
        })
      );
    });
  });

  describe('generateReportHandler', () => {
    const mockReportData = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      period: 'MONTHLY',
    };

    it('should generate report successfully', async () => {
      mockReq.body = mockReportData;

      (SecurityService.prototype.validateAccess as jest.Mock).mockResolvedValue(true);
      (TelehealthAnalytics.prototype.generateUsageReport as jest.Mock).mockResolvedValue({
        id: 'report-123',
        ...mockReportData,
      });

      await generateReportHandler(
        mockReq as NextApiRequest,
        mockRes as NextApiResponse
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'report-123',
        })
      );
    });
  });
});


