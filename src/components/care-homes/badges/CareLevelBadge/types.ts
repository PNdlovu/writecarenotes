/**
 * @writecarenotes.com
 * @fileoverview Care level badge type definitions
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the CareLevelBadge component. Includes:
 * - Care level enumeration
 * - Component props interface
 * - Size variants
 * - Optional display configurations
 * - Styling customization options
 */

/**
 * Represents the possible care level values.
 * LOW: Minimal assistance needed
 * MEDIUM: Regular assistance required
 * HIGH: Intensive care and support needed
 */
export type CareLevel = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Props interface for the CareLevelBadge component.
 * @property level - The care level to display
 * @property showLabel - Whether to show the text label (default: true)
 * @property size - Size variant of the badge (default: 'md')
 * @property className - Additional CSS classes for customization
 */
export interface CareLevelBadgeProps {
  level: CareLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}