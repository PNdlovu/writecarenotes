/**
 * @writecarenotes.com
 * @fileoverview OnCall Recording Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Route handlers for managing call recordings including storage,
 * retrieval, and compliance requirements. Implements validation
 * and authentication middleware.
 */

import { Router } from 'express';
import { RecordingService } from '../services/RecordingService';
import { authenticateOnCall } from '../middleware/auth';
import {
  validateCallId,
  validateDateRange,
  validateRegion
} from '../middleware/validation';

const router = Router();
const recordingService = new RecordingService();

/**
 * @route GET /api/oncall/recordings
 * @desc Get all recordings with optional filters
 * @access Private
 */
router.get('/',
  authenticateOnCall,
  validateDateRange,
  validateRegion,
  async (req, res) => {
    try {
      const recordings = await recordingService.getRecordings(req.query);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recordings' });
    }
  }
);

/**
 * @route GET /api/oncall/recordings/:recordingId
 * @desc Get specific recording by ID
 * @access Private
 */
router.get('/:recordingId',
  authenticateOnCall,
  async (req, res) => {
    try {
      const recording = await recordingService.getRecordingById(req.params.recordingId);
      if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
      }
      res.json(recording);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch recording' });
    }
  }
);

/**
 * @route GET /api/oncall/recordings/call/:callId
 * @desc Get recordings for specific call
 * @access Private
 */
router.get('/call/:callId',
  authenticateOnCall,
  validateCallId,
  async (req, res) => {
    try {
      const recordings = await recordingService.getCallRecordings(req.params.callId);
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch call recordings' });
    }
  }
);

/**
 * @route POST /api/oncall/recordings/:recordingId/transcribe
 * @desc Generate transcription for recording
 * @access Private
 */
router.post('/:recordingId/transcribe',
  authenticateOnCall,
  async (req, res) => {
    try {
      const transcription = await recordingService.transcribeRecording(req.params.recordingId);
      res.status(201).json(transcription);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate transcription' });
    }
  }
);

/**
 * @route GET /api/oncall/recordings/:recordingId/transcription
 * @desc Get transcription for recording
 * @access Private
 */
router.get('/:recordingId/transcription',
  authenticateOnCall,
  async (req, res) => {
    try {
      const transcription = await recordingService.getTranscription(req.params.recordingId);
      if (!transcription) {
        return res.status(404).json({ error: 'Transcription not found' });
      }
      res.json(transcription);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transcription' });
    }
  }
);

/**
 * @route DELETE /api/oncall/recordings/:recordingId
 * @desc Delete recording (with compliance check)
 * @access Private
 */
router.delete('/:recordingId',
  authenticateOnCall,
  async (req, res) => {
    try {
      await recordingService.deleteRecording(req.params.recordingId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete recording' });
    }
  }
);

/**
 * @route GET /api/oncall/recordings/:recordingId/download
 * @desc Download recording file
 * @access Private
 */
router.get('/:recordingId/download',
  authenticateOnCall,
  async (req, res) => {
    try {
      const { file, metadata } = await recordingService.downloadRecording(req.params.recordingId);
      res.setHeader('Content-Type', metadata.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.filename}"`);
      res.send(file);
    } catch (error) {
      res.status(500).json({ error: 'Failed to download recording' });
    }
  }
);

/**
 * @route POST /api/oncall/recordings/:recordingId/analyze
 * @desc Analyze recording for quality and compliance
 * @access Private
 */
router.post('/:recordingId/analyze',
  authenticateOnCall,
  async (req, res) => {
    try {
      const analysis = await recordingService.analyzeRecording(req.params.recordingId);
      res.status(201).json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze recording' });
    }
  }
);

export default router; 