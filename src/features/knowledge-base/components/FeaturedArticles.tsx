/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base featured articles component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying featured knowledge base articles.
 */

import { useTranslation } from '@/i18n'
import { useArticle } from '../hooks/useArticle'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/icons'
import Link from 'next/link'

export function FeaturedArticles() {
  const { t } = useTranslation()
  const { articles = [], isLoading } = useArticle({
    featured: true,
    limit: 3
  })

  const articleIcons = {
    GUIDE: Icons.book,
    DOCUMENTATION: Icons.fileText,
    TUTORIAL: Icons.graduationCap,
    FAQ: Icons.helpCircle
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => {
        const Icon = articleIcons[article.type]

        return (
          <Card
            key={article.id}
            className={cn(
              'relative overflow-hidden transition-shadow hover:shadow-lg',
              'group cursor-pointer'
            )}
          >
            <Link href={`/kb/${article.slug}`}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary">
                    {t(`kb.types.${article.type.toLowerCase()}`)}
                  </Badge>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {article.title}
                </h3>

                <p className="text-muted-foreground line-clamp-2">
                  {article.summary}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Icons.eye className="w-4 h-4" />
                    {article.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Icons.thumbsUp className="w-4 h-4" />
                    {article.likes}
                  </div>
                  <div className="flex items-center gap-1">
                    <Icons.clock className="w-4 h-4" />
                    {t('kb.metadata.readTime', {
                      minutes: article.metadata.readTime
                    })}
                  </div>
                </div>

                {/* Author */}
                <div className="mt-4 flex items-center gap-2">
                  {article.author.avatar ? (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <Icons.user className="w-6 h-6" />
                  )}
                  <span className="text-sm">
                    {article.author.name}
                  </span>
                </div>
              </div>
            </Link>
          </Card>
        )
      })}
    </div>
  )
}
