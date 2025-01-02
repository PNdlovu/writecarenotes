/**
 * @writecarenotes.com
 * @fileoverview Dashboard header component with flexible content layout
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A reusable header component for dashboard pages that provides a consistent
 * layout for page titles, descriptions, and optional action items. Features
 * flexible content composition through children props and responsive design.
 */

import * as React from "react"

interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({
  heading,
  text,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-wide">{heading}</h1>
        {text && <p className="text-neutral-500">{text}</p>}
      </div>
      {children}
    </div>
  )
}