export type Region = 'us' | 'uk' | 'eu' | 'au' | 'ca';

export type Language = 'en' | 'es' | 'fr' | 'de';

export type TimeZone = string; // IANA time zone format

export interface RegionalSettings {
  region: Region;
  language: Language;
  timezone: TimeZone;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  measurementSystem: 'metric' | 'imperial';
}

export interface Organization {
  id: string;
  name: string;
  careHomes: CareHome[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  careHomeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'manager' | 'staff' | 'resident';

export interface CareHome {
  id: string;
  organizationId: string;
  name: string;
  type: 'residential' | 'nursing' | 'specialized';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  contact: {
    phone: string;
    email: string;
    emergency: string;
  };
  license: {
    number: string;
    expiryDate: Date;
    type: string;
  };
  capacity: {
    total: number;
    available: number;
    units: {
      id: string;
      name: string;
      type: string;
      capacity: number;
    }[];
  };
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
    };
  };
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  tenantIds?: string[];
  regionIds?: Region[];
  startDate?: Date;
  endDate?: Date;
  rules?: {
    type: 'percentage' | 'whitelist' | 'blacklist';
    value: any;
  };
}

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'login'
  | 'logout'
  | 'export'
  | 'import';

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  timestamp: Date;
  changes?: {
    before: any;
    after: any;
  };
  metadata: {
    ip: string;
    userAgent: string;
    location?: {
      city?: string;
      country?: string;
    };
  };
}

export interface ErrorLog {
  id: string;
  tenantId: string;
  userId?: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  metadata: {
    component?: string;
    action?: string;
    resourceId?: string;
    browserInfo?: {
      userAgent: string;
      platform: string;
      language: string;
    };
    networkInfo?: {
      online: boolean;
      effectiveType?: string;
    };
  };
}

export { FacilitySettings } from './facilitySettings';


