'use client';

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Editor } from '@tinymce/tinymce-react';
import { Document } from '@prisma/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/useToast';
import { DocumentToolbar } from './DocumentToolbar';
import { DocumentMetadata } from './DocumentMetadata';
import { DocumentVersionHistory } from './DocumentVersionHistory';
import { DocumentSharingDialog } from './DocumentSharingDialog';
import { DocumentSecurityDialog } from './DocumentSecurityDialog';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface DocumentViewerProps {
  documentId: string;
  readOnly?: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  readOnly = false,
}) => {
  const { t } = useTranslation('documents');
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSharingDialog, setShowSharingDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch document data
  const { data: document, isLoading } = useQuery(
    ['document', documentId],
    async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      return response.json();
    }
  );

  // Update document mutation
  const updateDocument = useMutation(
    async (data: Partial<Document>) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update document');
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['document', documentId]);
        showToast(t('documentSaved'), 'success');
        setIsEditing(false);
      },
      onError: (error) => {
        showToast(t('errorSavingDocument'), 'error');
      },
    }
  );

  // Delete document mutation
  const deleteDocument = useMutation(
    async () => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
    },
    {
      onSuccess: () => {
        showToast(t('documentDeleted'), 'success');
        // Handle navigation after delete
      },
      onError: (error) => {
        showToast(t('errorDeletingDocument'), 'error');
      },
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <p className="text-gray-600">{t('documentNotFound')}</p>
      </div>
    );
  }

  const handleSave = async (content: string) => {
    await updateDocument.mutateAsync({ content });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="space-y-4">
        {/* Document Toolbar */}
        <DocumentToolbar>
          {!readOnly && (
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={isEditing ? t('save') : t('edit')}
              onClick={() => isEditing ? handleSave(document.content) : setIsEditing(true)}
            >
              {isEditing ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )}
            </button>
          )}
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t('versionHistory')}
            onClick={() => setShowVersionHistory(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t('security')}
            onClick={() => setShowSecurityDialog(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title={t('share')}
            onClick={() => setShowSharingDialog(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
          {!readOnly && (
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-red-600"
              title={t('delete')}
              onClick={() => setShowDeleteDialog(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </DocumentToolbar>

        {/* Document Metadata */}
        <DocumentMetadata document={document} />
        <hr className="border-gray-200" />

        {/* Document Content */}
        <div className="min-h-[400px]">
          {isEditing ? (
            <Editor
              initialValue={document.content}
              init={{
                height: 400,
                menubar: true,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help',
              }}
              onEditorChange={(content) => document.content = content}
            />
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: document.content }} 
            />
          )}
        </div>

        {/* Dialogs */}
        <DocumentVersionHistory
          documentId={documentId}
          open={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
        />
        <DocumentSharingDialog
          document={document}
          open={showSharingDialog}
          onClose={() => setShowSharingDialog(false)}
        />
        <DocumentSecurityDialog
          document={document}
          open={showSecurityDialog}
          onClose={() => setShowSecurityDialog(false)}
        />
        <ConfirmDialog
          open={showDeleteDialog}
          title={t('confirmDelete')}
          message={t('confirmDeleteMessage')}
          onConfirm={() => deleteDocument.mutate()}
          onClose={() => setShowDeleteDialog(false)}
        />
      </div>
    </div>
  );
};


