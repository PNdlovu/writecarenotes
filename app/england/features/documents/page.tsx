'use client';

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle, FileText, Download, Eye, Calendar, User2 } from "lucide-react";

const documents = [
  {
    id: "DOC001",
    title: "Care Plan Review",
    type: "Care Documentation",
    resident: "John Smith",
    createdBy: "Sarah Wilson RN",
    createdDate: "2023-12-10",
    lastModified: "2023-12-10",
    status: "Final",
    size: "256 KB",
    format: "PDF"
  },
  {
    id: "DOC002",
    title: "Medical Assessment Report",
    type: "Medical Records",
    resident: "Mary Johnson",
    createdBy: "Dr. Michael Brown",
    createdDate: "2023-12-12",
    lastModified: "2023-12-14",
    status: "Draft",
    size: "1.2 MB",
    format: "DOCX"
  },
  {
    id: "DOC003",
    title: "Incident Report",
    type: "Incident Reports",
    resident: "Robert Wilson",
    createdBy: "Emma Thompson RN",
    createdDate: "2023-12-14",
    lastModified: "2023-12-14",
    status: "Under Review",
    size: "512 KB",
    format: "PDF"
  },
  {
    id: "DOC004",
    title: "Medication Chart",
    type: "Medical Records",
    resident: "Patricia Brown",
    createdBy: "Lisa Anderson",
    createdDate: "2023-12-15",
    lastModified: "2023-12-15",
    status: "Final",
    size: "845 KB",
    format: "PDF"
  },
];

const documentTypes = [
  { value: "all", label: "All Types" },
  { value: "care-documentation", label: "Care Documentation" },
  { value: "medical-records", label: "Medical Records" },
  { value: "incident-reports", label: "Incident Reports" },
  { value: "assessments", label: "Assessments" },
  { value: "care-plans", label: "Care Plans" },
  { value: "policies", label: "Policies & Procedures" }
];

export default function DocumentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Documents</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search documents..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">Filter</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Resident</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{doc.title}</div>
                      <div className="text-sm text-muted-foreground">{doc.format}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.resident}</TableCell>
                <TableCell>
                  <div>
                    <div>{doc.createdDate}</div>
                    <div className="text-sm text-muted-foreground">by {doc.createdBy}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${doc.status === 'Final' ? 'bg-green-100 text-green-700' : 
                    doc.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-blue-100 text-blue-700'}`}>
                    {doc.status}
                  </div>
                </TableCell>
                <TableCell>{doc.size}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
