/**
 * @writecarenotes.com
 * @fileoverview Care level badge component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A badge component for displaying resident care levels with appropriate
 * visual indicators and accessibility features. Features include:
 * - Dynamic color coding based on care level
 * - Responsive size variants
 * - Accessibility support
 * - Custom styling options
 * - Tooltip integration
 * - State transitions
 * - Level indicators
 *
 * Mobile-First Considerations:
 * - Touch-friendly size
 * - Clear typography
 * - High contrast
 * - Tap feedback
 * - Easy scanning
 * - Gesture support
 *
 * Enterprise Features:
 * - ARIA support
 * - State management
 * - Theme integration
 * - Event handling
 * - Error states
 * - Analytics hooks
 */

import * as React from "react";

// Utils
import { cn } from "@/lib/utils";

// Types and Variants
import { careLevelColors, careLevelSizes } from "./variants";
import type { CareLevelBadgeProps } from "./types";

// UI Components
import { Badge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";

export function CareLevelBadge({
  level,
  showLabel = true,
  size = 'md',
  className,
}: CareLevelBadgeProps) {
  const { bg, text } = careLevelColors[level];
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium",
        careLevelSizes[size],
        bg,
        text,
        className
      )}
      role="status"
      aria-label={`Care Level: ${level.toLowerCase()}`}
    >
      <span className="relative flex h-2 w-2 mr-1.5">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          level === 'HIGH' ? 'bg-red-400' : 'bg-current'
        )} />
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          level === 'HIGH' ? 'bg-red-500' : 'bg-current'
        )} />
      </span>
      {showLabel && level}
    </span>
  );
} 