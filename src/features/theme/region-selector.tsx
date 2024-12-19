'use client'

import { useTheme, regionSettings } from '@/lib/theme'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const regions = {
  'en-GB': { name: 'England', currency: 'GBP' },
  'cy-GB': { name: 'Wales', currency: 'GBP' },
  'gd-GB': { name: 'Scotland', currency: 'GBP' },
  'ga-IE': { name: 'Ireland', currency: 'EUR' },
  'en-NI': { name: 'Northern Ireland', currency: 'GBP' }
} as const

type RegionCode = keyof typeof regions

export function RegionSelector() {
  const { config, setConfig } = useTheme()

  const handleRegionChange = (region: keyof typeof regions) => {
    setConfig({
      region,
      currency: regionSettings[region].currency,
    })
    document.documentElement.lang = region
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Select region">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Select region</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(regions).map(([code, { name, currency }]) => (
          <DropdownMenuItem key={code}>
            <span>{name}</span>
            <span className="ml-auto text-muted-foreground">
              {currency}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


