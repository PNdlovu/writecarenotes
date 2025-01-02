/**
 * @fileoverview Reports API Routes
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { ReportingService } from '@/features/accounting/services';
import { withApiMiddleware, ApiContext } from '../middleware';
import { QueueService } from '@/lib/queue';
import { CacheService } from '@/lib/cache';
import { z } from 'zod';

// Validation schemas
const reportRequestSchema = z.object({
  type: z.enum([
    'REVENUE',
    'PAYMENTS',
    'PRICING',
    'TRANSACTIONS',
    'RECONCILIATION',
    'AUDIT'
  ]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  format: z.enum(['PDF', 'CSV', 'EXCEL']).optional().default('PDF'),
  filters: z.object({
    status: z.string().optional(),
    method: z.string().optional(),
    category: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

const reportScheduleSchema = z.object({
  type: z.enum([
    'REVENUE',
    'PAYMENTS',
    'PRICING',
    'TRANSACTIONS',
    'RECONCILIATION',
    'AUDIT'
  ]),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']),
  format: z.enum(['PDF', 'CSV', 'EXCEL']).optional().default('PDF'),
  recipients: z.array(z.string().email()),
  filters: z.object({
    status: z.string().optional(),
    method: z.string().optional(),
    category: z.string().optional(),
    region: z.string().optional()
  }).optional(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    try {
      const data = await request.json();
      const validatedData = reportRequestSchema.parse(data);

      // Add report generation job to queue
      const queueService = QueueService.getInstance();
      const job = await queueService.addJob(
        'reports',
        validatedData.type,
        {
          ...validatedData,
          id: crypto.randomUUID()
        },
        context.organizationId,
        context.userId
      );

      return NextResponse.json({
        jobId: job.id,
        status: 'pending',
        message: 'Report generation started',
        type: validatedData.type
      }, { status: 202 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  });
}

export async function GET(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific report job status
      const queueService = QueueService.getInstance();
      const status = await queueService.getJobStatus('reports', jobId);

      if (!status) {
        return NextResponse.json(
          { error: 'Report job not found' },
          { status: 404 }
        );
      }

      // Check if the job belongs to the organization
      if (status.data.organizationId !== context.organizationId) {
        return NextResponse.json(
          { error: 'Unauthorized access to report' },
          { status: 403 }
        );
      }

      return NextResponse.json(status);
    }

    // List reports
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');

    const reportingService = ReportingService.getInstance();
    const reports = await reportingService.getReports(
      context.organizationId,
      {
        type: type as any,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status as any
      }
    );

    return NextResponse.json(reports);
  });
}

export async function PUT(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    try {
      const data = await request.json();
      const validatedData = reportScheduleSchema.parse(data);

      // Add report schedule job
      const queueService = QueueService.getInstance();
      const job = await queueService.addJob(
        'reports',
        'SCHEDULE',
        {
          ...validatedData,
          id: crypto.randomUUID()
        },
        context.organizationId,
        context.userId,
        {
          repeat: {
            pattern: getSchedulePattern(validatedData.frequency)
          }
        }
      );

      return NextResponse.json({
        scheduleId: job.id,
        status: 'active',
        message: 'Report schedule created',
        type: validatedData.type,
        frequency: validatedData.frequency
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }
  });
}

export async function DELETE(request: Request) {
  return withApiMiddleware(request, async (context: ApiContext) => {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Report schedule ID is required' },
        { status: 400 }
      );
    }

    const queueService = QueueService.getInstance();
    const queue = queueService.getQueue('reports');
    
    if (queue) {
      const repeatable = await queue.getRepeatableJobs();
      const job = repeatable.find(j => j.id === scheduleId);
      
      if (job) {
        await queue.removeRepeatableByKey(job.key);
        return new NextResponse(null, { status: 204 });
      }
    }

    return NextResponse.json(
      { error: 'Report schedule not found' },
      { status: 404 }
    );
  });
}

function getSchedulePattern(frequency: string): string {
  switch (frequency) {
    case 'DAILY':
      return '0 0 * * *'; // Every day at midnight
    case 'WEEKLY':
      return '0 0 * * 1'; // Every Monday at midnight
    case 'MONTHLY':
      return '0 0 1 * *'; // First day of every month at midnight
    case 'QUARTERLY':
      return '0 0 1 */3 *'; // First day of every quarter at midnight
    default:
      throw new Error(`Invalid frequency: ${frequency}`);
  }
} 