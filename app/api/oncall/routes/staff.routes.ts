/**
 * @writecarenotes.com
 * @fileoverview OnCall Staff Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route handlers for managing on-call staff including availability,
 * schedules, assignments, and emergency staff management. Implements
 * validation and authentication middleware.
 */

import { Router } from 'express';
import { StaffService } from '../services/StaffService';
import { authenticateOnCall, authenticateEmergency } from '../middleware/auth';
import {
  validateStaffId,
  validateStaffStatus,
  validateRegion,
  validateDateRange,
  validatePhoneNumber
} from '../middleware/validation';

const router = Router();
const staffService = new StaffService();

/**
 * @route POST /api/oncall/staff
 * @desc Register new on-call staff member
 * @access Private
 */
router.post('/',
  authenticateOnCall,
  validateRegion,
  validatePhoneNumber,
  async (req, res) => {
    try {
      const staff = await staffService.registerStaff(req.body);
      res.status(201).json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Failed to register staff member' });
    }
  }
);

/**
 * @route GET /api/oncall/staff
 * @desc Get all on-call staff with optional filters
 * @access Private
 */
router.get('/',
  authenticateOnCall,
  async (req, res) => {
    try {
      const staff = await staffService.getStaff(req.query);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  }
);

/**
 * @route GET /api/oncall/staff/:staffId
 * @desc Get specific staff member by ID
 * @access Private
 */
router.get('/:staffId',
  authenticateOnCall,
  validateStaffId,
  async (req, res) => {
    try {
      const staff = await staffService.getStaffById(req.params.staffId);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch staff member' });
    }
  }
);

/**
 * @route PUT /api/oncall/staff/:staffId/status
 * @desc Update staff member's status
 * @access Private
 */
router.put('/:staffId/status',
  authenticateOnCall,
  validateStaffId,
  validateStaffStatus,
  async (req, res) => {
    try {
      const staff = await staffService.updateStaffStatus(req.params.staffId, req.body.status);
      if (!staff) {
        return res.status(404).json({ error: 'Staff member not found' });
      }
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update staff status' });
    }
  }
);

/**
 * @route POST /api/oncall/staff/:staffId/schedule
 * @desc Add on-call schedule for staff member
 * @access Private
 */
router.post('/:staffId/schedule',
  authenticateOnCall,
  validateStaffId,
  validateDateRange,
  async (req, res) => {
    try {
      const schedule = await staffService.addSchedule(req.params.staffId, req.body);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to add schedule' });
    }
  }
);

/**
 * @route GET /api/oncall/staff/:staffId/schedule
 * @desc Get staff member's schedule
 * @access Private
 */
router.get('/:staffId/schedule',
  authenticateOnCall,
  validateStaffId,
  validateDateRange,
  async (req, res) => {
    try {
      const schedule = await staffService.getSchedule(req.params.staffId, req.query);
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schedule' });
    }
  }
);

/**
 * @route DELETE /api/oncall/staff/:staffId/schedule/:scheduleId
 * @desc Remove specific schedule
 * @access Private
 */
router.delete('/:staffId/schedule/:scheduleId',
  authenticateOnCall,
  validateStaffId,
  async (req, res) => {
    try {
      await staffService.removeSchedule(req.params.staffId, req.params.scheduleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove schedule' });
    }
  }
);

/**
 * @route GET /api/oncall/staff/available
 * @desc Get currently available staff
 * @access Private
 */
router.get('/available',
  authenticateOnCall,
  validateRegion,
  async (req, res) => {
    try {
      const staff = await staffService.getAvailableStaff(req.query.region);
      res.json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch available staff' });
    }
  }
);

/**
 * @route POST /api/oncall/staff/emergency
 * @desc Register emergency staff member
 * @access Private
 */
router.post('/emergency',
  authenticateEmergency,
  validateRegion,
  validatePhoneNumber,
  async (req, res) => {
    try {
      const staff = await staffService.registerEmergencyStaff(req.body);
      res.status(201).json(staff);
    } catch (error) {
      res.status(500).json({ error: 'Failed to register emergency staff' });
    }
  }
);

export default router; 