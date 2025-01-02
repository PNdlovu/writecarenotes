/**
 * @writecarenotes.com
 * @fileoverview Pagination Component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Pagination component for navigating through pages
 */

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/Button/variants"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center space-x-2">
      <button
        className={buttonVariants({ variant: "outline", size: "icon" })}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button
        className={buttonVariants({ variant: "outline", size: "icon" })}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className={buttonVariants({ variant: "outline", size: "icon" })}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        className={buttonVariants({ variant: "outline", size: "icon" })}
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  )
} 