import { prisma } from './prisma'

type AuditEventType = {
  entityType: string
  entityId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE'
  details: any
  organizationId: string
  userId: string
}

export async function logAuditEvent({
  entityType,
  entityId,
  action,
  details,
  organizationId,
  userId,
}: AuditEventType) {
  try {
    await prisma.auditLog.create({
      data: {
        entityType,
        entityId,
        action,
        details,
        organizationId,
        userId,
      },
    })
  } catch (error) {
    console.error('Error creating audit log:', error)
    // Don't throw error to prevent disrupting the main operation
  }
} 