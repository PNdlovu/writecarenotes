import { NextResponse } from 'next/server';
import { withAuth } from '~/app/lib/auth';
import { withRegionalRouting } from '~/app/lib/regional';
import { withRateLimit } from '~/app/lib/rate-limit';
import { prisma } from '~/app/lib/prisma';
import { logger } from '~/app/lib/logger';
import { z } from 'zod';
import { ActivityStatsSchema } from '@/features/activities/schemas';
import { ActivityCategory, ActivityStatus } from '@/features/activities/types';
import { getRegionalConfig } from '@/lib/regional/config';
import { formatDateForRegion, formatNumberForRegion } from '@/lib/regional/format';
import { activityTelemetry } from '@/features/activities/monitoring/telemetry';
import { createComplianceChecker } from '@/features/activities/compliance/checker';
import { activityAuditLogger } from '@/features/activities/audit/logger';

const ParamsSchema = z.object({
  id: z.string().uuid(),
  careHomeId: z.string().uuid(),
});

const QuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.nativeEnum(ActivityCategory).optional(),
  timezone: z.string().optional()
}).refine(
  data => !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
  'Start date must be before or equal to end date'
);

export const GET = withAuth(
  withRegionalRouting(
    withRateLimit(async (req, { params, region, user }) => {
      return activityTelemetry.startSpan('analytics_api', async (span) => {
        try {
          // Validate URL parameters
          const validatedParams = ParamsSchema.parse(params);
          const { id: organizationId, careHomeId } = validatedParams;

          // Parse and validate query parameters
          const url = new URL(req.url);
          const queryParams = Object.fromEntries(url.searchParams);
          const validatedQuery = QuerySchema.parse(queryParams);

          // Get regional configuration and compliance checker
          const regionalConfig = await getRegionalConfig(region);
          const complianceChecker = await createComplianceChecker(region);
          const timezone = validatedQuery.timezone ?? regionalConfig.defaultTimezone;

          span.setAttributes({
            organizationId,
            careHomeId,
            region,
            timezone
          });

          // Build base where clause with timezone-aware dates
          const whereClause = {
            organizationId,
            careHomeId,
            ...(validatedQuery.startDate && {
              startTime: { 
                gte: new Date(validatedQuery.startDate) 
              }
            }),
            ...(validatedQuery.endDate && {
              endTime: { 
                lte: new Date(validatedQuery.endDate) 
              }
            }),
            ...(validatedQuery.category && {
              category: validatedQuery.category
            })
          };

          // Execute all queries in parallel
          const [
            activities,
            totalActivities,
            completedActivities,
            inProgressActivities,
            scheduledActivities,
            cancelledActivities,
            participantStats,
            categoryStats,
            durationStats
          ] = await Promise.all([
            prisma.activity.findMany({
              where: whereClause,
              include: { participants: true }
            }),
            prisma.activity.count({
              where: whereClause
            }),
            prisma.activity.count({
              where: { ...whereClause, status: ActivityStatus.COMPLETED }
            }),
            prisma.activity.count({
              where: { ...whereClause, status: ActivityStatus.IN_PROGRESS }
            }),
            prisma.activity.count({
              where: { ...whereClause, status: ActivityStatus.SCHEDULED }
            }),
            prisma.activity.count({
              where: { ...whereClause, status: ActivityStatus.CANCELLED }
            }),
            prisma.activityParticipant.groupBy({
              by: ['activityId'],
              where: { activity: whereClause },
              _count: true
            }),
            prisma.activity.groupBy({
              by: ['category'],
              where: whereClause,
              _count: true
            }),
            prisma.activity.aggregate({
              where: { ...whereClause, status: ActivityStatus.COMPLETED },
              _avg: {
                durationMinutes: true
              }
            })
          ]);

          // Check compliance for all activities
          const complianceResults = await Promise.all(
            activities.map(activity => complianceChecker.checkActivity(activity))
          );

          // Log compliance violations
          for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            const result = complianceResults[i];
            
            if (!result.passed) {
              await activityAuditLogger.logComplianceViolation(
                activity,
                user.id,
                {
                  code: 'MULTIPLE_VIOLATIONS',
                  message: 'Multiple compliance violations found',
                  details: { violations: result.violations }
                }
              );
            }
          }

          // Calculate derived statistics
          const totalParticipants = participantStats.reduce((sum, stat) => sum + stat._count, 0);
          const completionRate = totalActivities > 0 
            ? (completedActivities / totalActivities) * 100 
            : 0;

          // Format category stats with regional number formatting
          const byCategoryStats = Object.fromEntries(
            categoryStats.map(stat => [
              stat.category,
              formatNumberForRegion(stat._count, region)
            ])
          );

          // Construct and validate response with regional formatting
          const stats = ActivityStatsSchema.parse({
            total: formatNumberForRegion(totalActivities, region),
            completed: formatNumberForRegion(completedActivities, region),
            inProgress: formatNumberForRegion(inProgressActivities, region),
            scheduled: formatNumberForRegion(scheduledActivities, region),
            cancelled: formatNumberForRegion(cancelledActivities, region),
            participantCount: formatNumberForRegion(totalParticipants, region),
            byCategory: byCategoryStats,
            averageDuration: formatNumberForRegion(durationStats._avg.durationMinutes || 0, region),
            completionRate: formatNumberForRegion(Math.round(completionRate * 100) / 100, region),
            complianceRate: formatNumberForRegion(
              (complianceResults.filter(r => r.passed).length / activities.length) * 100,
              region
            )
          });

          // Record telemetry
          activityTelemetry.recordActivityOperation(
            organizationId,
            careHomeId,
            'analytics',
            'completed'
          );

          // Log audit event
          await activityAuditLogger.logActivityEvent({
            action: 'ANALYTICS_RETRIEVED',
            activityId: 'N/A',
            organizationId,
            careHomeId,
            userId: user.id,
            details: {
              queryParams: validatedQuery,
              resultCount: activities.length
            },
            timestamp: new Date()
          });

          // Set cache headers
          const headers = new Headers({
            'Cache-Control': 'public, max-age=300',
            'Content-Language': regionalConfig.language,
            'Vary': 'Accept-Language'
          });

          return NextResponse.json(stats, { 
            status: 200,
            headers 
          });

        } catch (error) {
          span.setStatus({
            code: error instanceof z.ZodError ? 'error' : 'error',
            message: error instanceof Error ? error.message : 'Unknown error'
          });

          logger.error('Analytics API Error:', { error, params });

          if (error instanceof z.ZodError) {
            return NextResponse.json(
              { error: 'Invalid request parameters', details: error.errors },
              { status: 400 }
            );
          }

          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          );
        }
      });
    })
  )
);
