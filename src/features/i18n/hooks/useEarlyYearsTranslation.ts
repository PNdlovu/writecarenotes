import { useTranslations } from 'next-intl';
import { useRegion } from '@/features/region/hooks/useRegion';

export type CareRegion = 'en-GB' | 'en-GB-SCT';

export const useChildrenInCareTranslation = () => {
  const t = useTranslations('careHome.childrenInCare');
  const { region } = useRegion();

  const getRegionalBody = () => t(`${region}.body`);
  const getFramework = () => t(`${region}.framework`);
  
  const getRatings = () => {
    const ratings = t(`${region}.ratings`);
    return Object.entries(ratings).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getAreas = () => {
    const areas = t(`${region}.areas`);
    return Object.entries(areas).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getPolicies = () => {
    const policies = t(`${region}.documentation.policies`);
    return Object.entries(policies).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getRecords = () => {
    const records = t(`${region}.documentation.records`);
    return Object.entries(records).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getAssessments = () => {
    const assessments = t(`${region}.documentation.assessments`);
    return Object.entries(assessments).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getRoles = () => {
    const roles = t(`${region}.staffing.roles`);
    return Object.entries(roles).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getQualifications = () => {
    const qualifications = t(`${region}.staffing.qualifications`);
    return Object.entries(qualifications).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getRatios = () => {
    const ratios = t(`${region}.staffing.ratios`);
    return Object.entries(ratios).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getEnvironmentRequirements = () => {
    const requirements = t(`${region}.requirements.environment`);
    return Object.entries(requirements).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getCareRequirements = () => {
    const requirements = t(`${region}.requirements.care`);
    return Object.entries(requirements).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  const getSafeguardingRequirements = () => {
    const requirements = t(`${region}.requirements.safeguarding`);
    return Object.entries(requirements).map(([key, value]) => ({
      key,
      value: value as string
    }));
  };

  return {
    getRegionalBody,
    getFramework,
    getRatings,
    getAreas,
    getPolicies,
    getRecords,
    getAssessments,
    getRoles,
    getQualifications,
    getRatios,
    getEnvironmentRequirements,
    getCareRequirements,
    getSafeguardingRequirements
  };
};
