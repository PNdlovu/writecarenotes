'use client'

import { createContext, useContext } from 'react'

/**
 * Type Definitions
 */
export type Region = 'en-GB' | 'cy-GB' | 'gd-GB' | 'ga-IE' | 'en-NI'
export type Currency = 'GBP' | 'EUR'
export type ColorScheme = 'light' | 'dark' | 'system'
export type FontSize = 'small' | 'medium' | 'large'

export interface Theme {
  colorScheme: ColorScheme
  fontSize: FontSize
  reducedMotion: boolean
  highContrast: boolean
  spacing: number
}

export interface ThemeConfig extends Theme {
  region: Region
  currency: Currency
  dateFormat: string
  timeFormat: string
  timezone: string
}

/**
 * Constants and Settings
 */
export const regionSettings = {
  'en-GB': { name: 'England', currency: 'GBP' as const },
  'cy-GB': { name: 'Wales', currency: 'GBP' as const },
  'gd-GB': { name: 'Scotland', currency: 'GBP' as const },
  'ga-IE': { name: 'Ireland', currency: 'EUR' as const },
  'en-NI': { name: 'Northern Ireland', currency: 'GBP' as const }
} as const

export const defaultConfig: ThemeConfig = {
  colorScheme: 'system',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  spacing: 1,
  region: 'en-GB',
  currency: 'GBP',
  dateFormat: 'dd/MM/yyyy',
  timeFormat: 'HH:mm',
  timezone: 'Europe/London'
}

/**
 * Context Setup
 */
export interface ThemeContextType {
  config: ThemeConfig
  setConfig: (config: Partial<ThemeConfig>) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  config: defaultConfig,
  setConfig: () => {},
})

/**
 * Hooks
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

/**
 * Utility Functions
 */
export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    GBP: '£',
    EUR: '€'
  }
  return symbols[currency]
}

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat(defaultConfig.region, {
    style: 'currency',
    currency: currency
  }).format(amount)
}

export const getRegionalDateFormat = (region: Region): string => {
  const formats: Record<Region, string> = {
    'en-GB': 'dd/MM/yyyy',
    'cy-GB': 'dd/MM/yyyy',
    'gd-GB': 'dd/MM/yyyy',
    'ga-IE': 'dd/MM/yyyy',
    'en-NI': 'dd/MM/yyyy'
  }
  return formats[region]
}

/**
 * CSS Variables Management
 */
export const updateThemeVariables = (theme: Theme): void => {
  const root = document.documentElement
  root.style.setProperty('--theme-spacing', `${theme.spacing}rem`)
  root.dataset.theme = theme.colorScheme
  root.dataset.fontSize = theme.fontSize
  root.dataset.reducedMotion = theme.reducedMotion.toString()
  root.dataset.highContrast = theme.highContrast.toString()
}

/**
 * Validation
 */
export const validateThemeConfig = (config: Partial<ThemeConfig>): boolean => {
  if (config.region && !Object.keys(regionSettings).includes(config.region)) {
    console.error(`Invalid region: ${config.region}`)
    return false
  }
  if (config.currency && !['GBP', 'EUR'].includes(config.currency)) {
    console.error(`Invalid currency: ${config.currency}`)
    return false
  }
  return true
}

/**
 * Media Query Helpers
 */
export const getSystemTheme = (): ColorScheme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const getReducedMotionPreference = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Type Guards
 */
export const isValidRegion = (region: string): region is Region => {
  return Object.keys(regionSettings).includes(region)
}

export const isValidCurrency = (currency: string): currency is Currency => {
  return ['GBP', 'EUR'].includes(currency)
}


