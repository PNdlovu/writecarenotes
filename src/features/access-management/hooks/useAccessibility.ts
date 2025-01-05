/**
 * @fileoverview React hook for managing accessibility features
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { useState, useEffect, useContext } from 'react';
import { AccessManagementContext } from '../context/AccessManagementContext';

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reduceMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: boolean;
  textToSpeech: boolean;
  language: string;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'medium',
  reduceMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  colorBlindMode: false,
  textToSpeech: false,
  language: 'en'
};

export function useAccessibility(initialSettings?: Partial<AccessibilitySettings>) {
  const { accessService, currentUser } = useContext(AccessManagementContext);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    ...defaultSettings,
    ...initialSettings
  });

  useEffect(() => {
    loadSettings();
  }, [currentUser?.id]);

  const loadSettings = async () => {
    if (!accessService || !currentUser) return;

    try {
      const response = await fetch(`/api/accessibility-settings/${currentUser.id}`);
      if (response.ok) {
        const savedSettings = await response.json();
        setSettings(prev => ({ ...prev, ...savedSettings }));
      }
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    }
  };

  const updateSettings = async (updates: Partial<AccessibilitySettings>) => {
    if (!accessService || !currentUser) return;

    try {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      await fetch(`/api/accessibility-settings/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });

      await accessService.auditLog({
        action: 'ACCESSIBILITY_SETTINGS_UPDATED',
        description: 'Accessibility settings updated',
        userId: currentUser.id,
        tenantId: currentUser.tenantId,
        timestamp: new Date(),
        metadata: { updates }
      });
    } catch (error) {
      console.error('Failed to update accessibility settings:', error);
    }
  };

  const getAriaProps = (elementType: string) => {
    const props: Record<string, any> = {
      role: elementType,
      'aria-label': `${elementType} element`
    };

    if (settings.screenReader) {
      props['aria-live'] = 'polite';
    }

    if (settings.keyboardNavigation) {
      props.tabIndex = 0;
    }

    return props;
  };

  const getFontSize = () => {
    switch (settings.fontSize) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1.25rem';
      default:
        return '1rem';
    }
  };

  const getThemeClass = () => {
    const classes = [];

    if (settings.highContrast) {
      classes.push('high-contrast');
    }

    if (settings.colorBlindMode) {
      classes.push('color-blind');
    }

    if (settings.reduceMotion) {
      classes.push('reduce-motion');
    }

    return classes.join(' ');
  };

  return {
    settings,
    updateSettings,
    getAriaProps,
    getFontSize,
    getThemeClass
  };
}

export default useAccessibility; 