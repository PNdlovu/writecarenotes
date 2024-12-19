export type Theme = 'light' | 'dark' | 'system'
export type Region = 'en-GB' | 'cy' | 'ga' | 'gd'
export type Currency = 'GBP' | 'EUR'

export interface ThemeConfig {
  theme: Theme
  region: Region
  currency: Currency
  highContrast: boolean
  fontSize: number
  animations: boolean
}

export const defaultConfig: ThemeConfig = {
  theme: 'system',
  region: 'en-GB',
  currency: 'GBP',
  highContrast: false,
  fontSize: 16,
  animations: true,
}

export const themes = {
  light: {
    background: 'white',
    text: 'black',
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF2D55',
    muted: '#F5F5F5',
    border: '#E5E5E5',
  },
  dark: {
    background: '#1C1C1E',
    text: 'white',
    primary: '#0A84FF',
    secondary: '#5E5CE6',
    accent: '#FF375F',
    muted: '#2C2C2E',
    border: '#3A3A3C',
  },
}

export const regionSettings = {
  'en-GB': {
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    regulatoryBody: 'CQC',
  },
  'cy': {
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    regulatoryBody: 'CIW',
  },
  'ga': {
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    regulatoryBody: 'HIQA',
  },
  'gd': {
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
    regulatoryBody: 'Care Inspectorate',
  },
}


