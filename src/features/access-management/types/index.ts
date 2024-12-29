/**
 * @fileoverview Core types for the Access Management module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export interface Permission {
  id: string;
  name: string;
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
  description?: string;
  category?: 'schedule' | 'attendance' | 'reports' | 'settings' | 'admin' | 'care' | 'medical';
  isEnabled: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  users?: number;
  tenantId: string;
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  tenantId: string;
  sessionData: {
    lastLogin: Date;
    deviceInfo: string;
    ipAddress: string;
  };
  status: 'active' | 'inactive' | 'suspended';
}

export interface CareAccessLevel {
  level: 'READ' | 'WRITE' | 'ADMIN';
  careTypes: string[];
  regions: string[];
}

export interface EmergencyAccess {
  roleId: string;
  permissions: EmergencyPermission[];
  temporaryGrant: boolean;
  expiresAt?: Date;
  grantedBy: string;
}

export enum EmergencyPermission {
  DECLARE = 'DECLARE_EMERGENCY',
  MANAGE = 'MANAGE_EMERGENCY',
  RESOLVE = 'RESOLVE_EMERGENCY',
  GRANT_ACCESS = 'GRANT_EMERGENCY_ACCESS'
}

export interface AccessRequest {
  userId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  context?: Record<string, any>;
}

export interface AccessDecision {
  allowed: boolean;
  reason?: string;
  expiresAt?: Date;
  conditions?: Record<string, any>;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description?: string;
  roles: string[];
  resources: string[];
  actions: string[];
  conditions?: {
    attribute: string;
    operator: string;
    value: string;
  }[];
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  tenantId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface SecurityConfig {
  algorithm: string;
  ivLength: number;
  encryptionKey: Buffer;
  tokenSecret: string;
  tokenExpiry: number;
  mfaEnabled: boolean;
  passwordPolicy: {
    minLength: number;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    requireUppercase: boolean;
    requireLowercase: boolean;
    expiryDays: number;
    preventReuse: number;
  };
}
