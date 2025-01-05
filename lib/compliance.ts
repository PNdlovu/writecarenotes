import { type Region } from '@prisma/client'

interface ComplianceRule {
  id: string
  region: Region | null // null means applies to all regions
  entityType: string
  check: (data: any) => boolean
  errorMessage: string
}

interface ComplianceResult {
  valid: boolean
  status: 'PENDING' | 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW_REQUIRED'
  errors?: string[]
}

// Regional compliance rules
const complianceRules: Array<ComplianceRule> = [
  // England DBS Check
  {
    id: 'UK_DBS_CHECK',
    region: 'ENGLAND' as Region,
    entityType: 'STAFF_CREATE',
    check: (data) => Boolean(data.dbs?.certificateNumber),
    errorMessage: 'DBS check is required for staff in England'
  },
  // Northern Ireland Access NI Check
  {
    id: 'NI_ACCESS_CHECK',
    region: 'NORTHERN_IRELAND' as Region,
    entityType: 'STAFF_CREATE',
    check: (data) => Boolean(data.accessNI?.certificateNumber),
    errorMessage: 'Access NI check is required for staff in Northern Ireland'
  },
  // Ireland Garda Vetting
  {
    id: 'IE_GARDA_VETTING',
    region: 'IRELAND' as Region,
    entityType: 'STAFF_CREATE',
    check: (data) => Boolean(data.garda?.vettingNumber),
    errorMessage: 'Garda vetting is required for staff in Ireland'
  },
  // Scotland PVG Check
  {
    id: 'SCOTLAND_PVG',
    region: 'SCOTLAND' as Region,
    entityType: 'STAFF_CREATE',
    check: (data) => Boolean(data.pvg?.membershipNumber),
    errorMessage: 'PVG membership is required for staff in Scotland'
  },
  // Wales DBS Check
  {
    id: 'WALES_DBS_CHECK',
    region: 'WALES' as Region,
    entityType: 'STAFF_CREATE',
    check: (data) => Boolean(data.dbs?.certificateNumber),
    errorMessage: 'DBS check is required for staff in Wales'
  },
  // Data Protection (Global Rule)
  {
    id: 'DATA_CONSENT',
    region: null,
    entityType: 'STAFF_CREATE',
    check: (data) => Boolean(data.dataConsentGiven),
    errorMessage: 'Data protection consent is required'
  }
] as const

export async function validateRegionalCompliance(params: {
  type: string
  data: any
  region: Region
}): Promise<ComplianceResult> {
  const { type, data, region } = params

  // Get applicable rules (region-specific and global rules)
  const rules = complianceRules.filter(
    rule => (rule.region === region || rule.region === null) && 
    rule.entityType === type
  )

  // Check all rules
  const errors: string[] = []
  for (const rule of rules) {
    if (!rule.check(data)) {
      errors.push(rule.errorMessage)
    }
  }

  // Determine compliance status
  const status: ComplianceResult['status'] = errors.length === 0 
    ? 'COMPLIANT'
    : errors.some(e => e.includes('required'))
      ? 'NON_COMPLIANT'
      : 'REVIEW_REQUIRED'

  return {
    valid: errors.length === 0,
    status,
    errors: errors.length > 0 ? errors : undefined
  }
} 
