/**
 * @writecarenotes.com
 * @fileoverview API route for domiciliary staff alerts
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { addDays, isAfter, isBefore, startOfDay } from 'date-fns';

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

    const today = new Date();
    const alerts: any[] = [];

    // Get staff with expiring vehicle documents
    const staffWithExpiringDocs = await prisma.staff.findMany({
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
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        domiciliaryStaff: true
      }
    });

    // Create alerts for expiring documents
    for (const staff of staffWithExpiringDocs) {
      const expiryDate = new Date(staff.domiciliaryStaff!.vehicleDetails.insurance.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      alerts.push({
        id: `vehicle-${staff.id}`,
        type: daysUntilExpiry <= 7 ? 'ERROR' : 'WARNING',
        title: 'Vehicle Insurance Expiring',
        description: `${staff.user.firstName} ${staff.user.lastName}'s vehicle insurance expires in ${daysUntilExpiry} days`,
        timestamp: today.toISOString(),
        isRead: false,
        priority: daysUntilExpiry <= 7 ? 'HIGH' : 'MEDIUM',
        category: 'VEHICLE'
      });
    }

    // Get staff with incomplete availability
    const staffWithoutAvailability = await prisma.staff.findMany({
      where: {
        organizationId,
        isActive: true,
        domiciliaryStaff: {
          isNot: null
        },
        availability: {
          none: {
            startTime: {
              gte: startOfDay(today)
            }
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create alerts for missing availability
    for (const staff of staffWithoutAvailability) {
      alerts.push({
        id: `availability-${staff.id}`,
        type: 'WARNING',
        title: 'Missing Availability',
        description: `${staff.user.firstName} ${staff.user.lastName} has not set their availability for the upcoming period`,
        timestamp: today.toISOString(),
        isRead: false,
        priority: 'MEDIUM',
        category: 'AVAILABILITY'
      });
    }

    // Get staff with incomplete compliance documents
    const staffWithIncompleteCompliance = await prisma.staff.findMany({
      where: {
        organizationId,
        isActive: true,
        domiciliaryStaff: {
          isNot: null
        },
        OR: [
          {
            documents: {
              none: {
                type: 'DBS_CHECK'
              }
            }
          },
          {
            documents: {
              none: {
                type: 'TRAINING_CERTIFICATE'
              }
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Create alerts for compliance issues
    for (const staff of staffWithIncompleteCompliance) {
      alerts.push({
        id: `compliance-${staff.id}`,
        type: 'ERROR',
        title: 'Missing Compliance Documents',
        description: `${staff.user.firstName} ${staff.user.lastName} is missing required compliance documents`,
        timestamp: today.toISOString(),
        isRead: false,
        priority: 'HIGH',
        category: 'COMPLIANCE'
      });
    }

    // Sort alerts by priority and timestamp
    alerts.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching staff alerts:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
