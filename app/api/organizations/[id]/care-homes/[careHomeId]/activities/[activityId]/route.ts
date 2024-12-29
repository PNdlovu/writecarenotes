import { NextResponse } from 'next/server';
import { withAuth } from '~/lib/auth';
import { withValidation } from '~/lib/validation';
import { prisma } from '~/lib/prisma';
import { ActivitySchema } from '~/features/activities/schemas';
import { withOfflineSync } from '~/lib/offline';
import { withRegionalRouting } from '~/lib/regional';
import { withAuditLog } from '~/lib/audit';
import { withRateLimit } from '~/lib/rate-limit';

export const GET = withAuth(
  withRegionalRouting(
    withRateLimit(async (req, { params }) => {
      const { id: organizationId, careHomeId, activityId } = params;
      
      const activity = await prisma.activity.findUnique({
        where: { 
          id: activityId,
          organizationId,
          careHomeId
        },
        include: {
          organizer: true,
          participants: true,
          location: true,
        },
      });

      if (!activity) {
        return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
      }

      return NextResponse.json(activity);
    })
  )
);

export const PATCH = withAuth(
  withValidation(ActivitySchema)(
    withOfflineSync(
      withAuditLog(
        withRateLimit(async (req, { params }) => {
          const { id: organizationId, careHomeId, activityId } = params;
          const data = await req.json();
          
          const activity = await prisma.activity.update({
            where: { 
              id: activityId,
              organizationId,
              careHomeId
            },
            data,
            include: {
              organizer: true,
              participants: true,
              location: true,
            },
          });
          
          return NextResponse.json(activity);
        })
      )
    )
  )
);

export const DELETE = withAuth(
  withAuditLog(
    withRateLimit(async (req, { params }) => {
      const { id: organizationId, careHomeId, activityId } = params;
      
      await prisma.activity.delete({
        where: { 
          id: activityId,
          organizationId,
          careHomeId
        },
      });
      
      return NextResponse.json({ success: true });
    })
  )
);
