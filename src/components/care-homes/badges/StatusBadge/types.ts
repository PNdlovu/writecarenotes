/**
 * @writecarenotes.com
 * @fileoverview Status badge type definitions
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the StatusBadge component. Includes:
 * - Resident status enumeration
 * - Component props interface
 * - Display configuration options
 * - Styling customization options
 */

/**
 * Represents the possible resident status values.
 * ACTIVE: Currently residing in the care home
 * DISCHARGED: No longer in care
 * TEMPORARY: Short-term or respite care
 * ADMITTED: Recently admitted, pending full assessment
 */
export type ResidentStatus = 'ACTIVE' | 'DISCHARGED' | 'TEMPORARY' | 'ADMITTED';

/**
 * Props interface for the StatusBadge component.
 * @property status - The resident's current status
 * @property showLabel - Whether to show the text label (default: true)
 * @property className - Additional CSS classes for customization
 */
export interface StatusBadgeProps {
  status: ResidentStatus;
  showLabel?: boolean;
  className?: string;
}