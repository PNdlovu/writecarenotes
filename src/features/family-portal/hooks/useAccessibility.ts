/**
 * @fileoverview Accessibility Hook
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing accessibility features
 */

import { useState, useEffect } from 'react';

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  keyboardOnly: boolean;
  textSpacing: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 'normal',
  highContrast: false,
  screenReader: false,
  reducedMotion: false,
  keyboardOnly: false,
  textSpacing: false
};

export function useAccessibility(initialSettings?: Partial<AccessibilitySettings>) {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings
  });

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    switch (settings.fontSize) {
      case 'large':
        root.style.fontSize = '120%';
        break;
      case 'extra-large':
        root.style.fontSize = '150%';
        break;
      default:
        root.style.fontSize = '100%';
    }
  }, [settings.fontSize]);

  // Apply high contrast
  useEffect(() => {
    const root = document.documentElement;
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings.highContrast]);

  // Apply reduced motion
  useEffect(() => {
    const root = document.documentElement;
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-duration', '0s');
      root.style.setProperty('--animation-duration', '0s');
    } else {
      root.style.removeProperty('--transition-duration');
      root.style.removeProperty('--animation-duration');
    }
  }, [settings.reducedMotion]);

  // Apply text spacing
  useEffect(() => {
    const root = document.documentElement;
    if (settings.textSpacing) {
      root.style.setProperty('--letter-spacing', '0.12em');
      root.style.setProperty('--word-spacing', '0.16em');
      root.style.setProperty('--line-height', '1.5');
    } else {
      root.style.removeProperty('--letter-spacing');
      root.style.removeProperty('--word-spacing');
      root.style.removeProperty('--line-height');
    }
  }, [settings.textSpacing]);

  // Keyboard navigation
  useEffect(() => {
    const handleFirstTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-user');
        window.removeEventListener('keydown', handleFirstTab);
      }
    };

    if (settings.keyboardOnly) {
      window.addEventListener('keydown', handleFirstTab);
    }

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
    };
  }, [settings.keyboardOnly]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getFontSizeStyle = (baseSize: number) => {
    switch (settings.fontSize) {
      case 'large':
        return baseSize * 1.2;
      case 'extra-large':
        return baseSize * 1.5;
      default:
        return baseSize;
    }
  };

  const getAriaProps = (role?: string) => {
    const props: Record<string, string> = {};
    
    if (role) {
      props['role'] = role;
    }
    
    if (settings.screenReader) {
      props['aria-live'] = 'polite';
    }
    
    return props;
  };

  const getHighContrastColors = () => {
    if (settings.highContrast) {
      return {
        background: '#000000',
        text: '#FFFFFF',
        border: '#FFFFFF',
        focus: '#FFFF00'
      };
    }
    return null;
  };

  return {
    settings,
    updateSettings,
    getFontSizeStyle,
    getAriaProps,
    getHighContrastColors
  };
}


