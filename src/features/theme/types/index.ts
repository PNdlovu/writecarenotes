/**
 * @fileoverview Theme Types
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

export interface ThemeConfig {
  colorMode: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  regionCode: string;
}

export interface AccessibilitySettings {
  fontSize: ThemeConfig['fontSize'];
  contrast: ThemeConfig['contrast'];
  reducedMotion: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeConfig;
} 