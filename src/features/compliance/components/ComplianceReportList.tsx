import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileIcon, DownloadIcon, EyeIcon } from "lucide-react"
import { format } from 'date-fns'

interface ComplianceReport {
  id: string
  title: string
  type: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedBy: string
  submittedDate: Date
  approvedBy?: string
  approvedDate?: Date
  downloadUrl: string
}

interface ComplianceReportListProps {
  reports: ComplianceReport[]
  onViewReport: (report: ComplianceReport) => void
  onDownloadReport: (report: ComplianceReport) => void
}

export function ComplianceReportList({ reports, onViewReport, onDownloadReport }: ComplianceReportListProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      submitted: "warning",
      approved: "success",
      rejected: "destructive"
    }
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted By</TableHead>
            <TableHead>Submitted Date</TableHead>
            <TableHead>Approved By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <FileIcon className="h-4 w-4" />
                  <span>{report.title}</span>
                </div>
              </TableCell>
              <TableCell>{report.type}</TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell>{report.submittedBy}</TableCell>
              <TableCell>{format(new Date(report.submittedDate), 'PPP')}</TableCell>
              <TableCell>{report.approvedBy || '-'}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewReport(report)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownloadReport(report)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
