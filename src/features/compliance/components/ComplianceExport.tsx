import { useState } from 'react'
import { Button } from "@/components/ui/Button/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/Dialog/Dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select/Select"
import { FileDownIcon } from "lucide-react"
import { useToast } from "@/components/ui/UseToast"
import { useTranslations } from 'next-intl'

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv'
  includeEvidence: boolean
  includeAuditHistory: boolean
  dateRange: 'all' | '30days' | '90days' | '1year'
}

export function ComplianceExport() {
  const t = useTranslations('compliance.export')
  const { toast } = useToast()
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeEvidence: true,
    includeAuditHistory: true,
    dateRange: 'all'
  })

  const handleExport = async () => {
    try {
      // TODO: Implement export functionality
      toast({
        title: t('exportStarted'),
        description: t('exportDescription'),
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('exportError'),
        description: error instanceof Error ? error.message : t('unknownError'),
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileDownIcon className="h-4 w-4" />
          {t('exportButton')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('exportTitle')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>{t('format')}</Label>
            <Select
              value={options.format}
              onValueChange={(value: ExportOptions['format']) =>
                setOptions({ ...options, format: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectFormat')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('dateRange')}</Label>
            <Select
              value={options.dateRange}
              onValueChange={(value: ExportOptions['dateRange']) =>
                setOptions({ ...options, dateRange: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('selectDateRange')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTime')}</SelectItem>
                <SelectItem value="30days">{t('last30Days')}</SelectItem>
                <SelectItem value="90days">{t('last90Days')}</SelectItem>
                <SelectItem value="1year">{t('lastYear')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="evidence"
                checked={options.includeEvidence}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeEvidence: checked as boolean })
                }
              />
              <Label htmlFor="evidence">{t('includeEvidence')}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auditHistory"
                checked={options.includeAuditHistory}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeAuditHistory: checked as boolean })
                }
              />
              <Label htmlFor="auditHistory">{t('includeAuditHistory')}</Label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleExport} className="w-full sm:w-auto">
            {t('startExport')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
