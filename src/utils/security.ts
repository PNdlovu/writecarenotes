import { NextApiRequest, NextApiResponse } from 'next';

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface CareAccessLevel {
  level: 'READ' | 'WRITE' | 'ADMIN';
  careTypes: string[];
  regions: string[];
}

export interface CareUserPermissions {
  userId: string;
  accessLevels: CareAccessLevel[];
  specialPermissions?: {
    canViewMedicalRecords: boolean;
    canEditCarePlans: boolean;
    canApproveAssessments: boolean;
    canManageStaff: boolean;
  };
}

export class SecurityService {
  private static readonly ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds limit' };
    }

    return { valid: true };
  }

  static hasPermission(
    userRoles: Role[],
    resource: string,
    action: string
  ): boolean {
    return userRoles.some((role) =>
      role.permissions.some(
        (permission) =>
          permission.resource === resource &&
          permission.actions.includes(action as any)
      )
    );
  }

  static validateSession(req: NextApiRequest): boolean {
    const session = req.cookies['session'];
    if (!session) return false;
    
    // Add your session validation logic here
    return true;
  }

  static encryptDocument(content: string, key: string): string {
    // Implement document encryption using a secure encryption algorithm
    // This is a placeholder - use a proper encryption library in production
    return content;
  }

  static decryptDocument(encryptedContent: string, key: string): string {
    // Implement document decryption
    // This is a placeholder - use a proper encryption library in production
    return encryptedContent;
  }

  static validateCareAccess(
    userPermissions: CareUserPermissions,
    careType: string,
    region: string,
    requiredLevel: CareAccessLevel['level']
  ): boolean {
    return userPermissions.accessLevels.some(access => 
      access.careTypes.includes(careType) &&
      access.regions.includes(region) &&
      this.isAccessLevelSufficient(access.level, requiredLevel)
    );
  }

  private static isAccessLevelSufficient(
    userLevel: CareAccessLevel['level'],
    requiredLevel: CareAccessLevel['level']
  ): boolean {
    const levels = ['READ', 'WRITE', 'ADMIN'];
    return levels.indexOf(userLevel) >= levels.indexOf(requiredLevel);
  }

  static validateSensitiveDataAccess(
    userPermissions: CareUserPermissions,
    dataType: 'medical' | 'carePlan' | 'assessment' | 'staff'
  ): boolean {
    if (!userPermissions.specialPermissions) return false;

    switch (dataType) {
      case 'medical':
        return userPermissions.specialPermissions.canViewMedicalRecords;
      case 'carePlan':
        return userPermissions.specialPermissions.canEditCarePlans;
      case 'assessment':
        return userPermissions.specialPermissions.canApproveAssessments;
      case 'staff':
        return userPermissions.specialPermissions.canManageStaff;
      default:
        return false;
    }
  }

  static sanitizeSensitiveData<T extends Record<string, any>>(
    data: T,
    userPermissions: CareUserPermissions
  ): Partial<T> {
    const sanitized = { ...data };

    // Remove sensitive medical information if no permission
    if (!this.validateSensitiveDataAccess(userPermissions, 'medical')) {
      delete sanitized.medicalHistory;
      delete sanitized.medications;
      delete sanitized.healthConditions;
    }

    // Remove care plan details if no permission
    if (!this.validateSensitiveDataAccess(userPermissions, 'carePlan')) {
      delete sanitized.carePlanDetails;
      delete sanitized.assessmentResults;
    }

    // Remove staff information if no permission
    if (!this.validateSensitiveDataAccess(userPermissions, 'staff')) {
      delete sanitized.staffNotes;
      delete sanitized.staffAssignments;
    }

    return sanitized;
  }

  static validateDataCompliance(
    data: any,
    region: string
  ): { compliant: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for required GDPR fields in EU regions
    if (['ENGLAND', 'WALES', 'SCOTLAND', 'NORTHERN_IRELAND'].includes(region)) {
      if (!data.dataProcessingConsent) {
        issues.push('Missing GDPR consent');
      }
      if (!data.dataRetentionPeriod) {
        issues.push('Missing data retention period');
      }
      if (!data.dataProcessingPurpose) {
        issues.push('Missing data processing purpose');
      }
    }

    // Check for required fields in children's care
    if (data.careType === 'childrens') {
      if (!data.parentalConsent) {
        issues.push('Missing parental consent');
      }
      if (!data.safeguardingMeasures) {
        issues.push('Missing safeguarding measures');
      }
    }

    return {
      compliant: issues.length === 0,
      issues
    };
  }

  static auditAccess(
    userId: string,
    action: string,
    resource: string,
    success: boolean,
    details?: Record<string, any>
  ): void {
    // Implement your audit logging here
    console.log({
      timestamp: new Date(),
      userId,
      action,
      resource,
      success,
      details,
      ip: process.env.NODE_ENV === 'development' ? 'localhost' : /* get IP */ '',
    });
  }
}

// Middleware for role-based access control
export function withRoleCheck(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  requiredRole: string
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userRoles = req.session?.user?.roles || [];
    
    if (!SecurityService.validateSession(req)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!userRoles.includes(requiredRole)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    return handler(req, res);
  };
}

// Care-specific middleware
export function withCareAccess(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  requiredLevel: CareAccessLevel['level'],
  careType: string
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userPermissions = req.session?.user?.carePermissions as CareUserPermissions;
    const region = req.headers['x-region'] as string;

    if (!userPermissions) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!SecurityService.validateCareAccess(userPermissions, careType, region, requiredLevel)) {
      res.status(403).json({ error: 'Insufficient care access permissions' });
      return;
    }

    // Audit the access attempt
    SecurityService.auditAccess(
      userPermissions.userId,
      'ACCESS_CARE_RESOURCE',
      careType,
      true,
      { region, level: requiredLevel }
    );

    return handler(req, res);
  };
}
