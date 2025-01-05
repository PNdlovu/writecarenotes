/**
 * @fileoverview Theme Feature Exports
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

// Components
export { ThemeProvider } from './components/ThemeProvider';
export { ThemeToggle } from './components/ThemeToggle';
export { AccessibilitySettings } from './components/AccessibilitySettings';

// Hooks
export { useTheme } from './hooks/useTheme';

// Types
export type { ThemeConfig, AccessibilitySettings as AccessibilitySettingsType } from './types';

// Utils
export { applyTheme } from './utils/themeUtils'; 