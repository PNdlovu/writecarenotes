import { useContext } from 'react';
import { Region } from '@/features/organizations/types';
import { REGIONAL_CONFIG } from '@/config/regional';
import { OrganizationContext } from '@/features/organizations/hooks/useOrganizationContext';

export function useRegionalConfig() {
  const { organization } = useContext(OrganizationContext);
  const region = organization?.region || Region.ENGLAND; // Default to England if no region specified
  const config = REGIONAL_CONFIG[region];

  return {
    config,
    region,
    isLoading: !organization,
    // Helper functions for regional requirements
    getMedicationRequirements: () => config?.requirements?.medication || {},
    getStaffingRequirements: () => config?.requirements?.staffing || {},
    getComplianceRequirements: () => config?.compliance || {},
  };
} 