// Provider
export { AccessProvider, useAccess } from './AccessProvider';

// Components
export { AccessSettings } from './AccessSettings';

// Hooks
export { useAccessSettings, useAccessClasses, useAriaLabel } from './hooks';

// Types
export type { AccessSettings, AccessContextType } from './types';
export { DEFAULT_SETTINGS } from './types';

// Utils
export {
  getAriaLabel,
  getFontSize,
  getContrastClass,
  getMotionClass,
  getColorBlindClass,
  getLanguageDir,
  getAccessClasses,
  applyAccessStyles,
} from './utils'; 