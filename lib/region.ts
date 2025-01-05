/**
 * @writecarenotes.com
 * @fileoverview Region validation utilities
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utilities for validating and working with region codes across the application.
 * Supports validation of region codes and provides region-specific configuration.
 */

export const VALID_REGIONS = ['england', 'wales', 'scotland', 'northern-ireland', 'ireland'] as const

export type Region = typeof VALID_REGIONS[number]

export function validateRegion(region: string): region is Region {
  return VALID_REGIONS.includes(region as Region)
}

export const REGION_NAMES: Record<Region, string> = {
  'england': 'England',
  'wales': 'Wales',
  'scotland': 'Scotland',
  'northern-ireland': 'Northern Ireland',
  'ireland': 'Ireland',
}

export const REGULATORY_BODIES: Record<Region, string> = {
  'england': 'CQC',
  'wales': 'CIW',
  'scotland': 'Care Inspectorate',
  'northern-ireland': 'RQIA',
  'ireland': 'HIQA',
}

export function getRegionName(region: Region): string {
  return REGION_NAMES[region]
}

export function getRegulatoryBody(region: Region): string {
  return REGULATORY_BODIES[region]
} 