import { AccessSettings } from './types';

export function getAriaLabel(field: string, value: string | number): string {
  return `${field}: ${value}`;
}

export function getFontSize(settings: AccessSettings): string {
  switch (settings.fontSize) {
    case 'small':
      return '0.875rem';
    case 'large':
      return '1.25rem';
    default:
      return '1rem';
  }
}

export function getContrastClass(settings: AccessSettings): string {
  return settings.highContrast ? 'high-contrast' : '';
}

export function getMotionClass(settings: AccessSettings): string {
  return settings.reduceMotion ? 'reduce-motion' : '';
}

export function getColorBlindClass(settings: AccessSettings): string {
  return settings.colorBlindMode ? 'color-blind' : '';
}

export function getLanguageDir(language: string): 'ltr' | 'rtl' {
  const rtlLanguages = ['ar', 'he', 'fa'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
}

export function getAccessClasses(settings: AccessSettings): string {
  return [
    getContrastClass(settings),
    getMotionClass(settings),
    getColorBlindClass(settings),
    settings.screenReader ? 'screen-reader-enabled' : '',
    settings.keyboardNavigation ? 'keyboard-nav-enabled' : '',
  ].filter(Boolean).join(' ');
}

export function applyAccessStyles(settings: AccessSettings): void {
  const fontSize = getFontSize(settings);
  const dir = getLanguageDir(settings.language);

  document.documentElement.style.setProperty('--font-size', fontSize);
  document.documentElement.classList.toggle('high-contrast', settings.highContrast);
  document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
  document.documentElement.classList.toggle('color-blind', settings.colorBlindMode);
  document.documentElement.classList.toggle('screen-reader-enabled', settings.screenReader);
  document.documentElement.classList.toggle('keyboard-nav-enabled', settings.keyboardNavigation);
  document.documentElement.dir = dir;
  document.documentElement.lang = settings.language;
} 