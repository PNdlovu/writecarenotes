import { useState, useCallback } from 'react';
import { BasePerson, CareType } from '@/types/care';
import { Region } from '@/types/regulatory';
import { validateCareRequirements } from '@/utils/careValidation';
import { generateCareReport, generateCareSummary } from '@/utils/careReporting';

interface UseCareResult {
  validatePerson: () => { isValid: boolean; errors: string[]; warnings: string[] };
  generateReport: () => string;
  updateCareType: (newType: CareType) => void;
  updateRegion: (newRegion: Region) => void;
}

export const useCare = (
  person: BasePerson,
  initialCareType: CareType,
  initialRegion: Region
): UseCareResult => {
  const [careType, setCareType] = useState<CareType>(initialCareType);
  const [region, setRegion] = useState<Region>(initialRegion);

  const validatePerson = useCallback(() => {
    return validateCareRequirements(person, careType, region);
  }, [person, careType, region]);

  const generateReport = useCallback(() => {
    const report = generateCareReport(person, careType, region);
    return generateCareSummary(report);
  }, [person, careType, region]);

  const updateCareType = useCallback((newType: CareType) => {
    setCareType(newType);
  }, []);

  const updateRegion = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  return {
    validatePerson,
    generateReport,
    updateCareType,
    updateRegion
  };
};
