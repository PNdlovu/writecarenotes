import { Router } from 'express';
import {
  calculatePayrollHandler,
  createPayrollHandler,
  updatePayrollStatusHandler,
  getPayrollByIdHandler,
  getAvailableTaxRegionsHandler,
  getTaxConfigHandler
} from '../handlers/payrollHandlers';
import { webhookHandler } from '../handlers/webhookHandler';
import { 
  healthCheckHandler,
  healthReportHandler
} from '../handlers/healthCheckHandler';
import { retryIntegrationHandler } from '../handlers/retryHandler';

const router = Router();

// Payroll calculation endpoint
router.post('/calculate', calculatePayrollHandler);

// Payroll CRUD operations
router.post('/', createPayrollHandler);
router.get('/:id', getPayrollByIdHandler);
router.patch('/:id/status', updatePayrollStatusHandler);

// Tax configuration endpoints
router.get('/tax/regions', getAvailableTaxRegionsHandler);
router.get('/tax/config', getTaxConfigHandler);

// Integration endpoints
router.post('/webhook', webhookHandler);
router.post('/retry/:integrationId', retryIntegrationHandler);

// Health monitoring endpoints
router.get('/health/:organizationId', healthCheckHandler);
router.get('/health/:organizationId/report', healthReportHandler);

export default router;


