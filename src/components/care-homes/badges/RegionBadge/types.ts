/**
 * @writecarenotes.com
 * @fileoverview Region badge type definitions
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the RegionBadge component. Includes:
 * - Region enumeration
 * - Component props interface
 * - Support for custom regions
 * - Styling customization options
 */

/**
 * Represents the supported regions in the UK and Ireland.
 * Used for region-specific styling and functionality.
 */
export type Region = 'England' | 'Wales' | 'Scotland' | 'Ireland' | 'Northern Ireland';

/**
 * Props interface for the RegionBadge component.
 * @property region - The region to display. Can be a predefined Region or custom string
 * @property className - Additional CSS classes for customization
 */
export interface RegionBadgeProps {
  region?: Region | string;
  className?: string;
}