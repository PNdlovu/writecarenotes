import { useState, useCallback } from 'react';
import { Document, DocumentFilter } from '../types';
import { documentHandlers } from '../api/handlers/documentHandlers';

export function useDocument(initialDocument?: Document) {
  const [document, setDocument] = useState<Document | null>(initialDocument ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDocument = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const doc = await documentHandlers.getDocument(id);
      setDocument(doc);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>) => {
    setLoading(true);
    try {
      const updatedDoc = await documentHandlers.updateDocument(id, updates);
      setDocument(updatedDoc);
      setError(null);
      return updatedDoc;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    document,
    loading,
    error,
    fetchDocument,
    updateDocument
  };
}


