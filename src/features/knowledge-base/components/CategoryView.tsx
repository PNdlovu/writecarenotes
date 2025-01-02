/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base category view component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying a category's articles and subcategories.
 */

import { useState } from 'react'
import { useTranslation } from '@/i18n'
import { useCategory } from '../hooks/useCategory'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Icons } from '@/components/icons'
import { PageHeader } from '@/components/page-header'
import Link from 'next/link'
import { type KBArticle, type KBCategory } from '@prisma/client'

interface CategoryViewProps {
  category: KBCategory & {
    parent: KBCategory | null
    children: (KBCategory & {
      articles: { id: string }[]
    })[]
    articles: (KBArticle & {
      author: {
        id: string
        name: string
        avatar: string | null
      }
    })[]
  }
}

export function CategoryView({ category }: CategoryViewProps) {
  const { t } = useTranslation()
  const [sortBy, setSortBy] = useState('date')
  const [articleType, setArticleType] = useState('all')

  // Sort articles
  const sortedArticles = [...category.articles].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      case 'views':
        return b.views - a.views
      case 'likes':
        return b.likes - a.likes
      default:
        return 0
    }
  })

  // Filter articles by type
  const filteredArticles = sortedArticles.filter(
    article => articleType === 'all' || article.type === articleType
  )

  return (
    <div className="space-y-8">
      {/* Category Header */}
      <PageHeader
        heading={category.name}
        text={category.description || ''}
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/kb"
            className="hover:text-primary"
          >
            {t('kb.title')}
          </Link>
          <Icons.chevronRight className="w-4 h-4" />
          {category.parent && (
            <>
              <Link
                href={`/kb/categories/${category.parent.slug}`}
                className="hover:text-primary"
              >
                {category.parent.name}
              </Link>
              <Icons.chevronRight className="w-4 h-4" />
            </>
          )}
          <span>{category.name}</span>
        </nav>
      </PageHeader>

      {/* Category Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.fileText className="w-5 h-5" />
              {t('kb.categories.articles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {category.articles.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.folder className="w-5 h-5" />
              {t('kb.categories.subcategories')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {category.children.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.eye className="w-5 h-5" />
              {t('kb.categories.totalViews')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {category.articles.reduce((sum, article) => sum + article.views, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            {t('kb.categories.subcategories')}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.children.map((subcategory) => (
              <Card key={subcategory.id}>
                <Link
                  href={`/kb/categories/${subcategory.slug}`}
                  className="block p-6 group"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Icons.folder className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary">
                      {subcategory.articles.length} {t('kb.categories.articles')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
                    {subcategory.name}
                  </h3>
                  {subcategory.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {subcategory.description}
                    </p>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Articles */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {t('kb.categories.articles')}
          </h2>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <Select
              value={articleType}
              onValueChange={setArticleType}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('kb.filters.type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('kb.filters.allTypes')}</SelectItem>
                <SelectItem value="GUIDE">{t('kb.types.guide')}</SelectItem>
                <SelectItem value="DOCUMENTATION">{t('kb.types.documentation')}</SelectItem>
                <SelectItem value="TUTORIAL">{t('kb.types.tutorial')}</SelectItem>
                <SelectItem value="FAQ">{t('kb.types.faq')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('kb.sort.label')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{t('kb.sort.date')}</SelectItem>
                <SelectItem value="views">{t('kb.sort.views')}</SelectItem>
                <SelectItem value="likes">{t('kb.sort.likes')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <Card key={article.id}>
              <Link
                href={`/kb/${article.slug}`}
                className="block p-6 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {t(`kb.types.${article.type.toLowerCase()}`)}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icons.eye className="w-4 h-4" />
                        {article.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Icons.thumbsUp className="w-4 h-4" />
                        {article.likes}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icons.clock className="w-4 h-4" />
                    {formatDistanceToNow(article.updatedAt)}
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                  {article.title}
                </h3>

                <p className="text-muted-foreground line-clamp-2">
                  {article.summary}
                </p>

                <div className="mt-4 flex items-center gap-4">
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
                    <span className="text-sm text-muted-foreground">
                      {article.author.name}
                    </span>
                  </div>

                  {/* Tags */}
                  {article.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-sm text-muted-foreground">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </Card>
          ))}

          {filteredArticles.length === 0 && (
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                {t('kb.categories.noArticles')}
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
