import { PrismaClient } from '@prisma/client';
import { Redis } from '@upstash/redis';

const prisma = new PrismaClient();
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
});

interface AuditEvent {
  tenantId: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  details?: Record<string, any>;
}

export async function auditLog(event: AuditEvent) {
  try {
    // First, write to Redis for immediate availability
    const redisKey = `audit:${event.tenantId}:${new Date().toISOString()}`;
    await redis.set(redisKey, JSON.stringify(event));
    
    // Then, write to the database for permanent storage
    await prisma.auditLog.create({
      data: {
        tenantId: event.tenantId,
        userId: event.userId,
        action: event.action,
        resource: event.resource,
        timestamp: new Date(event.timestamp),
        ipAddress: event.ip,
        userAgent: event.userAgent,
        details: event.details ? JSON.stringify(event.details) : null,
      },
    });

    // If this is a sensitive action, send immediate notification
    if (isSensitiveAction(event.action, event.resource)) {
      await notifySecurity(event);
    }

    // Update audit statistics
    await updateAuditStats(event);

  } catch (error) {
    console.error('Audit logging error:', error);
    // On error, store in backup queue for retry
    await queueForRetry(event);
  }
}

function isSensitiveAction(action: string, resource: string): boolean {
  const sensitiveActions = [
    'DELETE',
    'UPDATE_PERMISSIONS',
    'CHANGE_SETTINGS',
    'ACCESS_SENSITIVE_DATA',
  ];

  const sensitiveResources = [
    '/api/users',
    '/api/permissions',
    '/api/settings',
    '/api/security',
  ];

  return (
    sensitiveActions.includes(action) ||
    sensitiveResources.some(r => resource.startsWith(r))
  );
}

async function notifySecurity(event: AuditEvent) {
  try {
    // Get tenant security settings
    const tenant = await prisma.tenant.findUnique({
      where: { id: event.tenantId },
      select: { securityNotificationEndpoint: true },
    });

    if (tenant?.securityNotificationEndpoint) {
      // Send notification to tenant's security endpoint
      await fetch(tenant.securityNotificationEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    }
  } catch (error) {
    console.error('Security notification error:', error);
  }
}

async function updateAuditStats(event: AuditEvent) {
  const date = new Date(event.timestamp);
  const hourKey = `audit:stats:${event.tenantId}:${date.getFullYear()}:${date.getMonth()}:${date.getDate()}:${date.getHours()}`;
  const dayKey = `audit:stats:${event.tenantId}:${date.getFullYear()}:${date.getMonth()}:${date.getDate()}`;

  await Promise.all([
    // Update hourly stats
    redis.hincrby(hourKey, event.action, 1),
    redis.hincrby(hourKey, `resource:${event.resource}`, 1),
    redis.expire(hourKey, 7 * 24 * 60 * 60), // Keep for 7 days

    // Update daily stats
    redis.hincrby(dayKey, event.action, 1),
    redis.hincrby(dayKey, `resource:${event.resource}`, 1),
    redis.expire(dayKey, 30 * 24 * 60 * 60), // Keep for 30 days
  ]);
}

async function queueForRetry(event: AuditEvent) {
  const retryKey = `audit:retry:${Date.now()}`;
  await redis.set(retryKey, JSON.stringify(event));
  await redis.expire(retryKey, 24 * 60 * 60); // Keep for 24 hours
}


