import { Router } from 'express';
import { authenticateUser, requirePermissions } from '@/middleware/auth';
import * as medicationHandlers from '../handlers';

const router = Router();

// Medication Management Routes
router.get('/medications', 
  authenticateUser, 
  requirePermissions(['VIEW_MEDICATIONS']), 
  medicationHandlers.listMedications
);

router.get('/medications/:id', 
  authenticateUser, 
  requirePermissions(['VIEW_MEDICATIONS']), 
  medicationHandlers.getMedication
);

router.post('/medications', 
  authenticateUser, 
  requirePermissions(['MANAGE_MEDICATIONS']), 
  medicationHandlers.createMedication
);

router.put('/medications/:id', 
  authenticateUser, 
  requirePermissions(['MANAGE_MEDICATIONS']), 
  medicationHandlers.updateMedication
);

router.delete('/medications/:id', 
  authenticateUser, 
  requirePermissions(['MANAGE_MEDICATIONS']), 
  medicationHandlers.deleteMedication
);

// Administration Routes
router.get('/medications/:id/administrations', 
  authenticateUser, 
  requirePermissions(['VIEW_ADMINISTRATIONS']), 
  medicationHandlers.listAdministrations
);

router.post('/medications/:id/administrations', 
  authenticateUser, 
  requirePermissions(['ADMINISTER_MEDICATIONS']), 
  medicationHandlers.recordAdministration
);

// Analytics Routes
router.get('/analytics/resident/:residentId', 
  authenticateUser, 
  requirePermissions(['VIEW_ANALYTICS']), 
  medicationHandlers.getResidentAnalytics
);

router.get('/analytics/care-home/:careHomeId', 
  authenticateUser, 
  requirePermissions(['VIEW_ANALYTICS']), 
  medicationHandlers.getCareHomeAnalytics
);

// Safety Routes
router.get('/safety/interactions', 
  authenticateUser, 
  requirePermissions(['VIEW_SAFETY']), 
  medicationHandlers.checkInteractions
);

router.get('/safety/risks/:residentId', 
  authenticateUser, 
  requirePermissions(['VIEW_SAFETY']), 
  medicationHandlers.assessRisks
);

// Stock Management Routes
router.get('/stock', 
  authenticateUser, 
  requirePermissions(['VIEW_STOCK']), 
  medicationHandlers.getStockLevels
);

router.post('/stock/order', 
  authenticateUser, 
  requirePermissions(['MANAGE_STOCK']), 
  medicationHandlers.createStockOrder
);

router.post('/stock/receive', 
  authenticateUser, 
  requirePermissions(['MANAGE_STOCK']), 
  medicationHandlers.receiveStock
);

// Compliance Routes
router.get('/compliance/audit/:careHomeId', 
  authenticateUser, 
  requirePermissions(['VIEW_COMPLIANCE']), 
  medicationHandlers.getComplianceAudit
);

router.get('/compliance/reports/:reportType', 
  authenticateUser, 
  requirePermissions(['VIEW_COMPLIANCE']), 
  medicationHandlers.generateComplianceReport
);

// Documentation Routes
router.get('/documents/:residentId', 
  authenticateUser, 
  requirePermissions(['VIEW_DOCUMENTS']), 
  medicationHandlers.listDocuments
);

router.post('/documents/:residentId', 
  authenticateUser, 
  requirePermissions(['MANAGE_DOCUMENTS']), 
  medicationHandlers.createDocument
);

// PRN Routes
router.get('/prn/:residentId', 
  authenticateUser, 
  requirePermissions(['VIEW_PRN']), 
  medicationHandlers.listPRNMedications
);

router.post('/prn/:residentId/request', 
  authenticateUser, 
  requirePermissions(['MANAGE_PRN']), 
  medicationHandlers.recordPRNRequest
);

export default router;


