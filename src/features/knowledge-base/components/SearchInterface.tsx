/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base search interface
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main search interface for the knowledge base including search input,
 * filters, and results display.
 */

import { useSearch } from '../hooks/useSearch'
import { useTranslation } from '@/i18n'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { type ArticleType, type ArticleAccess } from '../types'

export function SearchInterface() {
  const { t } = useTranslation()
  const { ref, inView } = useInView()
  
  const {
    term,
    setTerm,
    filters,
    sort,
    results,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    suggestions,
    isSuggestionsLoading,
    updateFilters,
    clearFilters,
    updateSort,
    clearAll
  } = useSearch()

  // Load more results when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  return (
    <div className="flex flex-col gap-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">
          {t('kb.search.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('kb.search.description')}
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={t('kb.search.placeholder')}
            className="w-full"
          />
          {/* Suggestions */}
          {term.length >= 2 && suggestions && suggestions.length > 0 && (
            <Card className="absolute w-full mt-1 z-10">
              <ScrollArea className="h-[200px]">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setTerm(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </ScrollArea>
            </Card>
          )}
        </div>
        {(term || Object.keys(filters).length > 0) && (
          <Button variant="outline" onClick={clearAll}>
            {t('common.clear')}
          </Button>
        )}
      </div>

      {/* Filters and Sort */}
      <div className="flex gap-4">
        <Select
          value={filters.type?.[0]}
          onValueChange={(value) => 
            updateFilters({ type: value ? [value as ArticleType] : undefined })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('kb.filters.type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="guide">{t('kb.types.guide')}</SelectItem>
            <SelectItem value="documentation">{t('kb.types.documentation')}</SelectItem>
            <SelectItem value="tutorial">{t('kb.types.tutorial')}</SelectItem>
            <SelectItem value="faq">{t('kb.types.faq')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.access?.[0]}
          onValueChange={(value) =>
            updateFilters({ access: value ? [value as ArticleAccess] : undefined })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('kb.filters.access')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">{t('kb.access.public')}</SelectItem>
            <SelectItem value="organization">{t('kb.access.organization')}</SelectItem>
            <SelectItem value="role-based">{t('kb.access.roleBased')}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort.field}
          onValueChange={(value: any) =>
            updateSort({ ...sort, field: value })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('kb.sort.field')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">{t('kb.sort.relevance')}</SelectItem>
            <SelectItem value="date">{t('kb.sort.date')}</SelectItem>
            <SelectItem value="views">{t('kb.sort.views')}</SelectItem>
            <SelectItem value="likes">{t('kb.sort.likes')}</SelectItem>
          </SelectContent>
        </Select>

        {Object.keys(filters).length > 0 && (
          <Button variant="outline" onClick={clearFilters}>
            {t('kb.filters.clear')}
          </Button>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Results Header */}
        {term && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('kb.search.results', { count: total })}
            </p>
          </div>
        )}

        {/* Results List */}
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <CardTitle>
                    <a
                      href={`/kb/${result.slug}`}
                      className="hover:underline"
                      dangerouslySetInnerHTML={{
                        __html: result.highlights.title?.[0] || result.title
                      }}
                    />
                  </CardTitle>
                  <CardDescription className="flex gap-2">
                    <Badge>{t(`kb.types.${result.type}`)}</Badge>
                    <span>•</span>
                    <span>{result.category.name}</span>
                    <span>•</span>
                    <span>{t('kb.metadata.readTime', { minutes: result.metadata.readTime })}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: result.highlights.content?.[0] || result.summary
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    {result.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Load More */}
            {hasNextPage && (
              <div ref={ref} className="py-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage
                    ? t('common.loading')
                    : t('kb.search.loadMore')}
                </Button>
              </div>
            )}
          </div>
        ) : term ? (
          <Card>
            <CardHeader>
              <CardTitle>{t('kb.search.noResults')}</CardTitle>
              <CardDescription>
                {t('kb.search.noResultsDescription')}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
