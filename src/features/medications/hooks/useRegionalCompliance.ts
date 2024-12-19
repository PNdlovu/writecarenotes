import { useState, useCallback } from 'react';
import { Region } from '@/types/region';
import { CareHomeType, ComplianceAction, ComplianceRecord } from '../types/compliance';
import { ConsentType, ParentalConsent } from '../types/consent';
import { regionalCompliance } from '../services/regionalCompliance';

interface UseRegionalComplianceProps {
  region: Region;
  careHomeType: CareHomeType;
}

export function useRegionalCompliance({ region, careHomeType }: UseRegionalComplianceProps) {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const validateConsent = useCallback((consent: ParentalConsent) => {
    const { isValid, errors, warnings } = regionalCompliance.validateConsent(
      consent,
      region,
      careHomeType
    );

    setValidationErrors(errors);
    setValidationWarnings(warnings);

    return isValid;
  }, [region, careHomeType]);

  const getExpiryNotificationDate = useCallback((expiryDate: string) => {
    return regionalCompliance.getExpiryNotificationDate(
      region,
      careHomeType,
      expiryDate
    );
  }, [region, careHomeType]);

  const getRenewalDate = useCallback((expiryDate: string) => {
    return regionalCompliance.getRenewalDate(
      region,
      careHomeType,
      expiryDate
    );
  }, [region, careHomeType]);

  const getRequiredDocumentation = useCallback((consentType: ConsentType) => {
    return regionalCompliance.getRequiredDocumentation(
      region,
      careHomeType,
      consentType
    );
  }, [region, careHomeType]);

  const checkComplianceStatus = useCallback((
    consent: ParentalConsent,
    complianceRecords: ComplianceRecord[]
  ): {
    isCompliant: boolean;
    missingActions: ComplianceAction[];
    expiringActions: ComplianceAction[];
  } => {
    const requiredDocs = getRequiredDocumentation(consent.consentType);
    const missingActions: ComplianceAction[] = [];
    const expiringActions: ComplianceAction[] = [];

    // Check each required document
    requiredDocs.forEach(doc => {
      const record = complianceRecords.find(r => 
        r.action === `${doc}_APPROVED` || r.action === `${doc}_COMPLETED`
      );

      if (!record) {
        missingActions.push(doc as ComplianceAction);
      } else if (record.expiresAt) {
        const expiryDate = new Date(record.expiresAt);
        const now = new Date();
        const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 30) { // Warning for documents expiring within 30 days
          expiringActions.push(doc as ComplianceAction);
        }
      }
    });

    return {
      isCompliant: missingActions.length === 0,
      missingActions,
      expiringActions
    };
  }, [getRequiredDocumentation]);

  return {
    validateConsent,
    getExpiryNotificationDate,
    getRenewalDate,
    getRequiredDocumentation,
    checkComplianceStatus,
    validationErrors,
    validationWarnings
  };
}


