/**
 * @writecarenotes.com
 * @fileoverview Dashboard API endpoints
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { NextResponse } from 'next/server';
import { validateRequest } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Validate request & auth
    const { user } = await validateRequest(request);
    const careHomeId = user.careHomeId;

    if (!careHomeId) {
      return NextResponse.json(
        { error: 'User is not associated with a care home' },
        { status: 400 }
      );
    }

    // 2. Fetch care home data
    const careHome = await prisma.careHome.findUnique({
      where: { id: careHomeId },
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        phone: true,
        email: true,
        capacity: true,
        organization: {
          select: {
            name: true,
            regulatoryBody: true,
          }
        },
        users: {
          where: { role: { in: ['STAFF', 'NURSE', 'MANAGER'] } },
          select: { id: true, role: true }
        },
        residents: {
          select: { id: true }
        }
      }
    });

    if (!careHome) {
      return NextResponse.json(
        { error: 'Care home not found' },
        { status: 404 }
      );
    }

    // 3. Calculate basic metrics from available data
    const staffCount = careHome.users.length;
    const nurseCount = careHome.users.filter(u => u.role === 'NURSE').length;
    const managerCount = careHome.users.filter(u => u.role === 'MANAGER').length;
    const residentCount = careHome.residents.length;

    // 4. Format response
    const response = {
      careHome: {
        id: careHome.id,
        name: careHome.name,
        type: careHome.type,
        address: careHome.address,
        phone: careHome.phone,
        email: careHome.email,
        capacity: careHome.capacity,
        currentOccupancy: residentCount,
        organization: careHome.organization,
      },
      metrics: {
        bedOccupancy: {
          value: Math.round((residentCount / careHome.capacity) * 100),
          trend: 0,
          occupied: residentCount,
          total: careHome.capacity
        },
        staffing: {
          total: staffCount,
          nurses: nurseCount,
          managers: managerCount,
          trend: 0
        },
        residents: {
          total: residentCount,
          trend: 0
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
