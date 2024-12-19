/**
 * @fileoverview Audit Log Types
 */

export type AuditAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'share';
export type AuditCategory = 'medical' | 'personal' | 'financial' | 'communication';
export type AuditStatus = 'success' | 'failure' | 'blocked';

export interface AuditResource {
  id: string;
  type: string;
  name: string;
}

export interface AuditUser {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface AuditChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface AuditDetails {
  changes?: AuditChange[];
  reason?: string;
  location?: string;
  device?: string;
  ip?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  category: AuditCategory;
  resource: AuditResource;
  user: AuditUser;
  details: AuditDetails;
  status: AuditStatus;
}

export interface AuditFilter {
  category?: AuditCategory;
  action?: AuditAction;
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchQuery?: string;
}


