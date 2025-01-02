/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base search results component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying search results with filters and sorting options.
 */

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/i18n'
import { useSearch } from '../hooks/useSearch'
import { useCategory } from '../hooks/useCategory'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/Card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Icons } from '@/components/icons'
import Link from 'next/link'

interface SearchResultsProps {
  query: string
  type: string
  category: string
  sort: string
}

export function SearchResults({
  query,
  type,
  category,
  sort
}: SearchResultsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { categories = [] } = useCategory()
  const {
    results = [],
    isLoading,
    totalResults,
    suggestions
  } = useSearch({
    query,
    type: type === 'all' ? undefined : type,
    categoryId: category === 'all' ? undefined : category,
    sort
  })

  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/kb/search?${params.toString()}`)
  }

  return (
    <div className="space-y-8">
      {/* Search Stats */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground">
          {totalResults > 0 ? (
            t('kb.search.resultsFound', { count: totalResults })
          ) : (
            t('kb.search.noResults')
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select
            value={type}
            onValueChange={(value) => updateSearchParams('type', value)}
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
            value={category}
            onValueChange={(value) => updateSearchParams('category', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('kb.filters.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('kb.filters.allCategories')}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sort}
            onValueChange={(value) => updateSearchParams('sort', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('kb.sort.label')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">{t('kb.sort.relevance')}</SelectItem>
              <SelectItem value="date">{t('kb.sort.date')}</SelectItem>
              <SelectItem value="views">{t('kb.sort.views')}</SelectItem>
              <SelectItem value="likes">{t('kb.sort.likes')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">
            {t('kb.search.didYouMean')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => updateSearchParams('q', suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id}>
            <Link
              href={`/kb/${result.slug}`}
              className="block p-6 group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">
                    {t(`kb.types.${result.type.toLowerCase()}`)}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icons.eye className="w-4 h-4" />
                      {result.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Icons.thumbsUp className="w-4 h-4" />
                      {result.likes}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icons.clock className="w-4 h-4" />
                  {formatDistanceToNow(result.updatedAt)}
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">
                {result.title}
              </h3>

              <div
                className="text-muted-foreground line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: result.highlight || result.summary
                }}
              />

              <div className="mt-4 flex items-center gap-4">
                {/* Author */}
                <div className="flex items-center gap-2">
                  {result.author.avatar ? (
                    <img
                      src={result.author.avatar}
                      alt={result.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <Icons.user className="w-6 h-6" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {result.author.name}
                  </span>
                </div>

                {/* Category */}
                {result.category && (
                  <Link
                    href={`/kb/categories/${result.category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {result.category.name}
                  </Link>
                )}

                {/* Tags */}
                {result.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    {result.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    {result.tags.length > 3 && (
                      <span className="text-sm text-muted-foreground">
                        +{result.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </Card>
        ))}

        {results.length === 0 && !isLoading && (
          <Card>
            <div className="p-6 text-center text-muted-foreground">
              {t('kb.search.noResults')}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
