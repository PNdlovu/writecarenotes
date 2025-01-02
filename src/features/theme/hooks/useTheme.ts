/**
 * @fileoverview Theme Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import { useContext } from 'react';
import { ThemeContext } from '../components/ThemeProvider';
import type { ThemeConfig, AccessibilitySettings } from '../types';

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { theme, setTheme } = context;

  const updateAccessibility = (settings: Partial<AccessibilitySettings>) => {
    setTheme({
      ...theme,
      ...settings
    });
  };

  const toggleColorMode = () => {
    setTheme({
      ...theme,
      colorMode: theme.colorMode === 'dark' ? 'light' : 'dark'
    });
  };

  return {
    theme,
    setTheme,
    updateAccessibility,
    toggleColorMode
  };
} 