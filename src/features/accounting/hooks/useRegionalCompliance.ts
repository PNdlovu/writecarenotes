/**
 * @fileoverview Regional Compliance Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Custom hook for managing regional compliance and formatting in the accounting module
 */

import { useCallback } from 'react';
import { useRouter } from 'next/router';
import { RegionalComplianceService, Region, regionalCompliance } from '../services/compliance/regionalValidation';

export const useRegionalCompliance = () => {
  const router = useRouter();
  const locale = router.locale as Region || 'en-GB';
  const service = regionalCompliance[locale];

  /**
   * Format currency amount according to regional settings
   */
  const formatCurrency = useCallback((amount: number) => {
    return service.formatCurrency(amount);
  }, [locale]);

  /**
   * Format date according to regional settings
   */
  const formatDate = useCallback((date: Date) => {
    return service.formatDate(date);
  }, [locale]);

  /**
   * Check if organization requires VAT registration
   */
  const requiresVATRegistration = useCallback((annualTurnover: number) => {
    return service.requiresVATRegistration(annualTurnover);
  }, [locale]);

  /**
   * Check if organization requires statutory audit
   */
  const requiresStatutoryAudit = useCallback((annualTurnover: number) => {
    return service.requiresStatutoryAudit(annualTurnover);
  }, [locale]);

  /**
   * Get retention period in months
   */
  const getRetentionPeriod = useCallback(() => {
    return service.getRetentionPeriod();
  }, [locale]);

  /**
   * Check if digital record keeping is required
   */
  const requiresDigitalRecordKeeping = useCallback(() => {
    return service.requiresDigitalRecordKeeping();
  }, [locale]);

  /**
   * Get list of regulatory bodies
   */
  const getRegulatoryBodies = useCallback(() => {
    return service.getRegulatoryBodies();
  }, [locale]);

  /**
   * Get regional configuration
   */
  const getConfig = useCallback(() => {
    return service.getConfig();
  }, [locale]);

  /**
   * Validate VAT return based on regional rules
   */
  const validateVATReturn = useCallback(async (vatReturn: any) => {
    return service.validateVATReturn(vatReturn);
  }, [locale]);

  return {
    region: locale,
    formatCurrency,
    formatDate,
    requiresVATRegistration,
    requiresStatutoryAudit,
    getRetentionPeriod,
    requiresDigitalRecordKeeping,
    getRegulatoryBodies,
    getConfig,
    validateVATReturn
  };
}; 