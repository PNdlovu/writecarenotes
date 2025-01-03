/**
 * @writecarenotes.com
 * @fileoverview OnCall Schedule Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route handlers for managing on-call schedules including shifts,
 * rotations, and emergency coverage. Implements validation and
 * authentication middleware.
 */

import { Router } from 'express';
import { ScheduleService } from '../services/ScheduleService';
import { authenticateOnCall } from '../middleware/auth';
import {
  validateDateRange,
  validateRegion,
  validateStaffId
} from '../middleware/validation';

const router = Router();
const scheduleService = new ScheduleService();

/**
 * @route POST /api/oncall/schedules
 * @desc Create new schedule
 * @access Private
 */
router.post('/',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const schedule = await scheduleService.createSchedule(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schedule' });
    }
  }
);

/**
 * @route GET /api/oncall/schedules
 * @desc Get all schedules with optional filters
 * @access Private
 */
router.get('/',
  authenticateOnCall,
  validateDateRange,
  async (req, res) => {
    try {
      const schedules = await scheduleService.getSchedules(req.query);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedules' });
    }
  }
);

/**
 * @route GET /api/oncall/schedules/current
 * @desc Get current active schedule
 * @access Private
 */
router.get('/current',
  authenticateOnCall,
  validateRegion,
  async (req, res) => {
    try {
      const schedule = await scheduleService.getCurrentSchedule(req.query.region);
      if (!schedule) {
        return res.status(404).json({ error: 'No active schedule found' });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch current schedule' });
    }
  }
);

/**
 * @route POST /api/oncall/schedules/rotation
 * @desc Create new rotation schedule
 * @access Private
 */
router.post('/rotation',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const rotation = await scheduleService.createRotation(req.body);
      res.status(201).json(rotation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create rotation' });
    }
  }
);

/**
 * @route GET /api/oncall/schedules/rotation/:rotationId
 * @desc Get specific rotation schedule
 * @access Private
 */
router.get('/rotation/:rotationId',
  authenticateOnCall,
  async (req, res) => {
    try {
      const rotation = await scheduleService.getRotation(req.params.rotationId);
      if (!rotation) {
        return res.status(404).json({ error: 'Rotation not found' });
      }
      res.json(rotation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rotation' });
    }
  }
);

/**
 * @route PUT /api/oncall/schedules/rotation/:rotationId
 * @desc Update rotation schedule
 * @access Private
 */
router.put('/rotation/:rotationId',
  authenticateOnCall,
  validateDateRange,
  async (req, res) => {
    try {
      const rotation = await scheduleService.updateRotation(req.params.rotationId, req.body);
      if (!rotation) {
        return res.status(404).json({ error: 'Rotation not found' });
      }
      res.json(rotation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update rotation' });
    }
  }
);

/**
 * @route POST /api/oncall/schedules/coverage
 * @desc Add emergency coverage schedule
 * @access Private
 */
router.post('/coverage',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  validateStaffId,
  async (req, res) => {
    try {
      const coverage = await scheduleService.addEmergencyCoverage(req.body);
      res.status(201).json(coverage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add emergency coverage' });
    }
  }
);

/**
 * @route GET /api/oncall/schedules/coverage
 * @desc Get emergency coverage schedule
 * @access Private
 */
router.get('/coverage',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const coverage = await scheduleService.getEmergencyCoverage(req.query);
      res.json(coverage);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch emergency coverage' });
    }
  }
);

/**
 * @route DELETE /api/oncall/schedules/:scheduleId
 * @desc Delete specific schedule
 * @access Private
 */
router.delete('/:scheduleId',
  authenticateOnCall,
  async (req, res) => {
    try {
      await scheduleService.deleteSchedule(req.params.scheduleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schedule' });
    }
  }
);

export default router; 