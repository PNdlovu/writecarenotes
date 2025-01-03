/**
 * @writecarenotes.com
 * @fileoverview OnCall Routes Index
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Exports all route handlers for the OnCall module including
 * call management, staff management, scheduling, compliance,
 * and recording functionality.
 */

import { Router } from 'express';
import callRoutes from './call.routes';
import staffRoutes from './staff.routes';
import scheduleRoutes from './schedule.routes';
import complianceRoutes from './compliance.routes';
import recordingRoutes from './recording.routes';

const router = Router();

// Mount all routes
router.use('/calls', callRoutes);
router.use('/staff', staffRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/compliance', complianceRoutes);
router.use('/recordings', recordingRoutes);

export default router; 