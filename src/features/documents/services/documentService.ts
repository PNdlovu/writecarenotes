/**
 * WriteCareNotes.com
 * @fileoverview Document Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import type { 
  Document, 
  DocumentMetadata, 
  DocumentSecurity, 
  DocumentAction,
  DocumentFilter 
} from '../types';
import { ApiError } from '@/lib/errors';
import { auditService } from '@/lib/audit';
import { validateDocument } from '../utils/validation';
import { DocumentRepository } from './repositories/documentRepository';

export class DocumentService {
  private static instance: DocumentService;
  private repository: DocumentRepository;

  private constructor() {
    this.repository = new DocumentRepository();
  }

  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  async createDocument(
    metadata: Omit<DocumentMetadata, 'id' | 'createdAt' | 'updatedAt'>,
    content: string,
    security?: Partial<DocumentSecurity>
  ): Promise<Document> {
    try {
      // Validate document data
      const validation = validateDocument({ metadata, content });
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Create document
      const document = await this.repository.create({
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        content,
        security: {
          isEncrypted: security?.isEncrypted ?? false,
          trackDownloads: security?.trackDownloads ?? true,
          ...security
        }
      });

      // Audit trail
      await auditService.log({
        action: 'DOCUMENT_CREATED',
        resourceId: document.id,
        details: {
          title: document.metadata.title,
          category: document.metadata.category
        }
      });

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to create document');
    }
  }

  async getDocument(id: string): Promise<Document> {
    try {
      const document = await this.repository.findById(id);
      if (!document) {
        throw new ApiError('NotFoundError', 'Document not found');
      }
      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to fetch document');
    }
  }

  async updateDocument(
    id: string, 
    updates: Partial<Document>
  ): Promise<Document> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing) {
        throw new ApiError('NotFoundError', 'Document not found');
      }

      // Validate updates
      const validation = validateDocument({ 
        metadata: { ...existing.metadata, ...updates.metadata },
        content: updates.content ?? existing.content
      });
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Update document
      const document = await this.repository.update(id, {
        ...updates,
        metadata: {
          ...updates.metadata,
          updatedAt: new Date().toISOString()
        }
      });

      // Audit trail
      await auditService.log({
        action: 'DOCUMENT_UPDATED',
        resourceId: document.id,
        details: {
          updates: Object.keys(updates)
        }
      });

      return document;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to update document');
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const document = await this.repository.findById(id);
      if (!document) {
        throw new ApiError('NotFoundError', 'Document not found');
      }

      await this.repository.delete(id);

      // Audit trail
      await auditService.log({
        action: 'DOCUMENT_DELETED',
        resourceId: id,
        details: {
          title: document.metadata.title
        }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to delete document');
    }
  }

  async searchDocuments(filter: DocumentFilter): Promise<Document[]> {
    try {
      return this.repository.search(filter);
    } catch (error) {
      throw new ApiError('InternalError', 'Failed to search documents');
    }
  }

  async performAction(id: string, action: DocumentAction): Promise<void> {
    try {
      const document = await this.repository.findById(id);
      if (!document) {
        throw new ApiError('NotFoundError', 'Document not found');
      }

      switch (action.type) {
        case 'VIEW':
          await this.repository.incrementStats(id, 'viewCount');
          break;
        case 'DOWNLOAD':
          if (document.security.trackDownloads) {
            await this.repository.incrementStats(id, 'downloadCount');
          }
          break;
        case 'SHARE':
          await this.repository.addShare(id, action.shareWith, action.permission);
          break;
        case 'ARCHIVE':
          await this.updateDocument(id, {
            metadata: { ...document.metadata, status: 'ARCHIVED' }
          });
          break;
        case 'RESTORE':
          await this.updateDocument(id, {
            metadata: { ...document.metadata, status: 'PUBLISHED' }
          });
          break;
      }

      // Audit trail
      await auditService.log({
        action: `DOCUMENT_${action.type}`,
        resourceId: id,
        details: action
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', `Failed to perform action: ${action.type}`);
    }
  }
}


