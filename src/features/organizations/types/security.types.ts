export enum SecurityLevel {
  PUBLIC = 'PUBLIC',
  INTERNAL = 'INTERNAL',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}

export interface SecurityPolicy {
  id: string;
  organizationId: string;
  passwordPolicy?: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  sessionPolicy?: {
    maxSessionDuration: number;
    requireMfa: boolean;
    allowedIpRanges?: string[];
    allowedRegions?: string[];
  };
  dataAccessPolicy?: {
    allowExport: boolean;
    allowBulkOperations: boolean;
    requireApprovalForBulkOperations: boolean;
    dataRetentionDays: number;
    piiFields: PiiField[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PiiField {
  name: string;
  type: 'encrypt' | 'mask';
  maskPattern?: string;
  description?: string;
}


