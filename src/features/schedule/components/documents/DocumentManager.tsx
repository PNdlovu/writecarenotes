import React, { useState, useCallback } from 'react';
import { HandoverAttachment, Staff } from '../../types/handover';
import { Button, Card, Icon, Input, Modal } from '@/components/ui';
import { useHandoverSession } from '../../hooks/useHandoverSession';
import { useDropzone } from 'react-dropzone';

interface DocumentManagerProps {
  sessionId: string;
  attachments: HandoverAttachment[];
  currentStaff: Staff;
  onAttachmentAdd: (attachment: Omit<HandoverAttachment, 'id'>) => Promise<void>;
  onAttachmentRemove: (attachmentId: string) => Promise<void>;
}

const ALLOWED_FILE_TYPES = {
  'application/pdf': ['pdf'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'text/plain': ['txt'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  sessionId,
  attachments,
  currentStaff,
  onAttachmentAdd,
  onAttachmentRemove,
}) => {
  const [selectedFile, setSelectedFile] = useState<HandoverAttachment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { addAttachment } = useHandoverSession(sessionId);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        // In a real implementation, this would upload to your storage service
        const url = await uploadFile(file);
        
        await onAttachmentAdd({
          name: file.name,
          type: file.type,
          url,
          size: file.size,
          uploadedBy: currentStaff,
          uploadedAt: new Date(),
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        // Show error notification
      }
    }
  }, [onAttachmentAdd, currentStaff]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ALLOWED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  const filteredAttachments = attachments.filter(attachment =>
    attachment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedAttachments = filteredAttachments.reduce((acc, attachment) => {
    const type = attachment.type.split('/')[0];
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(attachment);
    return acc;
  }, {} as Record<string, HandoverAttachment[]>);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    const icons = {
      'application/pdf': '📄',
      'image': '🖼️',
      'application/msword': '📝',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
      'text/plain': '📝',
    };
    return icons[type] || '📎';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          type="search"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <Button variant="primary">
          Upload Documents
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <Icon name="upload" className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-gray-600">
            {isDragActive
              ? 'Drop the files here...'
              : 'Drag and drop files here, or click to select files'}
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: PDF, Word, Images (max 10MB)
          </p>
        </div>
      </div>

      {Object.entries(groupedAttachments).map(([type, files]) => (
        <div key={type} className="space-y-2">
          <h3 className="font-medium text-gray-700 capitalize">{type}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(attachment => (
              <Card
                key={attachment.id}
                className="p-4 hover:shadow-md transition-shadow"
                onClick={() => setSelectedFile(attachment)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getFileIcon(attachment.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{attachment.name}</div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div>{formatFileSize(attachment.size)}</div>
                      <div>Uploaded by {attachment.uploadedBy.name}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation();
                      onAttachmentRemove(attachment.id);
                    }}
                  >
                    <Icon name="trash" className="w-4 h-4 text-gray-500" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Modal
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        title={selectedFile?.name || ''}
      >
        {selectedFile && (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {selectedFile.type.startsWith('image') ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-6xl">{getFileIcon(selectedFile.type)}</div>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Size:</span>{' '}
                {formatFileSize(selectedFile.size)}
              </div>
              <div>
                <span className="font-medium">Type:</span> {selectedFile.type}
              </div>
              <div>
                <span className="font-medium">Uploaded by:</span>{' '}
                {selectedFile.uploadedBy.name}
              </div>
              <div>
                <span className="font-medium">Upload date:</span>{' '}
                {new Date(selectedFile.uploadedAt).toLocaleString()}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => window.open(selectedFile.url, '_blank')}
              >
                Download
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onAttachmentRemove(selectedFile.id);
                  setSelectedFile(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// This would be implemented to handle actual file uploads
async function uploadFile(file: File): Promise<string> {
  // Implementation would upload to your storage service
  return URL.createObjectURL(file); // Temporary for demo
}
