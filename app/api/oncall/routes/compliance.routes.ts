/**
 * @writecarenotes.com
 * @fileoverview OnCall Compliance Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route handlers for managing compliance requirements including
 * regional regulations, audit logs, and reporting requirements.
 * Implements validation and authentication middleware.
 */

import { Router } from 'express';
import { ComplianceService } from '../services/ComplianceService';
import { authenticateOnCall } from '../middleware/auth';
import {
  validateRegion,
  validateDateRange,
  validateCallId
} from '../middleware/validation';

const router = Router();
const complianceService = new ComplianceService();

/**
 * @route GET /api/oncall/compliance/requirements
 * @desc Get compliance requirements for a region
 * @access Private
 */
router.get('/requirements',
  authenticateOnCall,
  validateRegion,
  async (req, res) => {
    try {
      const requirements = await complianceService.getRequirements(req.query.region);
      res.json(requirements);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch compliance requirements' });
    }
  }
);

/**
 * @route GET /api/oncall/compliance/audit-log
 * @desc Get audit log entries
 * @access Private
 */
router.get('/audit-log',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const auditLog = await complianceService.getAuditLog(req.query);
      res.json(auditLog);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit log' });
    }
  }
);

/**
 * @route POST /api/oncall/compliance/reports
 * @desc Generate compliance report
 * @access Private
 */
router.post('/reports',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const report = await complianceService.generateReport(req.body);
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate compliance report' });
    }
  }
);

/**
 * @route GET /api/oncall/compliance/reports/:reportId
 * @desc Get specific compliance report
 * @access Private
 */
router.get('/reports/:reportId',
  authenticateOnCall,
  async (req, res) => {
    try {
      const report = await complianceService.getReport(req.params.reportId);
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch compliance report' });
    }
  }
);

/**
 * @route POST /api/oncall/compliance/verify-call
 * @desc Verify call compliance
 * @access Private
 */
router.post('/verify-call',
  authenticateOnCall,
  validateCallId,
  validateRegion,
  async (req, res) => {
    try {
      const verification = await complianceService.verifyCallCompliance(req.body);
      res.json(verification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to verify call compliance' });
    }
  }
);

/**
 * @route GET /api/oncall/compliance/regulations
 * @desc Get regional regulations
 * @access Private
 */
router.get('/regulations',
  authenticateOnCall,
  validateRegion,
  async (req, res) => {
    try {
      const regulations = await complianceService.getRegulations(req.query.region);
      res.json(regulations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch regulations' });
    }
  }
);

/**
 * @route POST /api/oncall/compliance/validate-schedule
 * @desc Validate schedule compliance
 * @access Private
 */
router.post('/validate-schedule',
  authenticateOnCall,
  validateRegion,
  validateDateRange,
  async (req, res) => {
    try {
      const validation = await complianceService.validateScheduleCompliance(req.body);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to validate schedule compliance' });
    }
  }
);

/**
 * @route GET /api/oncall/compliance/metrics
 * @desc Get compliance metrics
 * @access Private
 */
router.get('/metrics',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const metrics = await complianceService.getComplianceMetrics(req.query);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch compliance metrics' });
    }
  }
);

export default router; 