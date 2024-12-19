import { prisma } from '@/lib/prisma';

export type AuditEventType = 
  | 'AUTH'
  | 'CARE_PLAN'
  | 'DOCUMENT'
  | 'MEDICATION'
  | 'RESIDENT'
  | 'STAFF'
  | 'COMPLIANCE';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'SIGN_IN'
  | 'SIGN_OUT'
  | 'APPROVE'
  | 'REJECT'
  | 'COMPLETE'
  | 'SUBMIT';

interface AuditEvent {
  type: AuditEventType;
  action: AuditAction;
  userId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditLogger {
  private async getRequestMetadata() {
    // In a real implementation, you would get these from the request context
    return {
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };
  }

  async log(event: AuditEvent) {
    try {
      const { ipAddress, userAgent } = await this.getRequestMetadata();

      const auditLog = await prisma.auditLog.create({
        data: {
          type: event.type,
          action: event.action,
          userId: event.userId,
          metadata: event.metadata || {},
          ipAddress: event.ipAddress || ipAddress,
          userAgent: event.userAgent || userAgent,
          timestamp: new Date(),
        },
      });

      // For high-risk events, we might want to notify administrators
      if (this.isHighRiskEvent(event)) {
        await this.notifyAdministrators(auditLog);
      }

      return auditLog;
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw - we don't want audit logging to break the main functionality
      return null;
    }
  }

  private isHighRiskEvent(event: AuditEvent): boolean {
    const highRiskTypes: AuditEventType[] = ['DOCUMENT', 'MEDICATION', 'COMPLIANCE'];
    const highRiskActions: AuditAction[] = ['DELETE', 'UPDATE', 'REJECT'];

    return (
      highRiskTypes.includes(event.type) && 
      highRiskActions.includes(event.action)
    );
  }

  private async notifyAdministrators(auditLog: any) {
    try {
      // In a real implementation, you would:
      // 1. Fetch administrator contact details
      // 2. Send notifications via email/SMS
      // 3. Create alerts in the admin dashboard
      console.log('High-risk event detected:', auditLog);
    } catch (error) {
      console.error('Error notifying administrators:', error);
    }
  }

  async getAuditLogs(filters: {
    type?: AuditEventType;
    action?: AuditAction;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const {
      type,
      action,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const where = {
      ...(type && { type }),
      ...(action && { action }),
      ...(userId && { userId }),
      ...(startDate && endDate && {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      }),
    };

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: {
          timestamp: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    };
  }

  async getDocumentAuditTrail(documentId: string) {
    return prisma.auditLog.findMany({
      where: {
        type: 'DOCUMENT',
        metadata: {
          path: ['documentId'],
          equals: documentId,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getCarePlanAuditTrail(carePlanId: string) {
    return prisma.auditLog.findMany({
      where: {
        type: 'CARE_PLAN',
        metadata: {
          path: ['carePlanId'],
          equals: carePlanId,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}

export const auditLogger = new AuditLogger(); 


