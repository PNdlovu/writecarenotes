/**
 * @writecarenotes.com
 * @fileoverview API route for domiciliary staff activity feed
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { subDays } from 'date-fns';

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

    // Get activities from the last 7 days
    const activities = await prisma.staffActivity.findMany({
      where: {
        staff: {
          organizationId,
          domiciliaryStaff: {
            isNot: null
          }
        },
        createdAt: {
          gte: subDays(new Date(), 7)
        }
      },
      include: {
        staff: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    // Transform the data for the frontend
    const transformedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      staffId: activity.staffId,
      staffName: `${activity.staff.user.firstName} ${activity.staff.user.lastName}`,
      description: activity.description,
      timestamp: activity.createdAt.toISOString()
    }));

    return NextResponse.json(transformedActivities);
  } catch (error) {
    console.error('Error fetching staff activities:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 