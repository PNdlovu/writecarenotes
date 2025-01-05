/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Routes Index
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main routes configuration for the Smart Care Alert system.
 */

import { Router } from 'express';
import alertRoutes from './alert.routes';

const router = Router();

// Mount routes
router.use('/alerts', alertRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router; 