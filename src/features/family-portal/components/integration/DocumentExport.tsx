/**
 * @fileoverview Document Export Component
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Export documents and reports to various formats
 */

import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAccessibility } from '../../hooks/useAccessibility';

interface DocumentExportProps {
  residentId: string;
  familyMemberId: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  dateCreated: Date;
  size: number;
  format: string;
  exportFormats: string[];
}

interface ExportJob {
  id: string;
  documentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  targetFormat: string;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

export const DocumentExport: React.FC<DocumentExportProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Care Plan Report',
      type: 'report',
      dateCreated: new Date(),
      size: 1024,
      format: 'pdf',
      exportFormats: ['docx', 'pdf', 'csv']
    },
    {
      id: '2',
      title: 'Medical Records',
      type: 'medical',
      dateCreated: new Date(),
      size: 2048,
      format: 'pdf',
      exportFormats: ['pdf', 'csv']
    }
  ]);

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const { toast } = useToast();
  const { getAriaProps } = useAccessibility();

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const exportDocuments = async () => {
    try {
      const newJobs = selectedDocuments.map(docId => ({
        id: Math.random().toString(36).substr(2, 9),
        documentId: docId,
        status: 'pending' as const,
        targetFormat: selectedFormat,
        startTime: new Date(),
      }));

      setExportJobs(prev => [...prev, ...newJobs]);
      setShowExportDialog(false);

      // Simulate export process
      for (const job of newJobs) {
        await processExportJob(job);
      }

      toast({
        title: "Export Complete",
        description: `Successfully exported ${selectedDocuments.length} documents`,
      });

      setSelectedDocuments([]);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export documents",
        variant: "destructive"
      });
    }
  };

  const processExportJob = async (job: ExportJob) => {
    // Simulate export processing
    setExportJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, status: 'processing' } : j
    ));

    await new Promise(resolve => setTimeout(resolve, 2000));

    setExportJobs(prev => prev.map(j =>
      j.id === job.id ? {
        ...j,
        status: 'completed',
        endTime: new Date()
      } : j
    ));
  };

  const getExportFormatOptions = () => {
    const formats = new Set<string>();
    selectedDocuments.forEach(docId => {
      const doc = documents.find(d => d.id === docId);
      doc?.exportFormats.forEach(format => formats.add(format));
    });
    return Array.from(formats);
  };

  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Export</h2>
          <p className="text-muted-foreground">
            Export and download documents in various formats
          </p>
        </div>
        <Button
          onClick={() => setShowExportDialog(true)}
          disabled={selectedDocuments.length === 0}
        >
          Export Selected
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Document List */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Available Documents</h3>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedDocuments.includes(doc.id)}
                    onCheckedChange={() => handleDocumentSelect(doc.id)}
                  />
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.dateCreated.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge>{doc.format.toUpperCase()}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span>Size: {formatFileSize(doc.size)}</span>
                      <span className="mx-2">•</span>
                      <span>Type: {doc.type}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm">
                        Available formats: {doc.exportFormats.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Export Jobs */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Export History</h3>
          <div className="space-y-4">
            {exportJobs.map((job) => (
              <div key={job.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">
                      {documents.find(d => d.id === job.documentId)?.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Target format: {job.targetFormat.toUpperCase()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Started: {job.startTime.toLocaleString()}
                    </p>
                    {job.endTime && (
                      <p className="text-sm text-muted-foreground">
                        Completed: {job.endTime.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={
                    job.status === 'completed' ? 'default' :
                    job.status === 'processing' ? 'secondary' :
                    job.status === 'pending' ? 'outline' :
                    'destructive'
                  }>
                    {job.status}
                  </Badge>
                </div>
                {job.error && (
                  <p className="text-sm text-destructive mt-2">
                    Error: {job.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Documents</DialogTitle>
            <DialogDescription>
              Choose export format for selected documents
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Selected Documents ({selectedDocuments.length})
              </label>
              <div className="mt-2 space-y-2">
                {selectedDocuments.map(docId => {
                  const doc = documents.find(d => d.id === docId);
                  return (
                    <div key={docId} className="text-sm text-muted-foreground">
                      {doc?.title}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Export Format</label>
              <Select
                value={selectedFormat}
                onValueChange={setSelectedFormat}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  {getExportFormatOptions().map(format => (
                    <SelectItem key={format} value={format}>
                      {format.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={exportDocuments}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


