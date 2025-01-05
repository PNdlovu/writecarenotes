'use client';

/**
 * @writecarenotes.com
 * @fileoverview Localization Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for managing localization and formatting
 */

import { useCallback } from 'react';
import { Region } from '@/features/blog/types';

interface UseLocalizationReturn {
  formatDate: (date: Date | string) => string;
  formatCurrency: (amount: number) => string;
  formatPhoneNumber: (phone: string) => string;
  formatPostcode: (postcode: string) => string;
  getRegionalTerminology: (term: string) => string;
}

const isBrowser = typeof window !== 'undefined';

const createDateFormatters = () => {
  if (!isBrowser) {
    return Object.values(Region).reduce((acc, region) => {
      acc[region] = {
        format: (date: Date) => date.toLocaleDateString(),
      };
      return acc;
    }, {} as Record<Region, { format: (date: Date) => string }>);
  }

  return {
    [Region.ENGLAND]: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [Region.WALES]: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [Region.SCOTLAND]: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [Region.NORTHERN_IRELAND]: new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    [Region.IRELAND]: new Intl.DateTimeFormat('en-IE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };
};

const createCurrencyFormatters = () => {
  if (!isBrowser) {
    return Object.values(Region).reduce((acc, region) => {
      acc[region] = {
        format: (amount: number) => `£${amount.toFixed(2)}`,
      };
      return acc;
    }, {} as Record<Region, { format: (amount: number) => string }>);
  }

  return {
    [Region.ENGLAND]: new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }),
    [Region.WALES]: new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }),
    [Region.SCOTLAND]: new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }),
    [Region.NORTHERN_IRELAND]: new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }),
    [Region.IRELAND]: new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }),
  };
};

const dateFormatters = createDateFormatters();
const currencyFormatters = createCurrencyFormatters();

const regionalTerminology: Record<Region, Record<string, string>> = {
  [Region.ENGLAND]: {
    resident: 'Resident',
    carer: 'Carer',
    manager: 'Manager',
    care_home: 'Care Home',
  },
  [Region.WALES]: {
    resident: 'Resident',
    carer: 'Carer',
    manager: 'Manager',
    care_home: 'Care Home',
  },
  [Region.SCOTLAND]: {
    resident: 'Service User',
    carer: 'Support Worker',
    manager: 'Service Manager',
    care_home: 'Care Service',
  },
  [Region.NORTHERN_IRELAND]: {
    resident: 'Service User',
    carer: 'Care Worker',
    manager: 'Registered Manager',
    care_home: 'Care Home',
  },
  [Region.IRELAND]: {
    resident: 'Resident',
    carer: 'Care Assistant',
    manager: 'Person in Charge',
    care_home: 'Nursing Home',
  },
};

export function useLocalization(region: Region = Region.ENGLAND): UseLocalizationReturn {
  const formatDate = useCallback(
    (date: Date | string) => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateFormatters[region].format(dateObj);
    },
    [region]
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      return currencyFormatters[region].format(amount);
    },
    [region]
  );

  const formatPhoneNumber = useCallback(
    (phone: string) => {
      // Remove all non-numeric characters
      const cleaned = phone.replace(/\D/g, '');

      // Format based on region
      switch (region) {
        case Region.IRELAND:
          // Irish format: (01) 234 5678 or 087 234 5678
          if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
          }
          return cleaned;
        default:
          // UK format: 01234 567890
          if (cleaned.length === 11) {
            return cleaned.replace(/(\d{5})(\d{6})/, '$1 $2');
          }
          return cleaned;
      }
    },
    [region]
  );

  const formatPostcode = useCallback(
    (postcode: string) => {
      // Remove all whitespace
      const cleaned = postcode.replace(/\s/g, '');

      // Format based on region
      switch (region) {
        case Region.IRELAND:
          // Irish Eircode format: A65F4E2
          return cleaned.toUpperCase();
        default:
          // UK postcode format: AA9A 9AA
          if (cleaned.length > 5) {
            return `${cleaned.slice(0, -3)} ${cleaned.slice(-3)}`.toUpperCase();
          }
          return cleaned.toUpperCase();
      }
    },
    [region]
  );

  const getRegionalTerminology = useCallback(
    (term: string) => {
      return regionalTerminology[region][term.toLowerCase()] || term;
    },
    [region]
  );

  return {
    formatDate,
    formatCurrency,
    formatPhoneNumber,
    formatPostcode,
    getRegionalTerminology,
  };
} 