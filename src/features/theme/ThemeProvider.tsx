'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { themeTokens } from './tokens';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  systemTheme: string;
  customTheme: CustomTheme | null;
  setCustomTheme: (theme: CustomTheme | null) => void;
  tokens: typeof themeTokens;
  applyThemeOverrides: (overrides: Partial<CustomTheme>) => void;
}

interface CustomTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo?: string;
  fonts?: {
    heading?: string;
    body?: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useLocalStorage<string>(storageKey, defaultTheme);
  const [systemTheme, setSystemTheme] = useState<string>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);

  // Monitor system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    const effectiveTheme = theme === 'system' ? systemTheme : theme;
    
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);

    // Apply custom theme if present
    if (customTheme) {
      Object.entries(customTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });

      if (customTheme.fonts) {
        if (customTheme.fonts.heading) {
          root.style.setProperty('--font-family-heading', customTheme.fonts.heading);
        }
        if (customTheme.fonts.body) {
          root.style.setProperty('--font-family-body', customTheme.fonts.body);
        }
      }
    }
  }, [theme, systemTheme, customTheme]);

  // Apply theme overrides (for enterprise customization)
  const applyThemeOverrides = (overrides: Partial<CustomTheme>) => {
    setCustomTheme(prev => ({
      ...prev,
      ...overrides,
      colors: {
        ...(prev?.colors || {}),
        ...(overrides.colors || {}),
      },
      fonts: {
        ...(prev?.fonts || {}),
        ...(overrides.fonts || {}),
      },
    }));
  };

  const value = {
    theme,
    setTheme,
    systemTheme,
    customTheme,
    setCustomTheme,
    tokens: themeTokens,
    applyThemeOverrides,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
