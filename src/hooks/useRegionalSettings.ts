import { useCallback, useMemo } from 'react';
import { Region } from '@/types/region';
import { CareHomeType, RegionalMedicationSettings } from '@/features/medications/types/compliance';
import { useNetworkStatus } from './useNetworkStatus';

export const useRegionalSettings = (region: Region, careHomeType: CareHomeType) => {
  const { isOnline, lastSyncTime } = useNetworkStatus();

  const getDefaultSettings = useCallback((): RegionalMedicationSettings => ({
    region,
    careHomeType,
    maxDosageUnits: {},
    restrictedMedications: [],
    requiresPharmacistApproval: false,
    stockControlEnabled: true,
    // Offline settings
    offlineEnabled: true,
    offlineSyncInterval: 15, // sync every 15 minutes
    maxOfflinePeriod: 24, // max 24 hours offline
    // Regional specific settings
    requiresParentalConsent: false,
    requiresOfstedNotification: false,
    requiresIndividualHealthcarePlan: false,
    requiresControlledDrugRegister: false,
    requiresDoubleSignature: false,
    requiresWelshTranslation: false,
    requiresNHSScotlandApproval: false,
    requiresControlledDrugWitness: false,
    requiresMedicationAuditTrail: false,
  }), [region, careHomeType]);

  const settings = useMemo(() => {
    const baseSettings = getDefaultSettings();

    switch (region) {
      case 'GB-ENG':
        baseSettings.requiresControlledDrugRegister = true;
        baseSettings.requiresDoubleSignature = true;
        
        if (careHomeType === 'CHILDRENS') {
          baseSettings.requiresParentalConsent = true;
          baseSettings.requiresOfstedNotification = true;
          baseSettings.requiresIndividualHealthcarePlan = true;
        }
        break;

      case 'GB-WLS':
        baseSettings.requiresWelshTranslation = true;
        baseSettings.requiresControlledDrugRegister = true;
        break;

      case 'GB-SCT':
        baseSettings.requiresNHSScotlandApproval = true;
        baseSettings.requiresControlledDrugRegister = true;
        break;

      case 'GB-NIR':
        baseSettings.requiresControlledDrugWitness = true;
        baseSettings.requiresControlledDrugRegister = true;
        break;

      case 'IE':
        baseSettings.requiresMedicationAuditTrail = true;
        baseSettings.requiresControlledDrugRegister = true;
        break;
    }

    return baseSettings;
  }, [region, careHomeType, getDefaultSettings]);

  const offlineSettings = useMemo(() => ({
    isOnline,
    lastSyncTime,
    canOperateOffline: settings.offlineEnabled,
    requiresSync: !isOnline && Date.now() - lastSyncTime > settings.maxOfflinePeriod * 3600000,
  }), [isOnline, lastSyncTime, settings]);

  return {
    settings,
    offlineSettings,
  };
};


