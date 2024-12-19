/**
 * @fileoverview Telehealth API Handlers
 * @version 1.0.0
 * @created 2024-12-14
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { EnhancedTelehealth } from '../../services/enhancedTelehealth';
import { VideoConsultationService } from '../../services/videoConsultation';
import { DocumentManagementService } from '../../services/documentManagement';
import { SecurityService } from '../../services/security';
import { TelehealthAnalytics } from '../../services/analytics';
import { validateRequestBody } from '@/lib/api';
import { TelehealthServiceError } from '../../services/enhancedTelehealth';

const telehealthService = new EnhancedTelehealth();
const videoService = new VideoConsultationService();
const documentService = new DocumentManagementService();
const securityService = new SecurityService();
const analyticsService = new TelehealthAnalytics();

export async function createConsultationHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { careHomeId, data } = validateRequestBody(req.body, [
      'careHomeId',
      'data',
    ]);

    // Validate access
    await securityService.validateAccess(
      req.user.id,
      req.user.role,
      'consultation',
      'create'
    );

    const consultation = await telehealthService.facilitateRemoteConsultations(
      careHomeId,
      data
    );

    return res.status(201).json(consultation);
  } catch (error) {
    handleError(error, res);
  }
}

export async function initiateVideoSessionHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { consultationId, participants } = validateRequestBody(req.body, [
      'consultationId',
      'participants',
    ]);

    await securityService.validateAccess(
      req.user.id,
      req.user.role,
      'video-session',
      'create'
    );

    const session = await videoService.initializeSession(
      consultationId,
      participants
    );

    return res.status(201).json(session);
  } catch (error) {
    handleError(error, res);
  }
}

export async function uploadDocumentHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { consultationId, residentId, type, title, content } = validateRequestBody(
      req.body,
      ['residentId', 'type', 'title', 'content']
    );

    await securityService.validateAccess(
      req.user.id,
      req.user.role,
      'document',
      'create'
    );

    const document = await documentService.createDocument({
      consultationId,
      residentId,
      type,
      title,
      content: Buffer.from(content),
      mimeType: req.headers['content-type'] || 'application/octet-stream',
      createdBy: req.user.id,
    });

    return res.status(201).json(document);
  } catch (error) {
    handleError(error, res);
  }
}

export async function generateReportHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { startDate, endDate, period } = validateRequestBody(req.body, [
      'startDate',
      'endDate',
      'period',
    ]);

    await securityService.validateAccess(
      req.user.id,
      req.user.role,
      'analytics',
      'read'
    );

    const report = await analyticsService.generateUsageReport(
      startDate,
      endDate,
      period
    );

    return res.status(200).json(report);
  } catch (error) {
    handleError(error, res);
  }
}

function handleError(error: any, res: NextApiResponse) {
  console.error('Telehealth API Error:', error);

  if (error instanceof TelehealthServiceError) {
    return res.status(400).json({
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}


