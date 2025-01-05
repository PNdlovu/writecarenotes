/**
 * @writecarenotes.com
 * @fileoverview OnCall Call Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route handlers for managing calls in the OnCall system including
 * incoming calls, call status updates, call history, and emergency
 * call handling. Implements validation and authentication middleware.
 */

import { Router } from 'express';
import { CallService } from '../services/CallService';
import { RecordingService } from '../services/RecordingService';
import { authenticateOnCall, authenticateEmergency } from '../middleware/auth';
import {
  validateCallId,
  validateCallStatus,
  validateCallPriority,
  validatePhoneNumber,
  validateDateRange
} from '../middleware/validation';

const router = Router();
const callService = new CallService();
const recordingService = new RecordingService();

/**
 * @route POST /api/oncall/calls
 * @desc Create a new incoming call
 * @access Private
 */
router.post('/',
  authenticateOnCall,
  validateCallPriority,
  validatePhoneNumber,
  async (req, res) => {
    try {
      const call = await callService.createCall(req.body);
      res.status(201).json(call);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create call' });
    }
  }
);

/**
 * @route GET /api/oncall/calls
 * @desc Get all calls with optional filters
 * @access Private
 */
router.get('/',
  authenticateOnCall,
  validateDateRange,
  async (req, res) => {
    try {
      const calls = await callService.getCalls(req.query);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch calls' });
    }
  }
);

/**
 * @route GET /api/oncall/calls/:callId
 * @desc Get a specific call by ID
 * @access Private
 */
router.get('/:callId',
  authenticateOnCall,
  validateCallId,
  async (req, res) => {
    try {
      const call = await callService.getCallById(req.params.callId);
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      res.json(call);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch call' });
    }
  }
);

/**
 * @route PUT /api/oncall/calls/:callId/status
 * @desc Update call status
 * @access Private
 */
router.put('/:callId/status',
  authenticateOnCall,
  validateCallId,
  validateCallStatus,
  async (req, res) => {
    try {
      const call = await callService.updateCallStatus(req.params.callId, req.body.status);
      if (!call) {
        return res.status(404).json({ error: 'Call not found' });
      }
      res.json(call);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update call status' });
    }
  }
);

/**
 * @route POST /api/oncall/calls/:callId/recording
 * @desc Start call recording
 * @access Private
 */
router.post('/:callId/recording',
  authenticateOnCall,
  validateCallId,
  async (req, res) => {
    try {
      const recording = await recordingService.startRecording(req.params.callId);
      res.status(201).json(recording);
    } catch (error) {
      res.status(500).json({ error: 'Failed to start recording' });
    }
  }
);

/**
 * @route PUT /api/oncall/calls/:callId/recording
 * @desc Stop call recording
 * @access Private
 */
router.put('/:callId/recording',
  authenticateOnCall,
  validateCallId,
  async (req, res) => {
    try {
      const recording = await recordingService.stopRecording(req.params.callId);
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop recording' });
    }
  }
);

/**
 * @route POST /api/oncall/calls/emergency
 * @desc Create emergency call
 * @access Private
 */
router.post('/emergency',
  authenticateEmergency,
  validatePhoneNumber,
  async (req, res) => {
    try {
      const call = await callService.createEmergencyCall(req.body);
      res.status(201).json(call);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create emergency call' });
    }
  }
);

/**
 * @route GET /api/oncall/calls/:callId/recording
 * @desc Get call recording
 * @access Private
 */
router.get('/:callId/recording',
  authenticateOnCall,
  validateCallId,
  async (req, res) => {
    try {
      const recording = await recordingService.getRecording(req.params.callId);
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recording' });
    }
  }
);

export default router; 