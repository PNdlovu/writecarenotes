/**
 * @fileoverview Bed Management API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { BedManagementService } from './service';

const bedManagementService = new BedManagementService();

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest(request);
    const beds = await bedManagementService.getAllBeds(user.organizationId);
    return NextResponse.json(beds);
  } catch (error) {
    console.error('Error in GET /api/bed-management:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, body } = await validateRequest(request);
    const bed = await bedManagementService.createBed(body, user.organizationId, user.id);
    return NextResponse.json(bed);
  } catch (error) {
    console.error('Error in POST /api/bed-management:', error);
    
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