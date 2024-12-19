'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AccessibilityConfig {
  highContrast: boolean;
  animations: boolean;
  fontSize: number;
}

interface AccessibilityContextType {
  config: AccessibilityConfig;
  setConfig: (config: Partial<AccessibilityConfig>) => void;
  resetConfig: () => void;
}

const defaultConfig: AccessibilityConfig = {
  highContrast: false,
  animations: true,
  fontSize: 16
};

const AccessibilityContext = createContext<AccessibilityContextType>({
  config: defaultConfig,
  setConfig: () => {},
  resetConfig: () => {}
});

export function AccessibilityProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [config, setConfigState] = useLocalStorage<AccessibilityConfig>(
    'accessibility-config',
    defaultConfig
  );

  const applySettings = useCallback(() => {
    if (config.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (!config.animations) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    const fontSize = Math.max(12, Math.min(24, config.fontSize));
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    
    document.documentElement.setAttribute(
      'data-accessibility',
      JSON.stringify({
        highContrast: config.highContrast,
        animations: config.animations,
        fontSize: fontSize
      })
    );
  }, [config]);

  useEffect(() => {
    applySettings();
  }, [applySettings]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        applySettings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [applySettings]);

  const setConfig = useCallback((newConfig: Partial<AccessibilityConfig>) => {
    setConfigState(prev => ({
      ...prev,
      ...newConfig,
      fontSize: newConfig.fontSize 
        ? Math.max(12, Math.min(24, newConfig.fontSize))
        : prev.fontSize
    }));
  }, [setConfigState]);

  const resetConfig = useCallback(() => {
    setConfigState(defaultConfig);
  }, [setConfigState]);

  return (
    <AccessibilityContext.Provider value={{ config, setConfig, resetConfig }}>
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


