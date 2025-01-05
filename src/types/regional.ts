/**
 * WriteCareNotes.com
 * @fileoverview Regional Type Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

export type Region = 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'ireland'

export interface RegionalConfig {
  code: string
  name: string
  regulator: string
  currency: string
  languages: string[]
  timezone: string
}

export const REGIONAL_CONFIG: Record<Region, RegionalConfig> = {
  england: {
    code: 'en-GB',
    name: 'England',
    regulator: 'CQC',
    currency: 'GBP',
    languages: ['en'],
    timezone: 'Europe/London',
  },
  wales: {
    code: 'cy-GB',
    name: 'Wales',
    regulator: 'CIW',
    currency: 'GBP',
    languages: ['en', 'cy'],
    timezone: 'Europe/London',
  },
  scotland: {
    code: 'en-GB',
    name: 'Scotland',
    regulator: 'Care Inspectorate',
    currency: 'GBP',
    languages: ['en', 'gd'],
    timezone: 'Europe/London',
  },
  'northern-ireland': {
    code: 'en-GB',
    name: 'Northern Ireland',
    regulator: 'RQIA',
    currency: 'GBP',
    languages: ['en', 'ga'],
    timezone: 'Europe/London',
  },
  ireland: {
    code: 'en-IE',
    name: 'Ireland',
    regulator: 'HIQA',
    currency: 'EUR',
    languages: ['en', 'ga'],
    timezone: 'Europe/Dublin',
  },
} 