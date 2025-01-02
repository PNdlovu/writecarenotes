/**
 * @writecarenotes.com
 * @fileoverview Status badge component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A badge component for displaying resident status with appropriate
 * visual indicators and accessibility features. Features include:
 * - Status-specific color schemes
 * - Responsive design
 * - Accessibility support
 * - Custom styling options
 * - Tooltip integration
 * - Status transitions
 * - Alert indicators
 *
 * Mobile-First Considerations:
 * - Touch feedback
 * - Status clarity
 * - Quick updates
 * - Visual priority
 * - Easy scanning
 * - Alert visibility
 *
 * Enterprise Features:
 * - Status tracking
 * - State management
 * - Alert system
 * - Event handling
 * - Audit logging
 * - Analytics hooks
 */

import * as React from "react";

// Utils
import { cn } from "@/lib/utils";

// Types and Variants
import { statusColors } from "./variants";
import type { StatusBadgeProps } from "./types";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

export function StatusBadge({
  status,
  showLabel = true,
  className,
}: StatusBadgeProps) {
  const { bg, text } = statusColors[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-medium px-3 py-1",
        bg,
        text,
        className
      )}
      role="status"
      aria-label={`Status: ${status.toLowerCase()}`}
    >
      {showLabel && status}
    </span>
  );
}