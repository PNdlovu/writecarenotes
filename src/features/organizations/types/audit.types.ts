export type AuditEventType = 
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  | 'member.added'
  | 'member.removed'
  | 'member.role_changed'
  | 'settings.changed'
  | 'security.policy_changed'
  | 'security.breach_detected'
  | 'data.accessed'
  | 'data.exported';

export interface AuditEvent {
  type: AuditEventType;
  organizationId: string;
  resourceId?: string;
  resourceType?: string;
  action: string;
  changes?: Record<string, any>;
  metadata?: {
    userIp?: string;
    userAgent?: string;
    region?: string;
  };
}

export interface AuditLogEntry extends AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
}


