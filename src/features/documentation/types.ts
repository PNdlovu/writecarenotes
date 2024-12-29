/**
 * WriteCareNotes.com
 * @fileoverview Documentation Feature Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface Document {
  id: string
  title: string
  description: string
  icon: string
  href: string
  lastUpdated?: string
  status?: "draft" | "published" | "archived"
  version?: string
  author?: string
}

export interface Tool {
  id: string
  title: string
  description: string
  icon: string
  href: string
  category: "assessment" | "planning" | "review" | "report"
  lastUsed?: string
  status?: "active" | "inactive" | "maintenance"
}

export interface DocumentSection {
  title: string
  description: string
  documents: Document[]
}

export interface ToolSection {
  title: string
  description: string
  tools: Tool[]
} 