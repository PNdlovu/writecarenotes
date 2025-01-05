/**
 * WriteCareNotes.com
 * @fileoverview Organization Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

import { CareHome } from '@prisma/client'

export enum OrganizationType {
  SINGLE_SITE = 'SINGLE_SITE',
  MULTI_SITE = 'MULTI_SITE',
  CORPORATE = 'CORPORATE',
  FRANCHISE = 'FRANCHISE'
}

export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ARCHIVED = 'ARCHIVED',
  PENDING = 'PENDING'
}

export enum RegulatoryBody {
  CQC = 'CQC',
  CIW = 'CIW',
  RQIA = 'RQIA',
  CARE_INSPECTORATE = 'CARE_INSPECTORATE',
  HIQA = 'HIQA'
}

export enum Region {
  ENGLAND = 'ENGLAND',
  WALES = 'WALES',
  SCOTLAND = 'SCOTLAND',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND'
}

export interface ComplianceFramework {
  id: string
  name: string
  regulatoryBody: RegulatoryBody
  requirements: ComplianceRequirement[]
  lastUpdated: Date
  nextReviewDate: Date
}

export interface ComplianceRequirement {
  id: string
  code: string
  description: string
  category: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'IN_PROGRESS' | 'NOT_APPLICABLE'
  dueDate?: Date
  evidence?: string[]
}

export interface OrganizationSettings {
  theme: {
    primaryColor: string
    logo?: string
    darkMode: boolean
  }
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    alertTypes: string[]
  }
  compliance: {
    autoReview: boolean
    reminderDays: number
    escalationLevels: string[]
  }
  security: {
    mfa: boolean
    ipWhitelist?: string[]
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
      expiryDays: number
    }
  }
  offline: {
    enabled: boolean
    syncInterval: number
    maxStorageSize: number
  }
  audit: {
    retentionPeriod: number
    detailLevel: 'BASIC' | 'DETAILED' | 'FULL'
  }
  regional: {
    language: string
    timezone: string
    dateFormat: string
    currency: string
  }
}

export interface ContactDetails {
  primary: {
    name: string
    email: string
    phone: string
    role: string
  }
  billing: {
    name: string
    email: string
    phone: string
    address: Address
  }
  emergency: {
    name: string
    email: string
    phone: string
    available24x7: boolean
  }
}

export interface Address {
  line1: string
  line2?: string
  city: string
  county: string
  postcode: string
  country: string
}

export interface Organization {
  id: string
  tenantId: string
  name: string
  slug: string
  type: OrganizationType
  status: OrganizationStatus
  region: Region
  regulatoryBody: RegulatoryBody
  complianceFrameworks: ComplianceFramework[]
  settings: OrganizationSettings
  contactDetails: ContactDetails
  careHomes: CareHome[]
  subscription: {
    plan: string
    status: 'ACTIVE' | 'EXPIRED' | 'TRIAL'
    expiryDate: Date
    features: string[]
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
    version: number
  }
  stats: {
    totalCareHomes: number
    totalResidents: number
    totalStaff: number
    complianceScore: number
    lastAuditDate: Date
  }
}

export interface OrganizationStats {
  overview: {
    totalCareHomes: number
    totalResidents: number
    totalStaff: number
    occupancyRate: number
    complianceScore: number
  }
  compliance: {
    overallScore: number
    byFramework: Record<string, number>
    criticalIssues: number
    upcomingDeadlines: number
  }
  financial: {
    revenue: number
    expenses: number
    outstanding: number
    projectedRevenue: number
  }
  operational: {
    staffingLevel: number
    incidentCount: number
    medicationErrors: number
    complaintCount: number
  }
  quality: {
    residentSatisfaction: number
    staffSatisfaction: number
    careQualityScore: number
    inspectionRating: string
  }
}

// Input types for API operations
export interface CreateOrganizationInput {
  name: string
  type: OrganizationType
  region: Region
  regulatoryBody: RegulatoryBody
  settings: Partial<OrganizationSettings>
  contactDetails: ContactDetails
}

export interface UpdateOrganizationInput {
  name?: string
  type?: OrganizationType
  region?: Region
  regulatoryBody?: RegulatoryBody
  settings?: Partial<OrganizationSettings>
  contactDetails?: Partial<ContactDetails>
  status?: OrganizationStatus
}

export interface OrganizationQueryParams {
  page?: number
  limit?: number
  status?: OrganizationStatus
  region?: Region
  type?: OrganizationType
  search?: string
  sortBy?: keyof Organization
  sortOrder?: 'asc' | 'desc'
}


