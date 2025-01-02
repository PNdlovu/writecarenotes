/**
 * @fileoverview Theme Utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

import type { ThemeConfig } from '../types';

export function applyTheme(theme: ThemeConfig): void {
  const root = document.documentElement;
  
  // Apply color mode
  if (theme.colorMode === 'system') {
    root.classList.remove('dark', 'light');
    root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  } else {
    root.classList.remove('dark', 'light');
    root.classList.add(theme.colorMode);
  }

  // Apply font size
  root.style.setProperty('--font-size-base', getFontSizeValue(theme.fontSize));
  
  // Apply contrast
  root.dataset.contrast = theme.contrast;
  
  // Apply motion preferences
  if (theme.reducedMotion) {
    root.style.setProperty('--reduce-motion', 'true');
  } else {
    root.style.removeProperty('--reduce-motion');
  }
}

function getFontSizeValue(size: ThemeConfig['fontSize']): string {
  switch (size) {
    case 'small':
      return '14px';
    case 'large':
      return '18px';
    default:
      return '16px';
  }
} 