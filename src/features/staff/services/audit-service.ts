import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export interface AuditLogEntry {
  action: string;
  module: string;
  entityId?: string;
  entityType: string;
  details: Record<string, any>;
  userId: string;
  organizationId: string;
  timestamp: Date;
}

export class AuditService {
  static async log(entry: Omit<AuditLogEntry, 'timestamp' | 'userId' | 'organizationId'>) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    await prisma.auditLog.create({
      data: {
        ...entry,
        userId: session.user.id,
        organizationId: session.user.organizationId,
        timestamp: new Date(),
      },
    });
  }

  static async getAuditLogs(options: {
    module?: string;
    entityId?: string;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('User not authenticated');
    }

    const {
      module,
      entityId,
      entityType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const where = {
      organizationId: session.user.organizationId,
      ...(module && { module }),
      ...(entityId && { entityId }),
      ...(entityType && { entityType }),
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
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}


