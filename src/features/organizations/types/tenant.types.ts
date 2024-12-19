/**
 * Tenant Types
 */

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'

export type TenantType = 'ENTERPRISE' | 'HEALTHCARE' | 'GOVERNMENT' | 'EDUCATION'

export interface TenantSettings {
  security: {
    mfa: {
      required: boolean
      methods: ('APP' | 'SMS' | 'EMAIL')[]
    }
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
      requireUppercase: boolean
      expiryDays: number
      preventReuse: number
    }
    ipRestrictions: {
      enabled: boolean
      allowedIPs: string[]
      allowedRanges: string[]
    }
    sessionPolicy: {
      maxConcurrentSessions: number
      sessionTimeout: number // minutes
      requireDeviceApproval: boolean
    }
  }
  compliance: {
    dataRetention: {
      enabled: boolean
      retentionPeriod: number // days
      archiveEnabled: boolean
      archivePeriod: number // days
    }
    audit: {
      enabled: boolean
      detailedLogging: boolean
      retentionPeriod: number // days
    }
    gdpr: {
      enabled: boolean
      dpoEmail: string
      dataProcessingAgreement: string
      thirdPartyProcessors: string[]
    }
  }
  branding: {
    enabled: boolean
    logo?: string
    colors: {
      primary: string
      secondary: string
      accent: string
    }
    customDomain?: string
    emailTemplates: {
      enabled: boolean
      customHeader?: string
      customFooter?: string
    }
  }
  notifications: {
    email: {
      enabled: boolean
      providers: string[]
      defaultFrom: string
      replyTo?: string
    }
    sms: {
      enabled: boolean
      providers: string[]
      defaultFrom: string
    }
    webhooks: {
      enabled: boolean
      endpoints: {
        url: string
        events: string[]
        active: boolean
      }[]
    }
  }
  integrations: {
    enabled: boolean
    active: {
      name: string
      type: string
      config: Record<string, any>
      status: 'ACTIVE' | 'PENDING' | 'ERROR'
    }[]
  }
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
  }
}

export interface Tenant {
  id: string
  name: string
  type: TenantType
  status: TenantStatus
  settings: TenantSettings
  organizations: string[] // Organization IDs
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
  }
}


