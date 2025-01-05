/**
 * @fileoverview Theme Provider Component
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

'use client';

import React, { createContext, useState, useEffect } from 'react';
import type { ThemeConfig, ThemeProviderProps } from '../types';
import { applyTheme } from '../utils/themeUtils';

const defaultTheme: ThemeConfig = {
  colorMode: 'system',
  fontSize: 'medium',
  contrast: 'normal',
  reducedMotion: false,
  regionCode: 'en-GB'
};

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme: initialTheme }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return initialTheme || defaultTheme;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', JSON.stringify(theme));
      applyTheme(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
} 