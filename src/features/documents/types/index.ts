/**
 * WriteCareNotes.com
 * @fileoverview Document Feature Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import type {
  Document as CoreDocument,
  DocumentMetadata as CoreDocumentMetadata,
  DocumentSecurity,
  DocumentPermissions,
  DocumentStats,
  DocumentVersion,
  DocumentShare,
  DocumentAction
} from '@/types/documents';

// Re-export core types
export type {
  CoreDocument as Document,
  CoreDocumentMetadata as DocumentMetadata,
  DocumentSecurity,
  DocumentPermissions,
  DocumentStats,
  DocumentVersion,
  DocumentShare,
  DocumentAction
};

// Feature-specific types
export type DocumentFilter = {
  searchTerm?: string;
  tags?: string[];
  securityLevel?: DocumentSecurity['isEncrypted'];
  category?: string;
  status?: CoreDocumentMetadata['status'];
  dateRange?: {
    start: Date;
    end: Date;
  };
};


