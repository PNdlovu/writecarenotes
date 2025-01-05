/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base popular categories component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying popular knowledge base categories.
 */

import { useTranslation } from '@/i18n'
import { useCategory } from '../hooks/useCategory'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Icons } from '@/components/icons'
import Link from 'next/link'

export function PopularCategories() {
  const { t } = useTranslation()
  const { categories = [], isLoading } = useCategory()

  // Sort categories by article count and take top 6
  const popularCategories = [...categories]
    .sort((a, b) => 
      (b.metadata.articleCount || 0) - (a.metadata.articleCount || 0)
    )
    .slice(0, 6)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {popularCategories.map((category) => (
        <Card
          key={category.id}
          className={cn(
            'relative overflow-hidden transition-shadow hover:shadow-lg',
            'group cursor-pointer'
          )}
        >
          <Link href={`/kb/categories/${category.slug}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Icons.folder className="w-6 h-6" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t('kb.categories.articleCount', {
                    count: category.metadata.articleCount
                  })}
                </span>
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                {category.name}
              </h3>

              {category.description && (
                <p className="text-muted-foreground line-clamp-2">
                  {category.description}
                </p>
              )}

              {/* Subcategories */}
              {category.children && category.children.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    {t('kb.categories.subcategories')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.children.slice(0, 3).map((child) => (
                      <Link
                        key={child.id}
                        href={`/kb/categories/${child.slug}`}
                        className="text-sm text-muted-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {child.name}
                        {category.children.length > 3 && child === category.children[2] && '...'}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Articles */}
              {category.articles && category.articles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    {t('kb.categories.recentArticles')}
                  </h4>
                  <div className="space-y-2">
                    {category.articles.slice(0, 3).map((article) => (
                      <Link
                        key={article.id}
                        href={`/kb/${article.slug}`}
                        className="block text-sm text-muted-foreground hover:text-primary line-clamp-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {article.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
}
