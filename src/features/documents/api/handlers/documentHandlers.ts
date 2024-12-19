import { DocumentService } from '../../services/documentService';
import { Document, DocumentFilter, DocumentMetadata } from '../../types';

const documentService = new DocumentService();

export const documentHandlers = {
  async createDocument(title: string, content: string, metadata: DocumentMetadata): Promise<Document> {
    return await documentService.createDocument(title, content, metadata);
  },

  async getDocument(id: string): Promise<Document> {
    return await documentService.getDocument(id);
  },

  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    return await documentService.updateDocument(id, updates);
  },

  async deleteDocument(id: string): Promise<void> {
    await documentService.deleteDocument(id);
  },

  async searchDocuments(filter: DocumentFilter): Promise<Document[]> {
    return await documentService.searchDocuments(filter);
  }
};


