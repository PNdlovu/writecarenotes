import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '@/features/staff/types';

interface UploadDocumentData {
  files: File[];
  metadata: {
    title: string;
    description?: string;
    category: string;
    accessLevel: string;
    allowedUsers?: string[];
    expiryDate?: Date;
    tags?: string[];
  };
}

interface UpdateDocumentData {
  documentId: string;
  data: Partial<Document>;
}

export function useDocumentOperations(staffId: string) {
  const queryClient = useQueryClient();

  const uploadDocument = useMutation({
    mutationFn: async ({ files, metadata }: UploadDocumentData) => {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      formData.append('data', JSON.stringify(metadata));

      const response = await fetch(`/api/staff/${staffId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', staffId] });
    },
  });

  const updateDocument = useMutation({
    mutationFn: async ({ documentId, data }: UpdateDocumentData) => {
      const response = await fetch(`/api/staff/${staffId}/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', staffId] });
      queryClient.invalidateQueries({ queryKey: ['document', staffId, variables.documentId] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`/api/staff/${staffId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', staffId] });
    },
  });

  const signDocument = useMutation({
    mutationFn: async ({
      documentId,
      signatureType,
      comments,
    }: {
      documentId: string;
      signatureType: 'APPROVED' | 'REVIEWED' | 'SIGNED';
      comments?: string;
    }) => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}/signatures`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ signatureType, comments }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sign document');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', staffId, variables.documentId] });
    },
  });

  const restoreVersion = useMutation({
    mutationFn: async ({
      documentId,
      version,
    }: {
      documentId: string;
      version: number;
    }) => {
      const response = await fetch(
        `/api/staff/${staffId}/documents/${documentId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ version }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document', staffId, variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['document-versions', staffId, variables.documentId] });
    },
  });

  return {
    uploadDocument,
    updateDocument,
    deleteDocument,
    signDocument,
    restoreVersion,
  };
}


