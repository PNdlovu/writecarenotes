/**
 * WriteCareNotes.com
 * @fileoverview Document Card Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface Document {
  title: string
  description: string
  format: string
  size: string
  category: string
  lastUpdated: string
}

export interface DocumentCardProps {
  document: Document
  onDownload?: () => void
} 