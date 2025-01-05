/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for the Smart Care Alert system, handling alerts, staff assignments,
 * and compliance across all supported regions.
 */

import { Router } from 'express';
import alertRoutes from './routes/alert.routes';
import staffRoutes from './routes/staff.routes';
import complianceRoutes from './routes/compliance.routes';
import analyticsRoutes from './routes/analytics.routes';

const router = Router();

// Mount feature routes
router.use('/alerts', alertRoutes);
router.use('/staff', staffRoutes);
router.use('/compliance', complianceRoutes);
router.use('/analytics', analyticsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router; 