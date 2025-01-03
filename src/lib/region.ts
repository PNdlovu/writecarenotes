/**
 * @writecarenotes.com
 * @fileoverview Region validation and utilities
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export const SUPPORTED_REGIONS = [
  'england',
  'wales',
  'scotland',
  'northern-ireland',
  'ireland'
] as const

export type Region = typeof SUPPORTED_REGIONS[number]

export function validateRegion(region: string): region is Region {
  return SUPPORTED_REGIONS.includes(region as Region)
}

export function getRegionDisplay(region: Region): string {
  const displays: Record<Region, string> = {
    'england': 'England',
    'wales': 'Wales',
    'scotland': 'Scotland',
    'northern-ireland': 'Northern Ireland',
    'ireland': 'Ireland'
  }
  return displays[region]
}

export function getRegulatorForRegion(region: Region): string {
  const regulators: Record<Region, string> = {
    'england': 'CQC',
    'wales': 'CIW',
    'scotland': 'Care Inspectorate',
    'northern-ireland': 'RQIA',
    'ireland': 'HIQA'
  }
  return regulators[region]
} 