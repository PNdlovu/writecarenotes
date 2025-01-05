/**
 * @fileoverview Bed waitlist API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { BedManagementService } from '../service';

const bedManagementService = new BedManagementService();

export async function POST(request: NextRequest) {
  try {
    const { user, body } = await validateRequest(request);
    const waitlistEntry = await bedManagementService.createWaitlistEntry(body, user.organizationId, user.id);
    return NextResponse.json(waitlistEntry);
  } catch (error) {
    console.error('Error in POST /api/bed-management/waitlist:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, body } = await validateRequest(request);
    const { id, ...data } = body;
    const waitlistEntry = await bedManagementService.updateWaitlistEntry(id, data, user.organizationId);
    return NextResponse.json(waitlistEntry);
  } catch (error) {
    console.error('Error in PUT /api/bed-management/waitlist:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
