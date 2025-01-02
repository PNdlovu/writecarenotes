/**
 * @fileoverview Accessibility Settings Component
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

'use client';

import React from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Form/Label';

export function AccessibilitySettings() {
  const { theme, updateAccessibility } = useTheme();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fontSize">Font Size</Label>
        <Select
          value={theme.fontSize}
          onValueChange={(value) => updateAccessibility({ fontSize: value as any })}
        >
          <SelectTrigger id="fontSize">
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contrast">Contrast</Label>
        <Select
          value={theme.contrast}
          onValueChange={(value) => updateAccessibility({ contrast: value as any })}
        >
          <SelectTrigger id="contrast">
            <SelectValue placeholder="Select contrast" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High Contrast</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="motion">Reduce Motion</Label>
        <Switch
          id="motion"
          checked={theme.reducedMotion}
          onCheckedChange={(checked) => updateAccessibility({ reducedMotion: checked })}
        />
      </div>
    </div>
  );
} 