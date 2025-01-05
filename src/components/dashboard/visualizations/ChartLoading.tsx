import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loader2 } from 'lucide-react'
import { Progress } from '@/components/ui/Progress'
import { LocaleConfig } from './types'

interface ChartLoadingProps {
  title?: string
  description?: string
  progress?: number
  estimatedTime?: number
  locale?: LocaleConfig
  showProgress?: boolean
  accessibility?: {
    announceProgress?: boolean
    reducedMotion?: boolean
    highContrast?: boolean
  }
}

export function ChartLoading({
  title = 'Loading Chart',
  description,
  progress,
  estimatedTime,
  locale,
  showProgress = false,
  accessibility = {}
}: ChartLoadingProps) {
  const {
    announceProgress = true,
    reducedMotion = false,
    highContrast = false
  } = accessibility

  // Format time based on locale
  const formatTime = (seconds: number) => {
    if (!seconds) return ''
    
    return new Intl.RelativeTimeFormat(locale?.language || 'en', {
      numeric: 'auto',
      style: 'long'
    }).format(Math.ceil(seconds), 'seconds')
  }

  // ARIA live region for screen readers
  const ariaAnnouncement = announceProgress && progress
    ? `Loading ${Math.round(progress)}% complete`
    : 'Loading in progress'

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className={`flex items-center ${
            highContrast ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <Loader2 
            className={`mr-2 h-4 w-4 ${
              reducedMotion ? '' : 'animate-spin'
            }`} 
          />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] items-center justify-center">
          <div className="space-y-4 w-full max-w-xs">
            {description && (
              <p className="text-sm text-muted-foreground text-center">
                {description}
              </p>
            )}

            {showProgress && typeof progress === 'number' && (
              <div className="space-y-2">
                <Progress 
                  value={progress} 
                  max={100}
                  aria-label={ariaAnnouncement}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(progress)}%
                  {estimatedTime && ` • ${formatTime(estimatedTime)}`}
                </p>
              </div>
            )}

            {!showProgress && (
              <div 
                className={`flex justify-center space-x-2 ${
                  reducedMotion ? 'opacity-50' : ''
                }`}
              >
                <div className="h-2 w-2 rounded-full bg-muted-foreground/20 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </div>

        {/* Hidden ARIA live region for screen readers */}
        <div 
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {ariaAnnouncement}
        </div>
      </CardContent>
    </Card>
  )
} 


