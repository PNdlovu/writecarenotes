import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Document
} from '@/features/staff/types';
import { formatDate } from '@/lib/utils';
import { Download, FileText, History, FileSignature } from 'lucide-react';

interface DocumentViewDialogProps {
  document: Document;
  onClose: () => void;
}

const DocumentViewDialog: React.FC<DocumentViewDialogProps> = ({
  document,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState('preview');

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.metadata?.originalName || document.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>{document.title}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {document.description}
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <FileSignature className="w-4 h-4 mr-2" />
                Sign
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList>
            <TabsTrigger value="preview">
              <FileText className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="h-[calc(100%-2rem)] mt-2">
            <iframe
              src={`${document.fileUrl}#toolbar=0`}
              className="w-full h-full border rounded-lg"
              title={document.title}
            />
          </TabsContent>

          <TabsContent value="details">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Document Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p>{document.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <Badge
                      variant="secondary"
                      className="mt-1"
                    >
                      {document.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Version</p>
                    <p>v{document.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Access Level</p>
                    <p>{document.accessLevel}</p>
                  </div>
                  {document.expiryDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expires On</p>
                      <p>{formatDate(document.expiryDate)}</p>
                    </div>
                  )}
                  {document.tags && document.tags.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {document.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {document.signatures && document.signatures.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium">Signatures</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {document.signatures.map((signature, index) => (
                        <TableRow key={index}>
                          <TableCell>{signature.name}</TableCell>
                          <TableCell>{signature.role}</TableCell>
                          <TableCell>{formatDate(signature.signedAt)}</TableCell>
                          <TableCell>{signature.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium">File Information</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Original Name</p>
                    <p>{document.metadata?.originalName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">File Type</p>
                    <p>{document.fileType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Size</p>
                    <p>{document.fileSize} bytes</p>
                  </div>
                  {document.metadata?.pages && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pages</p>
                      <p>{document.metadata.pages}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {document.auditTrail && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {document.auditTrail.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.action.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.userId}</TableCell>
                      <TableCell>{formatDate(entry.timestamp)}</TableCell>
                      <TableCell>{entry.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewDialog;


