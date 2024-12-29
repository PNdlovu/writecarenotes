import React, { createContext, useCallback, useContext, PropsWithChildren } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AccessContextType, AccessSettings, DEFAULT_SETTINGS, TenantContext, REGULATORY_REQUIREMENTS } from './types';
import { applyAccessStyles } from './utils';

const AccessContext = createContext<AccessContextType | null>(null);

interface AccessProviderProps extends PropsWithChildren {
  tenant: TenantContext;
  userRoles: string[];
  userQualifications?: string[];
  userTraining?: string[];
  dbsLevel?: string;
  safeguardingLevel?: string;
  specialistQualifications?: string[];
  languageCompetencies?: string[];
  nursingRegistration?: {
    pin: string;
    expiryDate: Date;
    specialties?: string[];
  };
  digitalCompetencies?: {
    dataProtection: boolean;
    cyberSecurity: boolean;
    digitalRecordKeeping: boolean;
    telehealthSystems: boolean;
    remoteMonitoring: boolean;
  };
  infectionControlTraining?: {
    level: 'standard' | 'enhanced' | 'specialist';
    covidProtocols: boolean;
    lastUpdated: Date;
  };
  culturalCompetencyTraining?: {
    completed: boolean;
    languages: string[];
    culturalAwareness: boolean;
    religiousAccommodation: boolean;
  };
}

export function AccessProvider({ 
  children, 
  tenant, 
  userRoles,
  userQualifications = [],
  userTraining = [],
  dbsLevel = 'standard',
  safeguardingLevel = 'level-1',
  specialistQualifications = [],
  languageCompetencies = [],
  nursingRegistration,
  digitalCompetencies,
  infectionControlTraining,
  culturalCompetencyTraining
}: AccessProviderProps) {
  const storageKey = `access-settings-${tenant.tenantId}`;
  const [settings, setSettings] = useLocalStorage<AccessSettings>(
    storageKey,
    DEFAULT_SETTINGS
  );

  const updateSettings = useCallback((newSettings: Partial<AccessSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, [setSettings]);

  // Check if user has access to a resource and action
  const hasAccess = useCallback((resource: string, action: string): boolean => {
    const requirements = REGULATORY_REQUIREMENTS[tenant.regulatoryBody];
    
    // Basic checks
    if (!requirements.applicableTypes.includes(tenant.careHomeType)) {
      console.error(`Care home type ${tenant.careHomeType} not supported by ${tenant.regulatoryBody}`);
      return false;
    }

    if (!userRoles.some(role => requirements.requiredRoles.includes(role))) {
      return false;
    }

    // Modern care type checks
    if (tenant.careHomeType.startsWith('SMART_') || tenant.careHomeType.includes('REMOTE_') || tenant.careHomeType === 'TELECARE_SERVICES') {
      if (!digitalCompetencies) {
        console.error('Digital competencies required for modern care services');
        return false;
      }

      const modernReqs = REGULATORY_REQUIREMENTS.MODERN_REQUIREMENTS;
      
      // Check digital health requirements
      if (!digitalCompetencies.dataProtection || !digitalCompetencies.cyberSecurity) {
        console.error('Data protection and cyber security competencies required');
        return false;
      }

      // Check required digital training
      const hasDigitalTraining = modernReqs.digitalHealth.mandatoryTraining.every(
        training => userTraining.includes(training)
      );
      if (!hasDigitalTraining) {
        console.error('Mandatory digital training not completed');
        return false;
      }
    }

    // Infection control checks
    if (tenant.infectionControlLevel === 'enhanced' || tenant.infectionControlLevel === 'specialist') {
      if (!infectionControlTraining || infectionControlTraining.level !== tenant.infectionControlLevel) {
        console.error(`${tenant.infectionControlLevel} infection control training required`);
        return false;
      }
    }

    // Cultural competency checks
    if (tenant.careHomeType === 'CULTURAL_SPECIFIC') {
      if (!culturalCompetencyTraining?.completed) {
        console.error('Cultural competency training required');
        return false;
      }

      if (!culturalCompetencyTraining.culturalAwareness || !culturalCompetencyTraining.religiousAccommodation) {
        console.error('Cultural awareness and religious accommodation training required');
        return false;
      }
    }

    // Existing regulatory body checks
    switch (tenant.regulatoryBody) {
      case 'CQC':
        if (tenant.digitalIntegration?.nhsSpineConnection && !digitalCompetencies?.digitalRecordKeeping) {
          console.error('NHS Spine integration requires digital record keeping competency');
          return false;
        }
        return true;
      case 'OFSTED':
        // Additional checks for modern children's services
        if (tenant.careHomeType === 'CHILDRENS_COMPLEX_NEEDS') {
          if (!specialistQualifications.includes('complex-needs-care')) {
            console.error('Complex needs qualification required');
            return false;
          }
        }
        return true;
      // ... other regulatory bodies ...
      default:
        return false;
    }
  }, [
    tenant,
    userRoles,
    userQualifications,
    userTraining,
    dbsLevel,
    safeguardingLevel,
    specialistQualifications,
    languageCompetencies,
    nursingRegistration,
    digitalCompetencies,
    infectionControlTraining,
    culturalCompetencyTraining
  ]);

  // Check if user has specific permission
  const checkPermission = useCallback((permission: string): boolean => {
    // Add permission checks based on roles and regulatory requirements
    return hasAccess('permission', permission);
  }, [hasAccess]);

  React.useEffect(() => {
    applyAccessStyles(settings);
  }, [settings]);

  const contextValue: AccessContextType = {
    settings,
    tenant,
    updateSettings,
    resetSettings,
    hasAccess,
    checkPermission
  };

  return (
    <AccessContext.Provider value={contextValue}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess(): AccessContextType {
  const context = useContext(AccessContext);
  if (!context) {
    throw new Error('useAccess must be used within an AccessProvider');
  }
  return context;
} 