/**
 * Privacy-related type definitions for the family portal
 */

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: 'view' | 'create' | 'update' | 'delete' | 'export' | 'share';
  category: 'medical' | 'personal' | 'financial' | 'communication';
  resource: {
    id: string;
    type: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  details: {
    changes?: Array<{
      field: string;
      oldValue: string;
      newValue: string;
    }>;
    reason?: string;
    location?: string;
    device?: string;
    ipAddress?: string;
  };
  organizationId: string; // For multi-tenant support
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'medical' | 'personal' | 'financial' | 'communication';
  level: 'read' | 'write' | 'admin';
  granted: boolean;
  grantedTo: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  conditions?: Array<{
    type: string;
    value: string;
  }>;
  organizationId: string; // For multi-tenant support
}

export interface PrivacyComponentProps {
  residentId: string;
  familyMemberId: string;
  organizationId: string;
}


