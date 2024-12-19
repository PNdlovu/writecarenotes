/**
 * @fileoverview Family Portal Types
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the Family Portal module
 */

// Core Types
export * from './common';
export * from './privacy';
export * from './activity';
export * from './analytics';
export * from './calendar';
export * from './care';
export * from './communication';
export * from './consent';
export * from './documents';
export * from './emergency';
export * from './feedback';
export * from './financial';
export * from './integration';
export * from './meal';
export * from './medical';
export * from './medication';
export * from './memories';
export * from './network';
export * from './preferences';
export * from './video';
export * from './visiting';
export * from './wellness';

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string; // For multi-tenant support
}

// User Types
export interface FamilyMember extends BaseEntity {
  name: string;
  relationship: string;
  contactInfo: ContactInfo;
  preferences: UserPreferences;
  permissions: Permissions;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
}

export interface UserPreferences {
  language: 'en' | 'cy' | 'gd' | 'ga';
  notifications: NotificationPreferences;
  accessibility: AccessibilitySettings;
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours?: {
    start: string;
    end: string;
  };
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  screenReader: boolean;
  reduceMotion?: boolean;
  colorBlindMode?: boolean;
}

export interface Permissions {
  canViewMedical: boolean;
  canViewFinancial: boolean;
  canMakeDecisions: boolean;
  isEmergencyContact: boolean;
  accessLevel: 'read' | 'write' | 'admin';
  restrictions?: string[];
}

// Visit Types
export interface Visit extends BaseEntity {
  visitor: FamilyMember;
  date: Date;
  duration: number;
  purpose: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  healthCheck?: HealthCheck;
}

export interface HealthCheck {
  temperature?: number;
  symptoms: string[];
  vaccination: {
    status: boolean;
    date?: Date;
  };
  testResult?: {
    type: string;
    result: string;
    date: Date;
  };
}

// Document Types
export interface Document extends BaseEntity {
  title: string;
  type: string;
  uploadedBy: string;
  uploadDate: Date;
  lastModified: Date;
  status: 'draft' | 'pending' | 'approved';
  visibility: string[];
  tags: string[];
  file: {
    url: string;
    size: number;
    type: string;
  };
  metadata?: Record<string, unknown>;
  version?: number;
}

// Memory Types
export interface Memory extends BaseEntity {
  title: string;
  date: Date;
  description: string;
  location?: string;
  tags: string[];
  media: MediaItem[];
  sharedWith: string[];
  createdBy: string;
  privacy: 'private' | 'family' | 'public';
}

export interface MediaItem extends BaseEntity {
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  caption?: string;
  metadata?: {
    size?: number;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

// Emergency Types
export interface EmergencyContact extends BaseEntity {
  name: string;
  relationship: string;
  priority: number;
  contactInfo: ContactInfo;
  availability: string;
  lastVerified: Date;
  notificationPreferences: NotificationPreferences;
}

// Care Team Types
export interface CareTeamMember extends BaseEntity {
  name: string;
  role: string;
  specialty?: string;
  availability: string[];
  contactInfo: ContactInfo;
  status: 'active' | 'on_leave' | 'off_duty';
  qualifications?: string[];
  languages?: string[];
}


