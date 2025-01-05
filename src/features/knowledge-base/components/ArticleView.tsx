/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base article view component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying a knowledge base article with version history
 * and feedback options.
 */

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { useArticle } from '../hooks/useArticle'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/Card'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { type KBArticle } from '@prisma/client'
import { VersionHistory } from './VersionHistory'

interface ArticleViewProps {
  article: KBArticle & {
    category?: {
      id: string
      name: string
      slug: string
    } | null
    author: {
      id: string
      name: string
      avatar: string | null
    }
  }
}

export function ArticleView({ article }: ArticleViewProps) {
  const { t } = useTranslation()
  const [showVersions, setShowVersions] = useState(false)
  const { updateArticle } = useArticle(article.id)

  const handleLike = async () => {
    await updateArticle({
      id: article.id,
      data: { likes: article.likes + 1 }
    })
  }

  return (
    <Card>
      <CardHeader>
        {/* Article Header */}
        <div className="space-y-4">
          {/* Category and Type */}
          <div className="flex items-center gap-2">
            {article.category && (
              <Link
                href={`/kb/categories/${article.category.slug}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {article.category.name}
              </Link>
            )}
            <span className="text-muted-foreground">•</span>
            <Badge variant="secondary">
              {t(`kb.types.${article.type.toLowerCase()}`)}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight">
            {article.title}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Author */}
            <div className="flex items-center gap-2">
              {article.author.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <Icons.user className="w-6 h-6" />
              )}
              <span>{article.author.name}</span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-1">
              <Icons.clock className="w-4 h-4" />
              {t('kb.metadata.lastUpdated', {
                time: formatDistanceToNow(article.updatedAt)
              })}
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-1">
              <Icons.book className="w-4 h-4" />
              {t('kb.metadata.readTime', {
                minutes: article.metadata.readTime
              })}
            </div>

            {/* Views */}
            <div className="flex items-center gap-1">
              <Icons.eye className="w-4 h-4" />
              {article.views}
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Article Content */}
        <div className="prose prose-slate max-w-none">
          <div
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        {/* Article Actions */}
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="flex items-center gap-2"
          >
            <Icons.thumbsUp className="w-4 h-4" />
            <span>{article.likes}</span>
          </Button>

          {/* Share Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href)
            }}
          >
            <Icons.share className="w-4 h-4" />
            {t('common.share')}
          </Button>
        </div>

        {/* Version History */}
        <Sheet open={showVersions} onOpenChange={setShowVersions}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Icons.history className="w-4 h-4 mr-2" />
              {t('kb.article.versions')}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{t('kb.article.versionHistory')}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <VersionHistory articleId={article.id} />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </CardFooter>
    </Card>
  )
}
