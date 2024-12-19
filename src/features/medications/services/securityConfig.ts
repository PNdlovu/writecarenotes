/**
 * @fileoverview Security Configuration Service for Medication Management
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';

export interface SecurityFeatureConfig {
  enabled: boolean;
  required: boolean;
  options?: Record<string, any>;
}

export interface OrganizationSecurityConfig {
  pinAuthentication: SecurityFeatureConfig;
  twoFactorAuth: SecurityFeatureConfig;
  roleBasedAccess: SecurityFeatureConfig;
  auditLogging: SecurityFeatureConfig;
  sessionManagement: SecurityFeatureConfig;
  ipAccessControl: SecurityFeatureConfig;
  deviceRegistration: SecurityFeatureConfig;
}

export class SecurityConfigService {
  constructor(private readonly organizationId: string) {}

  async getSecurityConfig(): Promise<OrganizationSecurityConfig> {
    const config = await prisma.organizationSecurityConfig.findUnique({
      where: { organizationId: this.organizationId }
    });

    // Return default config if none exists
    if (!config) {
      return this.getDefaultConfig();
    }

    return {
      pinAuthentication: config.pinAuthentication as SecurityFeatureConfig,
      twoFactorAuth: config.twoFactorAuth as SecurityFeatureConfig,
      roleBasedAccess: config.roleBasedAccess as SecurityFeatureConfig,
      auditLogging: config.auditLogging as SecurityFeatureConfig,
      sessionManagement: config.sessionManagement as SecurityFeatureConfig,
      ipAccessControl: config.ipAccessControl as SecurityFeatureConfig,
      deviceRegistration: config.deviceRegistration as SecurityFeatureConfig
    };
  }

  async updateSecurityConfig(
    updates: Partial<OrganizationSecurityConfig>
  ): Promise<OrganizationSecurityConfig> {
    // Validate updates
    this.validateSecurityConfig(updates);

    // Update config
    const config = await prisma.organizationSecurityConfig.upsert({
      where: { organizationId: this.organizationId },
      update: updates,
      create: {
        organizationId: this.organizationId,
        ...this.getDefaultConfig(),
        ...updates
      }
    });

    // Log configuration change
    await this.logConfigChange(updates);

    return config as OrganizationSecurityConfig;
  }

  async isFeatureEnabled(feature: keyof OrganizationSecurityConfig): Promise<boolean> {
    const config = await this.getSecurityConfig();
    return config[feature]?.enabled ?? false;
  }

  async isFeatureRequired(feature: keyof OrganizationSecurityConfig): Promise<boolean> {
    const config = await this.getSecurityConfig();
    return config[feature]?.required ?? false;
  }

  async getFeatureOptions(
    feature: keyof OrganizationSecurityConfig
  ): Promise<Record<string, any> | undefined> {
    const config = await this.getSecurityConfig();
    return config[feature]?.options;
  }

  private getDefaultConfig(): OrganizationSecurityConfig {
    return {
      pinAuthentication: {
        enabled: true,
        required: true,
        options: {
          minLength: 4,
          maxLength: 6,
          expiryDays: 90,
          maxAttempts: 3
        }
      },
      twoFactorAuth: {
        enabled: false,
        required: false,
        options: {
          methods: ['email'],
          codeExpiry: 10, // minutes
          maxAttempts: 3
        }
      },
      roleBasedAccess: {
        enabled: true,
        required: true,
        options: {
          roles: [
            'admin',
            'manager',
            'nurse',
            'carer',
            'trainee'
          ]
        }
      },
      auditLogging: {
        enabled: true,
        required: true,
        options: {
          retentionDays: 365,
          includeUserAgent: true,
          includeIpAddress: true
        }
      },
      sessionManagement: {
        enabled: true,
        required: true,
        options: {
          sessionTimeout: 30, // minutes
          maxConcurrentSessions: 1,
          autoExtendSession: true
        }
      },
      ipAccessControl: {
        enabled: false,
        required: false,
        options: {
          allowedIPs: [],
          allowedRanges: [],
          blockUnknownIPs: false
        }
      },
      deviceRegistration: {
        enabled: false,
        required: false,
        options: {
          maxDevices: 3,
          requireApproval: true,
          deviceExpiry: 180 // days
        }
      }
    };
  }

  private validateSecurityConfig(updates: Partial<OrganizationSecurityConfig>): void {
    // Validate PIN authentication
    if (updates.pinAuthentication) {
      const { minLength, maxLength } = updates.pinAuthentication.options || {};
      if (minLength && (minLength < 4 || minLength > 8)) {
        throw new Error('PIN length must be between 4 and 8 digits');
      }
      if (maxLength && maxLength < minLength) {
        throw new Error('Maximum PIN length cannot be less than minimum length');
      }
    }

    // Validate two-factor authentication
    if (updates.twoFactorAuth) {
      const { methods } = updates.twoFactorAuth.options || {};
      if (methods && !methods.every(m => ['email', 'sms'].includes(m))) {
        throw new Error('Invalid 2FA method specified');
      }
    }

    // Validate role-based access
    if (updates.roleBasedAccess) {
      const { roles } = updates.roleBasedAccess.options || {};
      if (roles && !roles.includes('admin')) {
        throw new Error('Admin role must be included');
      }
    }

    // Validate session management
    if (updates.sessionManagement) {
      const { sessionTimeout } = updates.sessionManagement.options || {};
      if (sessionTimeout && (sessionTimeout < 5 || sessionTimeout > 120)) {
        throw new Error('Session timeout must be between 5 and 120 minutes');
      }
    }

    // Validate IP access control
    if (updates.ipAccessControl) {
      const { allowedIPs, allowedRanges } = updates.ipAccessControl.options || {};
      if (allowedIPs && !this.validateIPAddresses(allowedIPs)) {
        throw new Error('Invalid IP address format');
      }
      if (allowedRanges && !this.validateIPRanges(allowedRanges)) {
        throw new Error('Invalid IP range format');
      }
    }

    // Validate device registration
    if (updates.deviceRegistration) {
      const { maxDevices } = updates.deviceRegistration.options || {};
      if (maxDevices && (maxDevices < 1 || maxDevices > 10)) {
        throw new Error('Maximum devices must be between 1 and 10');
      }
    }
  }

  private validateIPAddresses(ips: string[]): boolean {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ips.every(ip => ipRegex.test(ip));
  }

  private validateIPRanges(ranges: string[]): boolean {
    const rangeRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    return ranges.every(range => rangeRegex.test(range));
  }

  private async logConfigChange(updates: Partial<OrganizationSecurityConfig>): Promise<void> {
    await prisma.securityConfigChangeLog.create({
      data: {
        organizationId: this.organizationId,
        changes: updates,
        timestamp: new Date(),
        userId: 'system' // This should be replaced with actual user ID when used
      }
    });
  }
} 


