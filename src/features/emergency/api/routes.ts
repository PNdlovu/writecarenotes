/**
 * WriteCareNotes.com
 * @fileoverview Emergency API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Router } from 'express';
import { 
  createIncident,
  updateIncident,
  getIncident,
  listIncidents,
  recordAction,
  createProtocol,
  getProtocols,
  createReport,
  updateReportStatus,
  getEmergencyAccessHistory
} from './handlers';
import { validateRequest, requireAuth, requireRole } from '@/middleware';
import { 
  createIncidentSchema,
  updateIncidentSchema,
  recordActionSchema,
  createProtocolSchema,
  createReportSchema,
  updateReportStatusSchema
} from './validation';

const router = Router();

// Incident routes
router.post(
  '/incidents',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE']),
  validateRequest(createIncidentSchema),
  createIncident
);

router.patch(
  '/incidents/:id',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE']),
  validateRequest(updateIncidentSchema),
  updateIncident
);

router.get(
  '/incidents/:id',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE', 'CARER']),
  getIncident
);

router.get(
  '/incidents',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE', 'CARER']),
  listIncidents
);

// Action routes
router.post(
  '/incidents/:id/actions',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE', 'CARER']),
  validateRequest(recordActionSchema),
  recordAction
);

// Protocol routes
router.post(
  '/protocols',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest(createProtocolSchema),
  createProtocol
);

router.get(
  '/protocols',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE', 'CARER']),
  getProtocols
);

// Report routes
router.post(
  '/reports',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER', 'NURSE']),
  validateRequest(createReportSchema),
  createReport
);

router.patch(
  '/reports/:id/status',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER']),
  validateRequest(updateReportStatusSchema),
  updateReportStatus
);

// Access history routes
router.get(
  '/access',
  requireAuth,
  requireRole(['ADMIN', 'MANAGER']),
  getEmergencyAccessHistory
);

export { router as emergencyRoutes }; 