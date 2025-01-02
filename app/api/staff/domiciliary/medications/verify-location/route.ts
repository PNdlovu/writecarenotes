/**
 * @writecarenotes.com
 * @fileoverview Location verification API for domiciliary medication administration
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * API route for verifying staff location before medication administration in domiciliary care.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '../../../utils/locationUtils'
import { SyncStatus } from '@prisma/client'

/**
 * POST /api/staff/domiciliary/medications/verify-location
 * Verify staff location before medication administration
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { scheduleId, location } = await req.json()

    if (!scheduleId || !location) {
      return NextResponse.json(
        { error: 'scheduleId and location are required' },
        { status: 400 }
      )
    }

    const schedule = await prisma.medicationSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        client: {
          select: {
            location: true
          }
        }
      }
    })

    if (!schedule || !schedule.client.location) {
      throw new Error('Invalid schedule or missing client location')
    }

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      schedule.client.location.latitude,
      schedule.client.location.longitude
    )

    const MAX_DISTANCE_METERS = 100
    if (distance > MAX_DISTANCE_METERS) {
      throw new Error('Location verification failed')
    }

    // Record the verification
    const verification = await prisma.locationVerification.create({
      data: {
        scheduleId,
        verifiedLocation: location,
        distance,
        verified: true,
        verifiedAt: new Date()
      }
    })

    return NextResponse.json({ success: true, verification })
  } catch (error) {
    console.error('Error in POST /api/staff/domiciliary/medications/verify-location:', error)
    
    if (error instanceof Error && error.message === 'Location verification failed') {
      return NextResponse.json(
        { error: 'Location verification failed. Please ensure you are at the client\'s location.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 