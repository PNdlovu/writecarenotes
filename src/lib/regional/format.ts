import { format as formatDate } from 'date-fns';
import { Region, getRegionalConfig } from './config';

export async function formatDateForRegion(
  date: Date | string,
  region: Region,
  format?: string
): Promise<string> {
  const config = await getRegionalConfig(region);
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDate(dateObj, format || config.dateFormat);
}

export async function formatNumberForRegion(
  num: number,
  region: Region,
  options?: {
    precision?: number;
    format?: 'decimal' | 'percent' | 'currency';
  }
): Promise<string> {
  const config = await getRegionalConfig(region);
  const {
    precision = config.numberFormat.precision,
    format = 'decimal'
  } = options || {};

  const formatter = new Intl.NumberFormat(config.language, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
    style: format === 'currency' ? 'currency' : 
           format === 'percent' ? 'percent' : 
           'decimal',
    currency: format === 'currency' ? config.currencyFormat.symbol : undefined
  });

  return formatter.format(num);
}

export async function formatTimeForRegion(
  time: Date | string,
  region: Region
): Promise<string> {
  const config = await getRegionalConfig(region);
  const dateObj = typeof time === 'string' ? new Date(time) : time;
  return formatDate(dateObj, config.timeFormat);
}

export async function getLocalTimezone(region: Region): Promise<string> {
  const config = await getRegionalConfig(region);
  return config.defaultTimezone;
}

export function convertToRegionalTime(
  date: Date,
  timezone: string
): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}
