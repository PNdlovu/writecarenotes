/**
 * @writecarenotes.com
 * @fileoverview Care level badge style variants
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Style variants and theme configurations for the CareLevelBadge component.
 * Features include:
 * - Responsive size variants
 * - Semantic color mapping
 * - Accessibility-friendly color contrast
 * - Consistent spacing scales
 * - Tailwind CSS integration
 */

import type { CareLevel } from "./types";

/**
 * Size variants for the badge component.
 * Follows a consistent spacing and typography scale.
 */
export const careLevelSizes = {
  sm: "text-xs px-2 py-0.5",   // Small: Compact size for dense layouts
  md: "text-sm px-2.5 py-0.5", // Medium: Default size for general use
  lg: "text-base px-3 py-1",   // Large: Enhanced visibility for emphasis
} as const;

/**
 * Color variants mapped to care levels.
 * Uses semantic colors with appropriate contrast ratios.
 */
export const careLevelColors: Record<CareLevel, string> = {
  LOW: "bg-green-100 text-green-800 border-green-300",     // Subtle green for low care needs
  MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-300", // Warm yellow for medium care needs
  HIGH: "bg-red-100 text-red-800 border-red-300",          // Attention-grabbing red for high care needs
} as const;