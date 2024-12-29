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
      const { id: organizationId, careHomeId } = params;
      const activities = await prisma.activity.findMany({
        where: { 
          organizationId,
          careHomeId
        },
        include: {
          organizer: true,
          participants: true,
          location: true,
        },
      });
      return NextResponse.json(activities);
    })
  )
);

export const POST = withAuth(
  withValidation(ActivitySchema)(
    withOfflineSync(
      withAuditLog(
        withRateLimit(async (req, { params }) => {
          const { id: organizationId, careHomeId } = params;
          const data = await req.json();
          
          const activity = await prisma.activity.create({
            data: {
              ...data,
              organizationId,
              careHomeId,
            },
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
