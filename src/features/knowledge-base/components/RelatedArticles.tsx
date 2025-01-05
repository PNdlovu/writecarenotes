/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base related articles component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying articles related to the current article.
 */

import { useTranslation } from '@/i18n'
import { useArticle } from '../hooks/useArticle'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Icons } from '@/components/icons'
import Link from 'next/link'

interface RelatedArticlesProps {
  currentArticleId: string
  categoryId?: string | null
  tags: string[]
}

export function RelatedArticles({
  currentArticleId,
  categoryId,
  tags
}: RelatedArticlesProps) {
  const { t } = useTranslation()
  const { articles = [], isLoading } = useArticle({
    categoryId,
    tags,
    exclude: [currentArticleId],
    limit: 5
  })

  if (articles.length === 0) {
    return null
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t('kb.article.related')}
        </h2>

        <div className="space-y-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/kb/${article.slug}`}
              className="block group"
            >
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-primary/10 text-primary mt-1">
                  <Icons.fileText className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium group-hover:text-primary line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icons.eye className="w-3 h-3" />
                      {article.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icons.thumbsUp className="w-3 h-3" />
                      {article.likes}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Card>
  )
}
