'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Check, ChevronDown, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAccessibility } from '@/providers/AccessibilityProvider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'

export function AccessibilitySettings() {
  const { config, setConfig } = useAccessibility()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full"
          aria-label="Accessibility settings"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Accessibility settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Accessibility Settings</SheetTitle>
          <SheetDescription>
            Customize your viewing experience
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="flex flex-col">
              <span>High Contrast</span>
              <span className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </span>
            </Label>
            <Switch
              id="high-contrast"
              checked={config.highContrast}
              onCheckedChange={(checked) => setConfig({ highContrast: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="animations" className="flex flex-col">
              <span>Animations</span>
              <span className="text-sm text-muted-foreground">
                Enable or disable interface animations
              </span>
            </Label>
            <Switch
              id="animations"
              checked={config.animations}
              onCheckedChange={(checked) => setConfig({ animations: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size" className="flex flex-col">
              <span>Font Size</span>
              <span className="text-sm text-muted-foreground">
                Adjust the text size across the application
              </span>
            </Label>
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[config.fontSize]}
              onValueChange={([value]) => setConfig({ fontSize: value })}
              className="mt-2"
              aria-label="Adjust font size"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>12px</span>
              <span>Current: {config.fontSize}px</span>
              <span>24px</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}


