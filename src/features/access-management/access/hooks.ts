import { useCallback } from 'react';
import { useAccess } from './AccessProvider';
import { AccessSettings, TenantContext } from './types';
import { getAriaLabel as getAriaLabelUtil, getAccessClasses } from './utils';

interface UseAccessSettingsReturn {
  settings: AccessSettings;
  tenant: TenantContext;
  setHighContrast: (value: boolean) => void;
  setFontSize: (value: 'small' | 'medium' | 'large') => void;
  setReduceMotion: (value: boolean) => void;
  setScreenReader: (value: boolean) => void;
  setKeyboardNavigation: (value: boolean) => void;
  setColorBlindMode: (value: boolean) => void;
  setTextToSpeech: (value: boolean) => void;
  setLanguage: (value: string) => void;
  resetSettings: () => void;
  hasAccess: (resource: string, action: string) => boolean;
  checkPermission: (permission: string) => boolean;
}

export function useAccessSettings(): UseAccessSettingsReturn {
  const { settings, tenant, updateSettings, resetSettings, hasAccess, checkPermission } = useAccess();

  const setHighContrast = useCallback((value: boolean) => {
    updateSettings({ highContrast: value });
  }, [updateSettings]);

  const setFontSize = useCallback((value: 'small' | 'medium' | 'large') => {
    updateSettings({ fontSize: value });
  }, [updateSettings]);

  const setReduceMotion = useCallback((value: boolean) => {
    updateSettings({ reduceMotion: value });
  }, [updateSettings]);

  const setScreenReader = useCallback((value: boolean) => {
    updateSettings({ screenReader: value });
  }, [updateSettings]);

  const setKeyboardNavigation = useCallback((value: boolean) => {
    updateSettings({ keyboardNavigation: value });
  }, [updateSettings]);

  const setColorBlindMode = useCallback((value: boolean) => {
    updateSettings({ colorBlindMode: value });
  }, [updateSettings]);

  const setTextToSpeech = useCallback((value: boolean) => {
    updateSettings({ textToSpeech: value });
  }, [updateSettings]);

  const setLanguage = useCallback((value: string) => {
    // Set default language based on region if not explicitly set
    const regionLanguages = {
      EN: 'en',
      WL: 'cy',
      SC: 'gd',
      NI: 'en',
      IE: 'ga'
    };
    const defaultLanguage = regionLanguages[tenant.region];
    updateSettings({ language: value || defaultLanguage });
  }, [updateSettings, tenant.region]);

  return {
    settings,
    tenant,
    setHighContrast,
    setFontSize,
    setReduceMotion,
    setScreenReader,
    setKeyboardNavigation,
    setColorBlindMode,
    setTextToSpeech,
    setLanguage,
    resetSettings,
    hasAccess,
    checkPermission
  };
}

export function useAccessClasses(): () => string {
  const { settings } = useAccess();
  return useCallback(() => getAccessClasses(settings), [settings]);
}

export function useAriaLabel(): (field: string, value: string | number) => string {
  const { tenant } = useAccess();
  return useCallback((field: string, value: string | number) => {
    // Add region-specific aria label formatting if needed
    return getAriaLabelUtil(field, value);
  }, []);
}

export function useTenantAccess() {
  const { tenant, hasAccess, checkPermission } = useAccess();
  
  return {
    tenant,
    hasAccess,
    checkPermission,
    isRegion: useCallback((region: string) => tenant.region === region, [tenant.region]),
    getRegulatoryBody: useCallback(() => tenant.regulatoryBody, [tenant.regulatoryBody])
  };
} 