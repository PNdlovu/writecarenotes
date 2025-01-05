/**
 * @writecarenotes.com
 * @fileoverview Status badge style variants
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Style variants and theme configurations for the StatusBadge component.
 * Features include:
 * - Status-specific color schemes
 * - Dark mode support
 * - Semantic color mapping
 * - Accessibility-friendly contrast
 * - Consistent color palette
 */

import type { ResidentStatus } from "./types";

/**
 * Color variants mapped to resident status.
 * Each status has specific background and text colors for both light and dark modes.
 * Colors are chosen for optimal contrast and semantic meaning:
 * - Green: Active residents (currently in care)
 * - Gray: Discharged residents (no longer in care)
 * - Yellow: Temporary residents (short-term care)
 * - Blue: Newly admitted residents (pending assessment)
 */
export const statusColors: Record<ResidentStatus, { bg: string; text: string }> = {
  ACTIVE: { 
    bg: 'bg-green-100 dark:bg-green-900', 
    text: 'text-green-700 dark:text-green-100' 
  },
  DISCHARGED: { 
    bg: 'bg-gray-100 dark:bg-gray-800', 
    text: 'text-gray-700 dark:text-gray-100' 
  },
  TEMPORARY: { 
    bg: 'bg-yellow-100 dark:bg-yellow-900', 
    text: 'text-yellow-700 dark:text-yellow-100' 
  },
  ADMITTED: { 
    bg: 'bg-blue-100 dark:bg-blue-900', 
    text: 'text-blue-700 dark:text-blue-100' 
  },
};