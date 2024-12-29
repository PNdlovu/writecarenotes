import React from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  DocumentIcon, 
  PhotoIcon, 
  MicrophoneIcon, 
  PaperClipIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import type { HandoverAttachment, AttachmentType } from '../../types/handover'

interface HandoverAttachmentsProps {
  sessionId: string
  attachments: HandoverAttachment[]
  onAddAttachment: (file: File, type: AttachmentType) => void
  onRemoveAttachment: (attachmentId: string) => void
}

const attachmentTypes: AttachmentType[] = ['DOCUMENT', 'IMAGE', 'VOICE', 'OTHER']

const AttachmentIcon = ({ type }: { type: AttachmentType }) => {
  switch (type) {
    case 'DOCUMENT':
      return <DocumentIcon className="h-5 w-5" />
    case 'IMAGE':
      return <PhotoIcon className="h-5 w-5" />
    case 'VOICE':
      return <MicrophoneIcon className="h-5 w-5" />
    default:
      return <PaperClipIcon className="h-5 w-5" />
  }
}

export const HandoverAttachments: React.FC<HandoverAttachmentsProps> = ({
  sessionId,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const { data: session } = useSession()
  const [selectedType, setSelectedType] = React.useState<AttachmentType>('DOCUMENT')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onAddAttachment(file, selectedType)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedType}
            onValueChange={(value: AttachmentType) => setSelectedType(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {attachmentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center space-x-2">
                    <AttachmentIcon type={type} />
                    <span>{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept={
              selectedType === 'IMAGE'
                ? 'image/*'
                : selectedType === 'VOICE'
                ? 'audio/*'
                : undefined
            }
          />
          <Button onClick={handleUploadClick}>Upload</Button>
        </div>
      </Card>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AttachmentIcon type={attachment.type} />
                  <div>
                    <p className="font-medium">{attachment.filename}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(attachment.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <Badge>{attachment.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </Button>
                  {attachment.uploadedById === session?.user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveAttachment(attachment.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
