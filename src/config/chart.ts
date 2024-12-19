import { ChartConfig } from '@/components/dashboard/visualizations/types';

export const defaultChartConfig: ChartConfig = {
  title: 'Regional Overview',
  region: 'UK',
  type: 'bar',
  compliance: true,
  darkMode: false,
  accessibility: {
    announceData: true,
    keyboardNavigation: true,
    highContrast: false
  },
  colors: {
    primary: '#2563eb',
    secondary: '#7c3aed',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0891b2'
  },
  fonts: {
    base: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif'
  },
  spacing: {
    padding: {
      x: 16,
      y: 12
    },
    margin: {
      x: 16,
      y: 12
    }
  },
  animation: {
    duration: 500,
    easing: 'ease-in-out'
  },
  responsive: {
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280
    }
  }
};


