/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base version history component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying and comparing different versions of an article.
 */

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { useArticle } from '../hooks/useArticle'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Icons } from '@/components/icons'
import { diffWords } from 'diff'

interface VersionHistoryProps {
  articleId: string
}

export function VersionHistory({ articleId }: VersionHistoryProps) {
  const { t } = useTranslation()
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const { versions = [], currentVersion, isLoading } = useArticle(articleId)

  const handleRevert = async (version: number) => {
    // Implement version revert logic
  }

  const renderDiff = (oldText: string, newText: string) => {
    const diff = diffWords(oldText, newText)

    return diff.map((part, index) => (
      <span
        key={index}
        className={cn(
          part.added && 'bg-green-500/20',
          part.removed && 'bg-red-500/20'
        )}
      >
        {part.value}
      </span>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Version List */}
      <div className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.version}
            className={cn(
              'p-4 border rounded-lg',
              version.version === currentVersion && 'border-primary'
            )}
          >
            {/* Version Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {t('kb.versions.version', { number: version.version })}
                </span>
                {version.version === currentVersion && (
                  <Badge variant="outline">
                    {t('kb.versions.current')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4">
                {/* Compare Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVersion(version.version)}
                    >
                      <Icons.diff className="w-4 h-4 mr-2" />
                      {t('kb.versions.compare')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>
                        {t('kb.versions.comparing', {
                          from: version.version,
                          to: currentVersion
                        })}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="h-[600px] mt-4">
                      <div className="space-y-6">
                        {/* Title Diff */}
                        <div className="space-y-2">
                          <h3 className="font-medium">
                            {t('kb.versions.titleChanges')}
                          </h3>
                          <div className="p-4 border rounded-lg">
                            {renderDiff(version.title, currentVersion.title)}
                          </div>
                        </div>

                        {/* Summary Diff */}
                        <div className="space-y-2">
                          <h3 className="font-medium">
                            {t('kb.versions.summaryChanges')}
                          </h3>
                          <div className="p-4 border rounded-lg">
                            {renderDiff(version.summary, currentVersion.summary)}
                          </div>
                        </div>

                        {/* Content Diff */}
                        <div className="space-y-2">
                          <h3 className="font-medium">
                            {t('kb.versions.contentChanges')}
                          </h3>
                          <div className="p-4 border rounded-lg prose prose-slate max-w-none">
                            {renderDiff(version.content, currentVersion.content)}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                {/* Revert Button */}
                {version.version !== currentVersion && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevert(version.version)}
                  >
                    <Icons.undo className="w-4 h-4 mr-2" />
                    {t('kb.versions.revert')}
                  </Button>
                )}
              </div>
            </div>

            {/* Version Metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {/* Author */}
              <div className="flex items-center gap-2">
                {version.author.avatar ? (
                  <img
                    src={version.author.avatar}
                    alt={version.author.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <Icons.user className="w-5 h-5" />
                )}
                <span>{version.author.name}</span>
              </div>

              {/* Created At */}
              <div className="flex items-center gap-1">
                <Icons.clock className="w-4 h-4" />
                {formatDistanceToNow(version.createdAt)}
              </div>
            </div>

            {/* Changes Summary */}
            {version.metadata.changes && (
              <div className="mt-2 text-sm">
                <h4 className="font-medium mb-1">
                  {t('kb.versions.changes')}
                </h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {version.metadata.changes.map((change: string, index: number) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
