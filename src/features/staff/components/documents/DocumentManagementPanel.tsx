import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge/Badge';
import {
  FileText,
  Upload,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  Trash2,
  History,
  FileSignature,
  Plus,
} from 'lucide-react';
import { Document, DocumentCategory, DocumentStatus } from '@/features/staff/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import DocumentUploadDialog from '../../features/documents/components/DocumentUploadDialog';
import DocumentViewDialog from '../../features/documents/components/DocumentViewDialog';
import DocumentTemplateDialog from '../../features/documents/components/DocumentTemplateDialog';

interface DocumentManagementPanelProps {
  staffId: string;
}

const DocumentManagementPanel: React.FC<DocumentManagementPanelProps> = ({
  staffId,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['staffDocuments', staffId],
    queryFn: async () => {
      const response = await fetch(`/api/staff/${staffId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  const getStatusColor = (status: DocumentStatus) => {
    const colors = {
      DRAFT: 'bg-gray-500',
      PENDING_REVIEW: 'bg-yellow-500',
      APPROVED: 'bg-green-500',
      ARCHIVED: 'bg-red-500',
      EXPIRED: 'bg-orange-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case DocumentCategory.CLINICAL:
        return '';
      case DocumentCategory.ADMINISTRATIVE:
        return '';
      case DocumentCategory.TRAINING:
        return '';
      case DocumentCategory.POLICY:
        return '';
      case DocumentCategory.INCIDENT:
        return '';
      case DocumentCategory.PERFORMANCE:
        return '';
      case DocumentCategory.PERSONAL:
        return '';
      default:
        return '';
    }
  };

  const filteredDocuments = documents?.filter((doc) => {
    if (activeTab === 'all') return true;
    return doc.category.toLowerCase() === activeTab;
  });

  const handleDownload = async (document: Document) => {
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Management</h2>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateDialog(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Use Template
          </Button>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="clinical">Clinical</TabsTrigger>
          <TabsTrigger value="administrative">Admin</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="incident">Incident</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
        </TabsList>

        <Card className="mt-4">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments?.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{getCategoryIcon(doc.category)}</span>
                        <span>{doc.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>v{doc.version}</TableCell>
                    <TableCell>{formatDate(doc.updatedAt || doc.createdAt)}</TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDocument(doc);
                              setShowViewDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(doc)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          {doc.status !== DocumentStatus.ARCHIVED && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileSignature className="w-4 h-4 mr-2" />
                                Sign
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <History className="w-4 h-4 mr-2" />
                                History
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>

      {showUploadDialog && (
        <DocumentUploadDialog
          staffId={staffId}
          onClose={() => setShowUploadDialog(false)}
        />
      )}

      {showViewDialog && selectedDocument && (
        <DocumentViewDialog
          document={selectedDocument}
          onClose={() => {
            setShowViewDialog(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {showTemplateDialog && (
        <DocumentTemplateDialog
          staffId={staffId}
          onClose={() => setShowTemplateDialog(false)}
        />
      )}
    </div>
  );
};

export default DocumentManagementPanel;


