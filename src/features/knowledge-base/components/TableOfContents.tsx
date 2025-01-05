/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base table of contents component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying a table of contents for articles.
 */

import { useEffect, useState } from 'react'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { ScrollArea } from '@/components/ui/ScrollArea'

interface TableOfContentsProps {
  content: string
}

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const { t } = useTranslation()
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Parse headings from content
    const doc = new DOMParser().parseFromString(content, 'text/html')
    const elements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const parsed: Heading[] = Array.from(elements).map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: parseInt(el.tagName[1])
    }))
    setHeadings(parsed)

    // Set up intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0px 0px -80% 0px' }
    )

    // Observe all heading elements
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
      observer.observe(heading)
    })

    return () => observer.disconnect()
  }, [content])

  if (headings.length === 0) {
    return null
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">
          {t('kb.article.contents')}
        </h2>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <nav className="space-y-1">
            {headings.map((heading) => (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                className={cn(
                  'block py-1 text-sm transition-colors',
                  'hover:text-primary',
                  heading.id === activeId
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground',
                  heading.level === 1 && 'pl-0',
                  heading.level === 2 && 'pl-4',
                  heading.level === 3 && 'pl-8',
                  heading.level === 4 && 'pl-12',
                  heading.level === 5 && 'pl-16',
                  heading.level === 6 && 'pl-20'
                )}
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(`#${heading.id}`)?.scrollIntoView({
                    behavior: 'smooth'
                  })
                }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </Card>
  )
}
