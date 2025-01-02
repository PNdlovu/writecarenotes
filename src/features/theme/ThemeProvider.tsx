'use client';

import { createContext, useContext } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

interface ThemeContextType {
  colors: {
    england: { primary: string; secondary: string };
    wales: { primary: string; secondary: string };
    scotland: { primary: string; secondary: string };
    ireland: { primary: string; secondary: string };
    northernIreland: { primary: string; secondary: string };
    careLevel: {
      LOW: string;
      MEDIUM: string;
      HIGH: string;
    };
    status: {
      ACTIVE: string;
      DISCHARGED: string;
      TEMPORARY: string;
      ADMITTED: string;
    };
  };
}

const defaultColors = {
  england: { primary: '#005EB8', secondary: '#003087' },
  wales: { primary: '#D30731', secondary: '#A6093D' },
  scotland: { primary: '#005EB8', secondary: '#002855' },
  ireland: { primary: '#169B62', secondary: '#0D5C3A' },
  northernIreland: { primary: '#008542', secondary: '#005128' },
  careLevel: {
    LOW: '#4CAF50',
    MEDIUM: '#FFA726',
    HIGH: '#F44336'
  },
  status: {
    ACTIVE: '#4CAF50',
    DISCHARGED: '#9E9E9E',
    TEMPORARY: '#FFA726',
    ADMITTED: '#2196F3'
  }
};

const ThemeContext = createContext<ThemeContextType>({ colors: defaultColors });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeContext.Provider value={{ colors: defaultColors }}>
        {children}
      </ThemeContext.Provider>
    </NextThemeProvider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 