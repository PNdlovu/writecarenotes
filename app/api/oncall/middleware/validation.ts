/**
 * @writecarenotes.com
 * @fileoverview OnCall Validation Middleware
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Middleware functions for validating OnCall module requests including
 * regions, call priorities, statuses, date ranges, and identifiers.
 * Ensures data integrity and compliance with system requirements.
 */

import { Request, Response, NextFunction } from 'express';
import { isValid, parseISO } from 'date-fns';

// Valid regions across UK and Ireland
const VALID_REGIONS = ['england', 'wales', 'scotland', 'northern_ireland', 'ireland'];

// Valid call priorities from lowest to highest
const VALID_CALL_PRIORITIES = ['low', 'normal', 'high', 'emergency'];

// Valid call statuses for tracking call lifecycle
const VALID_CALL_STATUSES = ['pending', 'active', 'completed', 'missed', 'emergency'];

// Valid staff statuses for availability tracking
const VALID_STAFF_STATUSES = ['available', 'on_call', 'busy', 'offline', 'emergency'];

// Phone number regex for UK, Ireland, and international numbers
const PHONE_NUMBER_REGEX = /^\+(?:44|353|1)[0-9]{10,12}$/;

/**
 * Validates region code against supported regions
 */
export const validateRegion = (req: Request, res: Response, next: NextFunction): void => {
  const { region } = req.body;
  
  if (!region || !VALID_REGIONS.includes(region.toLowerCase())) {
    res.status(400).json({ error: 'Invalid region' });
    return;
  }
  
  next();
};

/**
 * Validates call priority level
 */
export const validateCallPriority = (req: Request, res: Response, next: NextFunction): void => {
  const { priority } = req.body;
  
  if (!priority || !VALID_CALL_PRIORITIES.includes(priority.toLowerCase())) {
    res.status(400).json({ error: 'Invalid call priority' });
    return;
  }
  
  next();
};

/**
 * Validates call status
 */
export const validateCallStatus = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;
  
  if (!status || !VALID_CALL_STATUSES.includes(status.toLowerCase())) {
    res.status(400).json({ error: 'Invalid call status' });
    return;
  }
  
  next();
};

/**
 * Validates staff status
 */
export const validateStaffStatus = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;
  
  if (!status || !VALID_STAFF_STATUSES.includes(status.toLowerCase())) {
    res.status(400).json({ error: 'Invalid staff status' });
    return;
  }
  
  next();
};

/**
 * Validates date range for schedules and reports
 */
export const validateDateRange = (req: Request, res: Response, next: NextFunction): void => {
  const { startTime, endTime } = req.body;
  
  if (!startTime || !endTime) {
    res.status(400).json({ error: 'Start and end times are required' });
    return;
  }
  
  const parsedStartTime = parseISO(startTime);
  const parsedEndTime = parseISO(endTime);
  
  if (!isValid(parsedStartTime) || !isValid(parsedEndTime)) {
    res.status(400).json({ error: 'Invalid date format' });
    return;
  }
  
  if (parsedStartTime >= parsedEndTime) {
    res.status(400).json({ error: 'Start time must be before end time' });
    return;
  }
  
  next();
};

/**
 * Validates phone number format
 */
export const validatePhoneNumber = (req: Request, res: Response, next: NextFunction): void => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber || !PHONE_NUMBER_REGEX.test(phoneNumber)) {
    res.status(400).json({ error: 'Invalid phone number format' });
    return;
  }
  
  next();
};

/**
 * Validates staff ID format
 */
export const validateStaffId = (req: Request, res: Response, next: NextFunction): void => {
  const { staffId } = req.params;
  
  if (!staffId || typeof staffId !== 'string' || staffId.trim().length === 0) {
    res.status(400).json({ error: 'Invalid staff ID' });
    return;
  }
  
  next();
};

/**
 * Validates call ID format
 */
export const validateCallId = (req: Request, res: Response, next: NextFunction): void => {
  const { callId } = req.params;
  
  if (!callId || typeof callId !== 'string' || callId.trim().length === 0) {
    res.status(400).json({ error: 'Invalid call ID' });
    return;
  }
  
  next();
}; 