/**
 * @writecarenotes.com
 * @fileoverview Knowledge Base quick links component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Component for displaying quick access links to common knowledge base sections.
 */

import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'

interface QuickLink {
  href: string
  icon: keyof typeof Icons
  title: string
  description: string
  color: string
}

export function QuickLinks() {
  const { t } = useTranslation()

  const links: QuickLink[] = [
    {
      href: '/kb/getting-started',
      icon: 'rocket',
      title: t('kb.quickLinks.gettingStarted'),
      description: t('kb.quickLinks.gettingStartedDesc'),
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      href: '/kb/tutorials',
      icon: 'graduationCap',
      title: t('kb.quickLinks.tutorials'),
      description: t('kb.quickLinks.tutorialsDesc'),
      color: 'bg-green-500/10 text-green-500'
    },
    {
      href: '/kb/faq',
      icon: 'helpCircle',
      title: t('kb.quickLinks.faq'),
      description: t('kb.quickLinks.faqDesc'),
      color: 'bg-purple-500/10 text-purple-500'
    },
    {
      href: '/kb/best-practices',
      icon: 'star',
      title: t('kb.quickLinks.bestPractices'),
      description: t('kb.quickLinks.bestPracticesDesc'),
      color: 'bg-yellow-500/10 text-yellow-500'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {links.map((link) => {
        const Icon = Icons[link.icon]

        return (
          <Link
            key={link.href}
            href={link.href}
            className="block group"
          >
            <Button
              variant="outline"
              className={cn(
                'relative w-full h-full p-6 justify-start',
                'hover:border-primary/50'
              )}
            >
              <div className="flex flex-col items-start gap-4">
                <div className={cn(
                  'p-2 rounded-full',
                  link.color
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-1 text-left">
                  <h3 className="font-medium group-hover:text-primary">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {link.description}
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        )
      })}
    </div>
  )
}
