import { useState } from 'react';
import type { PINVerification, BarcodeVerification } from '../types/verification';

interface SafetyCheckParams {
  medicationId: string;
  residentId: string;
  barcode: string;
  scannedAt: Date;
}

interface SafetyCheckResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export function useVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPIN = async (verification: PINVerification): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // API call would go here
      const response = await fetch('/api/medications/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verification),
      });

      if (!response.ok) {
        throw new Error('PIN verification failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PIN verification failed');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyBarcode = async (verification: BarcodeVerification): Promise<boolean> => {
    setIsVerifying(true);
    setError(null);
    
    try {
      // API call would go here
      const response = await fetch('/api/medications/verify-barcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verification),
      });

      if (!response.ok) {
        throw new Error('Barcode verification failed');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Barcode verification failed');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyMedicationSafety = async (params: SafetyCheckParams): Promise<SafetyCheckResult> => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const response = await fetch('/api/medications/safety-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Safety check failed');
      }

      const result = await response.json();

      // Additional safety checks
      const errors: string[] = [];
      
      // Check medication expiry
      if (result.medication.expiryDate && new Date(result.medication.expiryDate) <= new Date()) {
        errors.push('Medication has expired');
      }

      // Check if this is the newest prescription
      if (!result.medication.isLatestPrescription) {
        errors.push('This is not the most recent prescription - please check for updates');
      }

      // Check for any recent adverse reactions
      if (result.recentAdverseReactions?.length > 0) {
        errors.push('Warning: Recent adverse reactions recorded - please review medical notes');
      }

      // Check for any recent medication changes
      if (result.recentMedicationChanges?.length > 0) {
        errors.push('Warning: Recent medication changes detected - please verify against latest prescription');
      }

      // Check timing
      const scheduledTime = new Date(result.medication.scheduledTime);
      const currentTime = new Date();
      const timeDifferenceMinutes = Math.abs(currentTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
      
      if (timeDifferenceMinutes > 30) {
        errors.push(`Warning: Administration time differs from scheduled time by ${Math.round(timeDifferenceMinutes)} minutes`);
      }

      // Check for interactions with recently administered medications
      if (result.potentialInteractions?.length > 0) {
        errors.push('Warning: Potential interactions with recently administered medications detected');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings: result.warnings || [],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Safety check failed');
      return {
        isValid: false,
        errors: [err instanceof Error ? err.message : 'Safety check failed'],
      };
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyPIN,
    verifyBarcode,
    verifyMedicationSafety,
    isVerifying,
    error,
  };
}
