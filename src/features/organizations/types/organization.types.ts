/**
 * Core Organization Types
 * Focused on organization-level management of care homes
 */

import { CareHome } from '../../carehome/types'

export interface Organization {
  id: string
  name: string
  slug: string
  createdAt: Date
  updatedAt: Date
  careHomes: CareHome[]
  settings: OrganizationSettings
  status: OrganizationStatus
  region?: string
  contactDetails: ContactDetails
}

export interface OrganizationSettings {
  theme: {
    primaryColor: string
    logo?: string
  }
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  defaultCareHomeSettings?: {
    visitingHours: {
      start: string
      end: string
    }
    admissionHours: {
      start: string
      end: string
    }
  }
}

export interface ContactDetails {
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  phone: string
  email: string
  website?: string
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

// Re-export CareHome type for convenience
export type { CareHome }


