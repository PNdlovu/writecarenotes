/**
 * WriteCareNotes.com
 * @fileoverview Bed Management API Routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { NextResponse } from 'next/server'
import type { BedStatus } from '@/features/bed-management/types'
import { bedManagementService } from '@/features/bed-management/services'

export async function GET() {
  try {
    const beds = await bedManagementService.getAllBeds();
    return NextResponse.json(beds);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch beds' },
      { status: 500 }
    );
  }
} 