import { Region } from './types';

export interface PayrollAccessibilityConfig {
  currency: string;
  locale: string;
  dateFormat: string;
  numberFormat: {
    minimumFractionDigits: number;
    maximumFractionDigits: number;
  };
}

const DEFAULT_CONFIG: PayrollAccessibilityConfig = {
  currency: 'GBP',
  locale: 'en-GB',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }
};

const REGIONAL_CONFIGS: Record<Region, Partial<PayrollAccessibilityConfig>> = {
  [Region.ENGLAND]: DEFAULT_CONFIG,
  [Region.SCOTLAND]: DEFAULT_CONFIG,
  [Region.WALES]: {
    ...DEFAULT_CONFIG,
    locale: 'cy-GB' // Welsh locale
  },
  [Region.NORTHERN_IRELAND]: DEFAULT_CONFIG,
  [Region.IRELAND]: {
    currency: 'EUR',
    locale: 'en-IE',
    dateFormat: 'DD/MM/YYYY'
  }
};

export function getAccessibilityConfig(region: Region): PayrollAccessibilityConfig {
  return {
    ...DEFAULT_CONFIG,
    ...REGIONAL_CONFIGS[region]
  };
}

export function formatCurrency(amount: number, config: PayrollAccessibilityConfig): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: config.numberFormat.minimumFractionDigits,
    maximumFractionDigits: config.numberFormat.maximumFractionDigits
  }).format(amount);
}

export function formatDate(date: Date, config: PayrollAccessibilityConfig): string {
  return new Intl.DateTimeFormat(config.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

export function getAriaLabel(field: string, value: string | number, config: PayrollAccessibilityConfig): string {
  if (typeof value === 'number') {
    return `${field}: ${formatCurrency(value, config)}`;
  }
  return `${field}: ${value}`;
}

export function getPayrollSummaryAria(summary: {
  grossPay: number;
  netPay: number;
  deductions: Array<{ type: string; amount: number }>;
}, config: PayrollAccessibilityConfig): string {
  const parts = [
    `Gross pay: ${formatCurrency(summary.grossPay, config)}`,
    `Net pay: ${formatCurrency(summary.netPay, config)}`,
    'Deductions:',
    ...summary.deductions.map(d => `${d.type}: ${formatCurrency(d.amount, config)}`)
  ];
  
  return parts.join('. ');
}
