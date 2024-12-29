import React, { createContext, useCallback, useContext } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AccessibilityContextType, AccessibilitySettings, DEFAULT_SETTINGS } from './types';

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    'accessibility-settings',
    DEFAULT_SETTINGS
  );

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  React.useEffect(() => {
    // Apply settings to document
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    document.documentElement.classList.toggle('color-blind', settings.colorBlindMode);
  }, [settings]);

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
} 