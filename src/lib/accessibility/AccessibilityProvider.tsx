import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'x-large';
  contrast: 'normal' | 'high';
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  textSpacing: boolean;
  focusIndicator: boolean;
  animations: 'all' | 'reduced' | 'none';
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  customStyles: Record<string, string>;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  resetSettings: () => void;
  announceMessage: (message: string, priority?: 'polite' | 'assertive') => void;
  registerShortcut: (key: string, callback: () => void, description: string) => void;
  focusElement: (elementId: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 'normal',
  contrast: 'normal',
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  textSpacing: false,
  focusIndicator: true,
  animations: 'all',
  colorBlindMode: 'none',
  customStyles: {},
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useLocalStorage<AccessibilitySettings>(
    'accessibility-settings',
    defaultSettings
  );
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [shortcuts, setShortcuts] = useState<Map<string, { callback: () => void; description: string }>>(new Map());

  // WCAG 2.2 Compliance: Focus Management
  const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // ARIA Live Region Management
  const announceMessage = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(prev => [...prev, message]);
    const liveRegion = document.querySelector(`[aria-live="${priority}"]`);
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  };

  // Keyboard Shortcuts Management
  const registerShortcut = (key: string, callback: () => void, description: string) => {
    setShortcuts(prev => new Map(prev.set(key, { callback, description })));
  };

  // Apply settings to document with enhanced WCAG 2.2 support
  useEffect(() => {
    // Font size with rem units for better scaling
    document.documentElement.style.fontSize = {
      normal: '16px',
      large: '1.125rem',
      'x-large': '1.25rem',
    }[settings.fontSize];

    // Enhanced contrast modes
    document.documentElement.classList.toggle('high-contrast', settings.contrast === 'high');
    document.documentElement.classList.toggle('focus-visible', settings.focusIndicator);
    
    // Color blind support
    document.documentElement.setAttribute('data-color-blind-mode', settings.colorBlindMode);

    // Animation and motion control
    document.documentElement.style.setProperty(
      '--animation-duration',
      settings.animations === 'none' ? '0s' : settings.animations === 'reduced' ? '0.5s' : '0.2s'
    );

    // Custom styles for enterprise flexibility
    Object.entries(settings.customStyles).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
  }, [settings]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;

      const shortcut = shortcuts.get(event.key);
      if (shortcut) {
        event.preventDefault();
        shortcut.callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation, shortcuts]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        announceMessage,
        registerShortcut,
        focusElement,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};


