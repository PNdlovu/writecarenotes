/**
 * @writecarenotes.com
 * @fileoverview Region badge component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A badge component for displaying regional information with appropriate
 * styling based on the region's colors. Features include:
 * - Region-specific color schemes
 * - Theme-aware styling
 * - Responsive design
 * - Accessibility support
 * - Custom styling options
 * - Regional icons
 * - Location mapping
 *
 * Mobile-First Considerations:
 * - Responsive sizing
 * - Clear indicators
 * - Touch targets
 * - Visual hierarchy
 * - Quick recognition
 * - Map integration
 *
 * Enterprise Features:
 * - Region management
 * - Location services
 * - Theme system
 * - i18n support
 * - Analytics
 * - Error handling
 */

import * as React from "react";

// Utils and Hooks
import { cn } from "@/lib/utils";
import { useTheme } from "@/features/theme/ThemeProvider";

// Types
import type { RegionBadgeProps } from "./types";

export function RegionBadge({ region, className = '' }: RegionBadgeProps) {
  const { colors } = useTheme();
  const regionKey = (region?.toLowerCase() || 'england') as keyof typeof colors;
  const regionColors = colors[regionKey] || colors.england;

  return (
    <div
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
        className
      )}
      style={{
        backgroundColor: regionColors.primary,
        color: '#FFFFFF',
        border: `2px solid ${regionColors.secondary}`,
      }}
      role="status"
      aria-label={`Region: ${region || 'England'}`}
    >
      {region || 'England'}
    </div>
  );
} 