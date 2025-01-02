/**
 * @writecarenotes.com
 * @fileoverview API route for managing individual staff alerts
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { alertId: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { alertId } = params;
    const [alertType, staffId] = alertId.split('-');

    // Verify the staff member exists and belongs to the user's organization
    const staff = await prisma.staff.findFirst({
      where: {
        id: staffId,
        organization: {
          users: {
            some: {
              id: session.user.id
            }
          }
        }
      }
    });

    if (!staff) {
      return new NextResponse('Staff not found', { status: 404 });
    }

    // Record that this alert has been acknowledged
    await prisma.staffAlertAcknowledgment.create({
      data: {
        staffId,
        alertType,
        acknowledgedBy: session.user.id,
        acknowledgedAt: new Date()
      }
    });

    // Create an activity record for the acknowledgment
    await prisma.staffActivity.create({
      data: {
        staffId,
        type: 'ALERT_ACKNOWLEDGED',
        description: `Alert acknowledged: ${alertType}`,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 