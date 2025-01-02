/**
 * @fileoverview Theme Toggle Component
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleColorMode } = useTheme();
  const isDark = theme.colorMode === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleColorMode}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
} 