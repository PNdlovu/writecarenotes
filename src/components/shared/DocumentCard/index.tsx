/**
 * WriteCareNotes.com
 * @fileoverview Document Card Component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { Button } from "@/components/ui/Button/Button"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge/Badge"
import { FileText, Download } from "lucide-react"
import { DocumentCardProps } from "./types"

export function DocumentCard({ document, onDownload }: DocumentCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {document.title}
              </h3>
              <Badge variant="secondary">{document.category}</Badge>
            </div>
            <p className="mt-1 text-gray-600">
              {document.description}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {document.lastUpdated}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {document.format} • {document.size}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </Card>
  )
} 