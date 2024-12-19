import { Router } from 'express';
import { withAuth } from '@/lib/middleware/auth';
import { withValidation } from '@/lib/middleware/validation';
import {
  getFinancialSummary,
  getResidentFinancial,
  updateResidentFinancial,
  getFinancialSettings,
  updateFinancialSettings,
  processTransaction,
  getTransactions,
  exportFinancialReport
} from '../handlers';
import {
  financialSettingsSchema,
  residentFinancialSchema,
  transactionSchema,
  exportReportSchema
} from '../validation';

const router = Router();

// Financial Summary Routes
router.get(
  '/summary',
  withAuth(['FINANCE_VIEW', 'ADMIN']),
  getFinancialSummary
);

// Resident Financial Routes
router.get(
  '/residents/:residentId',
  withAuth(['FINANCE_VIEW', 'ADMIN']),
  getResidentFinancial
);

router.put(
  '/residents/:residentId',
  withAuth(['FINANCE_EDIT', 'ADMIN']),
  withValidation(residentFinancialSchema),
  updateResidentFinancial
);

// Settings Routes
router.get(
  '/settings',
  withAuth(['FINANCE_VIEW', 'ADMIN']),
  getFinancialSettings
);

router.put(
  '/settings',
  withAuth(['FINANCE_EDIT', 'ADMIN']),
  withValidation(financialSettingsSchema),
  updateFinancialSettings
);

// Transaction Routes
router.post(
  '/transactions',
  withAuth(['FINANCE_EDIT', 'ADMIN']),
  withValidation(transactionSchema),
  processTransaction
);

router.get(
  '/transactions',
  withAuth(['FINANCE_VIEW', 'ADMIN']),
  getTransactions
);

// Export Routes
router.post(
  '/export',
  withAuth(['FINANCE_VIEW', 'ADMIN']),
  withValidation(exportReportSchema),
  exportFinancialReport
);

export default router;


