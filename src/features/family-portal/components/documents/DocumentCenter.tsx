import React, { useState } from 'react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Form/Input";
import { Badge } from "@/components/ui/Badge/Badge";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Label } from "@/components/ui/Form/Label";
import { Progress } from "@/components/ui/Progress/Progress";
import { FileText, Upload, Download, Search, Filter, Plus, Trash } from "lucide-react";

interface Document {
  id: string;
  title: string;
  type: DocumentType;
  category: DocumentCategory;
  uploadedBy: string;
  uploadedAt: Date;
  size: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  tags: string[];
  url: string;
}

type DocumentType = 'CONSENT' | 'MEDICAL' | 'FINANCIAL' | 'REPORT' | 'OTHER';
type DocumentCategory = 'CARE_PLAN' | 'ASSESSMENTS' | 'MEDICATIONS' | 'LEGAL' | 'GENERAL';

interface DocumentCenterProps {
  residentId: string;
  familyMemberId: string;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({
  residentId,
  familyMemberId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // Mock data - replace with actual API calls
  const documents: Document[] = [
    {
      id: '1',
      title: 'Care Plan 2024',
      type: 'MEDICAL',
      category: 'CARE_PLAN',
      uploadedBy: 'Jane Doe',
      uploadedAt: new Date(),
      size: 1024 * 1024 * 2.5, // 2.5MB
      status: 'APPROVED',
      tags: ['care', 'plan', '2024'],
      url: '#'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Document Center</h2>
          <p className="text-muted-foreground">
            Manage and access important documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value: DocumentCategory | 'ALL') => setSelectedCategory(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="CARE_PLAN">Care Plan</SelectItem>
            <SelectItem value="ASSESSMENTS">Assessments</SelectItem>
            <SelectItem value="MEDICATIONS">Medications</SelectItem>
            <SelectItem value="LEGAL">Legal</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="shared">Shared with Me</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="p-2 bg-secondary rounded-lg">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{doc.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Uploaded by {doc.uploadedBy} • {formatFileSize(doc.size)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge>{doc.type}</Badge>
                          <Badge variant="outline">{doc.category}</Badge>
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Upload className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="mr-2 h-4 w-4" />
                          Add to Favorites
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="shared">
          {/* Shared documents content */}
        </TabsContent>

        <TabsContent value="recent">
          {/* Recent documents content */}
        </TabsContent>

        <TabsContent value="favorites">
          {/* Favorite documents content */}
        </TabsContent>
      </Tabs>

      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the document center
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Title</Label>
              <Input placeholder="Enter document title" />
            </div>
            <div>
              <Label>Category</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CARE_PLAN">Care Plan</SelectItem>
                  <SelectItem value="ASSESSMENTS">Assessments</SelectItem>
                  <SelectItem value="MEDICATIONS">Medications</SelectItem>
                  <SelectItem value="LEGAL">Legal</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <Input placeholder="Enter tags (comma separated)" />
            </div>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2">Drag and drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </p>
            </div>
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


