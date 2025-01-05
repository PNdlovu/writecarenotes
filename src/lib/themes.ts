export const CARE_HOME_COLORS = {
  light: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }
  },
  dark: {
    primary: {
      50: '#0c4a6e',
      100: '#075985',
      200: '#0369a1',
      300: '#0284c7',
      400: '#0ea5e9',
      500: '#38bdf8',
      600: '#7dd3fc',
      700: '#bae6fd',
      800: '#e0f2fe',
      900: '#f0f9ff',
    },
    secondary: {
      50: '#14532d',
      100: '#166534',
      200: '#15803d',
      300: '#16a34a',
      400: '#22c55e',
      500: '#4ade80',
      600: '#86efac',
      700: '#bbf7d0',
      800: '#dcfce7',
      900: '#f0fdf4',
    },
    accent: {
      50: '#701a75',
      100: '#86198f',
      200: '#a21caf',
      300: '#c026d3',
      400: '#d946ef',
      500: '#e879f9',
      600: '#f0abfc',
      700: '#f5d0fe',
      800: '#fae8ff',
      900: '#fdf4ff',
    },
    status: {
      success: '#4ade80',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    }
  }
}

export const REGIONAL_COLORS = {
  england: CARE_HOME_COLORS.light.primary[500],
  wales: CARE_HOME_COLORS.light.secondary[500],
  scotland: CARE_HOME_COLORS.light.accent[500],
  northernIreland: CARE_HOME_COLORS.light.primary[700],
  ireland: CARE_HOME_COLORS.light.secondary[700]
}

export const CHART_COLORS = {
  light: [
    CARE_HOME_COLORS.light.primary[500],
    CARE_HOME_COLORS.light.secondary[500],
    CARE_HOME_COLORS.light.accent[500],
    CARE_HOME_COLORS.light.primary[700],
    CARE_HOME_COLORS.light.secondary[700],
    CARE_HOME_COLORS.light.accent[700],
  ],
  dark: [
    CARE_HOME_COLORS.dark.primary[500],
    CARE_HOME_COLORS.dark.secondary[500],
    CARE_HOME_COLORS.dark.accent[500],
    CARE_HOME_COLORS.dark.primary[300],
    CARE_HOME_COLORS.dark.secondary[300],
    CARE_HOME_COLORS.dark.accent[300],
  ]
} 


