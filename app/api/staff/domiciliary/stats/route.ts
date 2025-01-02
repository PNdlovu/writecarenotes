/**
 * @writecarenotes.com
 * @fileoverview API route for domiciliary staff statistics
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { startOfDay, endOfDay, addDays } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return new NextResponse('Organization ID is required', { status: 400 });
    }

    // Get active staff count
    const activeStaff = await prisma.staff.count({
      where: {
        organizationId,
        isActive: true,
        domiciliaryStaff: {
          isNot: null
        }
      }
    });

    // Get available staff today
    const today = new Date();
    const availableToday = await prisma.staff.count({
      where: {
        organizationId,
        isActive: true,
        domiciliaryStaff: {
          isNot: null
        },
        availability: {
          some: {
            startTime: {
              gte: startOfDay(today)
            },
            endTime: {
              lte: endOfDay(today)
            }
          }
        }
      }
    });

    // Get staff with expiring documents in next 30 days
    const expiringDocuments = await prisma.staff.count({
      where: {
        organizationId,
        isActive: true,
        domiciliaryStaff: {
          isNot: null,
          vehicleDetails: {
            path: ['insurance', 'expiryDate'],
            lte: addDays(today, 30).toISOString()
          }
        }
      }
    });

    return NextResponse.json({
      activeStaff,
      availableToday,
      expiringDocuments
    });
  } catch (error) {
    console.error('Error fetching staff stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 