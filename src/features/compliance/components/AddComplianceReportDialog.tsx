import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"

interface AddComplianceReportDialogProps {
  onSubmit: (data: ComplianceReportData) => Promise<void>
}

interface ComplianceReportData {
  title: string
  type: string
  description: string
  files: File[]
}

const reportTypes = [
  { value: 'inspection', label: 'Inspection Report' },
  { value: 'audit', label: 'Audit Report' },
  { value: 'incident', label: 'Incident Report' },
  { value: 'review', label: 'Review Report' }
]

export function AddComplianceReportDialog({ onSubmit }: AddComplianceReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ComplianceReportData>({
    title: '',
    type: '',
    description: '',
    files: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      await onSubmit(data)
      setOpen(false)
      setData({ title: '', type: '', description: '', files: [] })
    } catch (error) {
      console.error('Failed to submit report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Compliance Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Report Title</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Report Type</Label>
            <Select
              value={data.type}
              onValueChange={(value) => setData({ ...data, type: value })}
              required
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Supporting Documents</Label>
            <FileUpload
              onFilesSelected={(files) => setData({ ...data, files })}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              multiple
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
