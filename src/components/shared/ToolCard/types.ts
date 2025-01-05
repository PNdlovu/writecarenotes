/**
 * WriteCareNotes.com
 * @fileoverview Tool Card Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { LucideIcon } from "lucide-react"

export interface Tool {
  title: string
  description: string
  category: string
  icon: LucideIcon
}

export interface ToolCardProps {
  tool: Tool
  onAccess?: () => void
} 