/**
 * @writecarenotes.com
 * @fileoverview OnCall Authentication Middleware
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextFunction, Request, Response } from 'express';
import { getSession } from 'next-auth/react';
import { OnCallStaffService } from '../services/StaffService';

const staffService = OnCallStaffService.getInstance();

export async function requireOnCallAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await getSession({ req });
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify staff member has on-call privileges
    const staff = await staffService.listAvailableOnCallStaff({
      region: req.body.region || 'england',
      qualifications: ['ON_CALL']
    });

    const isOnCallStaff = staff.some(s => s.id === session.user.id);
    if (!isOnCallStaff) {
      res.status(403).json({ error: 'Not authorized for on-call duties' });
      return;
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function requireEmergencyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await getSession({ req });
    if (!session) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if staff member is on emergency duty
    const staff = await staffService.listAvailableOnCallStaff({
      region: req.body.region || 'england',
      qualifications: ['EMERGENCY_RESPONSE']
    });

    const isEmergencyStaff = staff.some(s => s.id === session.user.id);
    if (!isEmergencyStaff) {
      res.status(403).json({ error: 'Not authorized for emergency response' });
      return;
    }

    next();
  } catch (error) {
    console.error('Emergency auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 