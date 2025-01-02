/**
 * @writecarenotes.com
 * @fileoverview Dashboard shell component for consistent layout structure
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A layout wrapper component that provides consistent spacing and structure
 * for dashboard content. Implements a responsive grid layout with configurable
 * gaps and padding. Used as the primary container for dashboard pages.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-8 p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}