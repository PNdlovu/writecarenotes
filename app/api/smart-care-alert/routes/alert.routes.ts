/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Routes - Alert Management
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route definitions for alert management in the Smart Care Alert system.
 */

import { Router, Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { requireAuth } from '../middleware/auth';
import { checkRegionalCompliance } from '../middleware/compliance';
import AlertService from '../services/AlertService';
import { APIError } from '../types';

const router = Router();
const alertService = AlertService.getInstance();

// Create Alert
router.post(
    '/',
    validateRequest,
    checkRegionalCompliance,
    async (req: Request, res: Response) => {
        try {
            const alert = await alertService.createAlert(req.body);
            return res.status(201).json(alert);
        } catch (error) {
            const apiError: APIError = {
                code: 'ALERT_CREATION_FAILED',
                message: error.message || 'Failed to create alert',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] as string,
                region: req.body.region
            };
            return res.status(500).json(apiError);
        }
    }
);

// Update Alert
router.put(
    '/:alertId',
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const alert = await alertService.updateAlert(req.params.alertId, req.body);
            return res.status(200).json(alert);
        } catch (error) {
            const apiError: APIError = {
                code: 'ALERT_UPDATE_FAILED',
                message: error.message || 'Failed to update alert',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] as string
            };
            return res.status(500).json(apiError);
        }
    }
);

// Get Alert Details
router.get(
    '/:alertId',
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const alert = await alertService.getAlertDetails(req.params.alertId);
            return res.status(200).json(alert);
        } catch (error) {
            const apiError: APIError = {
                code: 'ALERT_RETRIEVAL_FAILED',
                message: error.message || 'Failed to retrieve alert details',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] as string
            };
            return res.status(500).json(apiError);
        }
    }
);

// List Alerts
router.get(
    '/',
    requireAuth,
    async (req: Request, res: Response) => {
        try {
            const { region, status, startDate, endDate, page, pageSize } = req.query;
            const alerts = await alertService.listAlerts({
                region: region as string,
                status: status as string[],
                startDate: startDate as string,
                endDate: endDate as string,
                page: parseInt(page as string),
                pageSize: parseInt(pageSize as string)
            });
            return res.status(200).json(alerts);
        } catch (error) {
            const apiError: APIError = {
                code: 'ALERT_LIST_FAILED',
                message: error.message || 'Failed to list alerts',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] as string
            };
            return res.status(500).json(apiError);
        }
    }
);

// Respond to Alert
router.post(
    '/:alertId/respond',
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const alert = await alertService.respondToAlert(
                req.params.alertId,
                req.user?.id // Assuming user info is attached to request
            );
            return res.status(200).json(alert);
        } catch (error) {
            const apiError: APIError = {
                code: 'ALERT_RESPONSE_FAILED',
                message: error.message || 'Failed to respond to alert',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] as string
            };
            return res.status(500).json(apiError);
        }
    }
);

// Escalate Alert
router.post(
    '/:alertId/escalate',
    requireAuth,
    validateRequest,
    async (req: Request, res: Response) => {
        try {
            const alert = await alertService.escalateAlert(
                req.params.alertId,
                req.body
            );
            return res.status(200).json(alert);
        } catch (error) {
            const apiError: APIError = {
                code: 'ALERT_ESCALATION_FAILED',
                message: error.message || 'Failed to escalate alert',
                timestamp: new Date().toISOString(),
                requestId: req.headers['x-request-id'] as string
            };
            return res.status(500).json(apiError);
        }
    }
);

export default router; 