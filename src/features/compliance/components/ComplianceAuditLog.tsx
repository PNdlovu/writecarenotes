import { useState } from 'react'
import { Card } from "@/components/ui/Card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge/Badge"
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

interface AuditLogEntry {
  id: string
  action: 'created' | 'updated' | 'deleted' | 'viewed' | 'exported'
  entityType: 'report' | 'document' | 'requirement'
  entityId: string
  entityName: string
  userId: string
  userName: string
  userAvatar?: string
  timestamp: Date
  details?: Record<string, any>
}

interface ComplianceAuditLogProps {
  entries: AuditLogEntry[]
}

export function ComplianceAuditLog({ entries }: ComplianceAuditLogProps) {
  const t = useTranslations('compliance.auditLog')

  const getActionColor = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800'
      case 'updated':
        return 'bg-blue-100 text-blue-800'
      case 'deleted':
        return 'bg-red-100 text-red-800'
      case 'exported':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderDetails = (details?: Record<string, any>) => {
    if (!details) return null

    return (
      <div className="mt-2 text-sm text-gray-500">
        {Object.entries(details).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="font-medium">{key}:</span>
            <span>{JSON.stringify(value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex gap-4 pb-4 border-b last:border-0">
              <Avatar className="w-8 h-8">
                {entry.userAvatar ? (
                  <img src={entry.userAvatar} alt={entry.userName} />
                ) : (
                  <span className="text-xs">{entry.userName.slice(0, 2).toUpperCase()}</span>
                )}
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{entry.userName}</span>
                  <Badge
                    variant="secondary"
                    className={getActionColor(entry.action)}
                  >
                    {t(`actions.${entry.action}`)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {entry.entityType} "{entry.entityName}"
                  </span>
                </div>
                
                {renderDetails(entry.details)}
                
                <div className="text-sm text-gray-500 mt-1">
                  {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
