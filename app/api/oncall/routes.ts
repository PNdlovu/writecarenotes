/**
 * @writecarenotes.com
 * @fileoverview On-Call Phone System API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API routes for the On-Call Phone System, handling call management,
 * staff scheduling, and compliance across all supported regions.
 */

import { Router } from 'express';
import callRoutes from './routes/call.routes';
import scheduleRoutes from './routes/schedule.routes';
import recordingRoutes from './routes/recording.routes';
import complianceRoutes from './routes/compliance.routes';
import staffRoutes from './routes/staff.routes';

const router = Router();

// Mount feature routes
router.use('/calls', callRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/recordings', recordingRoutes);
router.use('/compliance', complianceRoutes);
router.use('/staff', staffRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router; 