import React, { createContext, useContext, useState, useCallback } from 'react';
import { Document, DocumentFilter } from '../types';
import { documentHandlers } from '../api/handlers/documentHandlers';

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  error: Error | null;
  fetchDocuments: (filter?: DocumentFilter) => Promise<void>;
  createDocument: (title: string, content: string) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocuments = useCallback(async (filter?: DocumentFilter) => {
    setLoading(true);
    try {
      const docs = await documentHandlers.searchDocuments(filter || {});
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createDocument = useCallback(async (title: string, content: string) => {
    const metadata = { version: '1.0', tags: [], securityLevel: 'INTERNAL' };
    const doc = await documentHandlers.createDocument(title, content, metadata);
    setDocuments(prev => [...prev, doc]);
    return doc;
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    const updatedDoc = await documentHandlers.updateDocument(id, updates);
    setDocuments(prev => prev.map(doc => doc.id === id ? updatedDoc : doc));
    return updatedDoc;
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    await documentHandlers.deleteDocument(id);
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const value = {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocumentContext() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
}


