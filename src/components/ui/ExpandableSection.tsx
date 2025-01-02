"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExpandableSectionProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function ExpandableSection({
  title,
  children,
  icon,
  defaultOpen = false,
  className,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault()
        setIsOpen(!isOpen)
        break
      case "ArrowDown":
        if (!isOpen) {
          event.preventDefault()
          setIsOpen(true)
        }
        break
      case "ArrowUp":
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
        }
        break
      case "Home":
        event.preventDefault()
        // Focus the first interactive element
        const firstFocusable = contentRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement
        firstFocusable?.focus()
        break
      case "End":
        event.preventDefault()
        // Focus the last interactive element
        const focusableElements = contentRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>
        const lastFocusable = focusableElements?.[focusableElements.length - 1]
        lastFocusable?.focus()
        break
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls="content"
        className={cn(
          "group relative w-full rounded-lg border bg-white p-4 text-left",
          "transition-all duration-200 ease-in-out",
          "hover:bg-slate-50 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
          "active:bg-slate-100",
          isOpen && "rounded-b-none border-b-0"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                "transition-colors duration-200",
                "text-slate-600 group-hover:text-indigo-600"
              )}>
                {icon}
              </div>
            )}
            <h3 className={cn(
              "text-lg font-semibold",
              "transition-colors duration-200",
              "text-slate-900 group-hover:text-indigo-700"
            )}>
              {title}
            </h3>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5",
              "transition-all duration-300 ease-in-out",
              "text-slate-500 group-hover:text-indigo-600",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>
      <div
        ref={contentRef}
        id="content"
        role="region"
        aria-labelledby="section-title"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className={cn(
          "rounded-b-lg border border-t-0 bg-white p-4",
          "transform transition-all duration-300",
          "shadow-inner",
          isOpen ? "translate-y-0" : "-translate-y-2"
        )}>
          {children}
        </div>
      </div>
    </div>
  )
}
