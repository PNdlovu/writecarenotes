/**
 * @fileoverview API Monitoring Middleware
 * @version 1.0.0
 * @created 2024-03-21
 */

import { NextResponse } from 'next/server';
import { monitoring, METRIC_TYPES } from '../monitoring';
import { logger } from '../logger';

export async function withMonitoring(
  request: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // Execute the handler
    const response = await handler();
    const duration = Date.now() - startTime;

    // Record API metrics
    await monitoring.recordAPIMetrics(
      path,
      method,
      response.status,
      duration
    );

    // Record specific metrics based on the endpoint
    await recordEndpointSpecificMetrics(path, method, response);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Record error metrics
    await monitoring.recordAPIMetrics(
      path,
      method,
      500,
      duration
    );

    logger.error('API Error', { path, method, error, duration });
    throw error;
  }
}

async function recordEndpointSpecificMetrics(
  path: string,
  method: string,
  response: NextResponse
): Promise<void> {
  const pathParts = path.split('/').filter(Boolean);
  if (pathParts.length < 2) return;

  const module = pathParts[1]; // e.g., 'residents', 'staff', 'medications'
  const action = pathParts[2]; // e.g., 'create', 'update', 'delete'

  // Record module-specific metrics
  switch (module) {
    case 'residents':
      await recordResidentMetrics(action, method, response);
      break;
    case 'staff':
      await recordStaffMetrics(action, method, response);
      break;
    case 'medications':
      await recordMedicationMetrics(action, method, response);
      break;
    case 'care-plans':
      await recordCarePlanMetrics(action, method, response);
      break;
    case 'incidents':
      await recordIncidentMetrics(action, method, response);
      break;
  }
}

async function recordResidentMetrics(
  action: string,
  method: string,
  response: NextResponse
): Promise<void> {
  const tags = { action, method };

  switch (action) {
    case 'admission':
      await monitoring.recordMetric('residents.admissions', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'discharge':
      await monitoring.recordMetric('residents.discharges', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'assessment':
      await monitoring.recordMetric('residents.assessments', 1, {
        type: 'counter',
        tags
      });
      break;
  }
}

async function recordStaffMetrics(
  action: string,
  method: string,
  response: NextResponse
): Promise<void> {
  const tags = { action, method };

  switch (action) {
    case 'shift':
      await monitoring.recordMetric('staff.shifts', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'training':
      await monitoring.recordMetric('staff.training', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'incident':
      await monitoring.recordMetric('staff.incidents', 1, {
        type: 'counter',
        tags
      });
      break;
  }
}

async function recordMedicationMetrics(
  action: string,
  method: string,
  response: NextResponse
): Promise<void> {
  const tags = { action, method };

  switch (action) {
    case 'administration':
      await monitoring.recordMetric('medications.administered', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'missed':
      await monitoring.recordMetric('medications.missed', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'stock':
      await monitoring.recordMetric('medications.stock.level', 1, {
        type: 'gauge',
        tags
      });
      break;
  }
}

async function recordCarePlanMetrics(
  action: string,
  method: string,
  response: NextResponse
): Promise<void> {
  const tags = { action, method };

  switch (action) {
    case 'review':
      await monitoring.recordMetric('care_plans.reviews', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'update':
      await monitoring.recordMetric('care_plans.updates', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'assessment':
      await monitoring.recordMetric('care_plans.assessments', 1, {
        type: 'counter',
        tags
      });
      break;
  }
}

async function recordIncidentMetrics(
  action: string,
  method: string,
  response: NextResponse
): Promise<void> {
  const tags = { action, method };

  switch (action) {
    case 'report':
      await monitoring.recordMetric('incidents.reported', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'investigation':
      await monitoring.recordMetric('incidents.investigations', 1, {
        type: 'counter',
        tags
      });
      break;
    case 'resolution':
      await monitoring.recordMetric('incidents.resolved', 1, {
        type: 'counter',
        tags
      });
      break;
  }
} 