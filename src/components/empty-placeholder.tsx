/**
 * @writecarenotes.com
 * @fileoverview Empty state placeholder component with customizable content
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A reusable empty state component that provides a consistent way to display
 * placeholder content when no data is available. Features include customizable
 * icons, titles, descriptions, and animations. Supports compound components
 * pattern for flexible content composition.
 */

import * as React from "react"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyPlaceholder({
  className,
  children,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

interface EmptyPlaceholderIconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  name?: string
}

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({
  name,
  className,
  ...props
}: EmptyPlaceholderIconProps) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
      <FileText className={cn("h-10 w-10", className)} {...props} />
    </div>
  )
}

interface EmptyPlaceholderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({
  className,
  ...props
}: EmptyPlaceholderTitleProps) {
  return (
    <h2 className={cn("mt-6 text-xl font-semibold", className)} {...props} />
  )
}

interface EmptyPlaceholderDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlaceholderDescriptionProps) {
  return (
    <p
      className={cn(
        "mb-8 mt-2 text-center text-sm font-normal leading-6 text-slate-700",
        className
      )}
      {...props}
    />
  )
}