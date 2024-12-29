import { NextResponse } from 'next/server';
import { withAuth } from '~/app/lib/auth';
import { withRegionalRouting } from '~/app/lib/regional';
import { withRateLimit } from '~/app/lib/rate-limit';
import { prisma } from '~/app/lib/prisma';

export const GET = withAuth(
  withRegionalRouting(
    withRateLimit(async (req, { params }) => {
      const { id: organizationId, careHomeId } = params;
      
      const [
        totalActivities,
        completedActivities,
        upcomingActivities,
        participantStats
      ] = await Promise.all([
        prisma.activity.count({
          where: { organizationId, careHomeId }
        }),
        prisma.activity.count({
          where: { 
            organizationId, 
            careHomeId,
            status: 'COMPLETED'
          }
        }),
        prisma.activity.findMany({
          where: {
            organizationId,
            careHomeId,
            startTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          },
          take: 5
        }),
        prisma.activity.groupBy({
          by: ['type'],
          where: { organizationId, careHomeId },
          _count: true
        })
      ]);

      return NextResponse.json({
        total: totalActivities,
        completed: completedActivities,
        upcoming: upcomingActivities,
        byType: participantStats,
      });
    })
  )
);
