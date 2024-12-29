/**
 * @fileoverview Core Access Management Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { jwtDecode } from 'jwt-decode';
import {
  AccessDecision,
  AccessPolicy,
  AccessRequest,
  AuditLog,
  EmergencyAccess,
  Permission,
  Role,
  SecurityConfig,
  User
} from '../types';

export class AccessManagementService {
  private currentUser: User | null = null;
  private roles: Map<string, Role> = new Map();
  private policies: Map<string, AccessPolicy> = new Map();
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      // Load roles and permissions
      const response = await fetch('/api/roles');
      const roles: Role[] = await response.json();
      roles.forEach(role => this.roles.set(role.id, role));

      // Load access policies
      const policiesResponse = await fetch('/api/access-policies');
      const policies: AccessPolicy[] = await policiesResponse.json();
      policies.forEach(policy => this.policies.set(policy.id, policy));

      // Setup interceptors
      this.setupInterceptors();
    } catch (error) {
      console.error('Failed to initialize AccessManagementService:', error);
      throw error;
    }
  }

  async authenticate(token: string): Promise<User> {
    try {
      const decoded = jwtDecode(token);
      this.validateTokenClaims(decoded);
      
      const response = await fetch('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const user = await response.json();
      this.currentUser = user;
      
      await this.auditLog({
        action: 'AUTH',
        description: 'User authenticated',
        userId: user.id,
        tenantId: user.tenantId,
        timestamp: new Date(),
        metadata: {
          deviceInfo: navigator.userAgent,
        }
      });

      return user;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  async checkAccess(request: AccessRequest): Promise<AccessDecision> {
    try {
      if (!this.currentUser) {
        return { allowed: false, reason: 'No authenticated user' };
      }

      // Check emergency access first
      const emergencyAccess = await this.checkEmergencyAccess(request);
      if (emergencyAccess.allowed) {
        return emergencyAccess;
      }

      // Check regular permissions
      const hasPermission = this.currentUser.roles.some(roleId => {
        const role = this.roles.get(roleId);
        return role?.permissions.some(
          perm => perm.resource === request.resourceType && 
                 perm.actions.includes(request.action as any) &&
                 perm.isEnabled
        );
      });

      if (!hasPermission) {
        return { allowed: false, reason: 'Insufficient permissions' };
      }

      // Check policies
      const applicablePolicies = Array.from(this.policies.values())
        .filter(policy => 
          policy.roles.some(role => this.currentUser!.roles.includes(role)) &&
          policy.resources.includes(request.resourceType) &&
          policy.actions.includes(request.action)
        );

      if (applicablePolicies.length === 0) {
        return { allowed: true };
      }

      // Evaluate policy conditions
      for (const policy of applicablePolicies) {
        const conditionsMet = await this.evaluatePolicyConditions(policy, request);
        if (!conditionsMet) {
          return { 
            allowed: false, 
            reason: 'Policy conditions not met',
            conditions: policy.conditions 
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking access:', error);
      throw error;
    }
  }

  async requestEmergencyAccess(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<EmergencyAccess> {
    try {
      const response = await fetch('/api/emergency-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, resourceType, resourceId })
      });

      if (!response.ok) {
        throw new Error('Failed to request emergency access');
      }

      const emergencyAccess = await response.json();
      
      await this.auditLog({
        action: 'EMERGENCY_ACCESS_REQUEST',
        description: `Emergency access requested for ${resourceType}:${resourceId}`,
        userId,
        tenantId: this.currentUser?.tenantId || '',
        timestamp: new Date(),
        metadata: { resourceType, resourceId }
      });

      return emergencyAccess;
    } catch (error) {
      console.error('Error requesting emergency access:', error);
      throw error;
    }
  }

  async createPolicy(policy: Omit<AccessPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<AccessPolicy> {
    try {
      const response = await fetch('/api/access-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policy)
      });

      if (!response.ok) {
        throw new Error('Failed to create access policy');
      }

      const newPolicy = await response.json();
      this.policies.set(newPolicy.id, newPolicy);

      await this.auditLog({
        action: 'POLICY_CREATE',
        description: `Access policy created: ${policy.name}`,
        userId: this.currentUser?.id || '',
        tenantId: this.currentUser?.tenantId || '',
        timestamp: new Date(),
        metadata: { policyId: newPolicy.id }
      });

      return newPolicy;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  async updatePolicy(
    id: string,
    updates: Partial<AccessPolicy>
  ): Promise<AccessPolicy> {
    try {
      const response = await fetch(`/api/access-policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update access policy');
      }

      const updatedPolicy = await response.json();
      this.policies.set(updatedPolicy.id, updatedPolicy);

      await this.auditLog({
        action: 'POLICY_UPDATE',
        description: `Access policy updated: ${updatedPolicy.name}`,
        userId: this.currentUser?.id || '',
        tenantId: this.currentUser?.tenantId || '',
        timestamp: new Date(),
        metadata: { policyId: updatedPolicy.id }
      });

      return updatedPolicy;
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  }

  async auditLog(log: Omit<AuditLog, 'id'>): Promise<void> {
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...log,
          metadata: {
            ...log.metadata,
            userAgent: navigator.userAgent,
          }
        })
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  async encryptData(data: Buffer): Promise<{ encrypted: Buffer; iv: Buffer }> {
    try {
      const iv = randomBytes(this.config.ivLength);
      const cipher = createCipheriv(
        this.config.algorithm,
        this.config.encryptionKey,
        iv
      );
      
      const encrypted = Buffer.concat([
        cipher.update(data),
        cipher.final()
      ]);

      return { encrypted, iv };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptData(encrypted: Buffer, iv: Buffer): Promise<Buffer> {
    try {
      const decipher = createDecipheriv(
        this.config.algorithm,
        this.config.encryptionKey,
        iv
      );
      
      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  private validateTokenClaims(claims: any) {
    const now = Math.floor(Date.now() / 1000);
    
    if (claims.exp && claims.exp < now) {
      throw new Error('Token has expired');
    }
    
    if (claims.nbf && claims.nbf > now) {
      throw new Error('Token not yet valid');
    }
    
    if (!claims.sub || !claims.tenantId) {
      throw new Error('Token missing required claims');
    }
  }

  private async checkEmergencyAccess(request: AccessRequest): Promise<AccessDecision> {
    try {
      const response = await fetch('/api/emergency-access/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        return { allowed: false };
      }

      const { hasAccess, expiresAt } = await response.json();
      return {
        allowed: hasAccess,
        reason: hasAccess ? 'Emergency access granted' : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      };
    } catch (error) {
      console.error('Error checking emergency access:', error);
      return { allowed: false };
    }
  }

  private async evaluatePolicyConditions(
    policy: AccessPolicy,
    request: AccessRequest
  ): Promise<boolean> {
    if (!policy.conditions || policy.conditions.length === 0) {
      return true;
    }

    try {
      const response = await fetch('/api/access-policies/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyId: policy.id,
          request
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate policy conditions');
      }

      const { conditionsMet } = await response.json();
      return conditionsMet;
    } catch (error) {
      console.error('Error evaluating policy conditions:', error);
      return false;
    }
  }

  private setupInterceptors() {
    // Add request interceptor for automatic token handling
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo, init?: RequestInit) => {
      if (typeof input === 'string' && !input.includes('/api/auth')) {
        const headers = new Headers(init?.headers || {});
        const token = localStorage.getItem('token');
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        init = { ...init, headers };
      }
      return originalFetch(input, init);
    };
  }
}
