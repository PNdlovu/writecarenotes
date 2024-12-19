import { useI18n } from '../lib/config';

export type CareHomeRegion = 'en-GB' | 'en-GB-SCT' | 'en-GB-WLS' | 'en-GB-NIR' | 'en-IE';

export interface CareHomeContext {
  category: 
    | 'regulation' 
    | 'assessment' 
    | 'safeguarding' 
    | 'staffing' 
    | 'documentation'
    | 'compliance'
    | 'quality'
    | 'finance'
    | 'clinical'
    | 'facilities'
    | 'ofsted';
  subcategory?: string;
  region?: CareHomeRegion;
}

export interface ComplianceRating {
  name: string;
  description: string;
  color: string;
}

export interface QualityMetrics {
  audits: Record<string, string>;
  kpis: Record<string, string>;
  improvement: Record<string, string>;
}

export interface OfstedRequirements {
  safeguarding: Record<string, string>;
  learning: Record<string, string>;
  assessment: Record<string, string>;
  staffQuals: Record<string, string>;
}

export interface OfstedCurriculum {
  areas: Record<string, string>;
  planning: Record<string, string>;
  assessment: Record<string, string>;
}

export interface OfstedStaffing {
  roles: Record<string, string>;
  qualifications: Record<string, string>;
  ratios: Record<string, string>;
}

export const useCareHomeTranslation = () => {
  const { t, locale } = useI18n('care-home');

  const getRegionalTerm = (key: string, context: CareHomeContext) => {
    const category = context.category ? `${context.category}.` : '';
    const subcategory = context.subcategory ? `${context.subcategory}.` : '';
    const region = context.region || locale;
    
    // Try most specific translation first
    let translation = t(`${category}${region}.${subcategory}${key}`);
    
    // Fall back to category without subcategory
    if (translation === `${category}${region}.${subcategory}${key}`) {
      translation = t(`${category}${region}.${key}`);
    }
    
    // Fall back to standard English if regional term doesn't exist
    if (translation === `${category}${region}.${key}`) {
      translation = t(`${category}en-GB.${key}`);
    }

    return translation;
  };

  const getRegulatoryBody = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      name: t(`regulation.${currentRegion}.body`),
      abbreviation: t(`regulation.${currentRegion}.abbreviation`),
      framework: t(`regulation.${currentRegion}.framework`),
      inspectionName: t(`regulation.${currentRegion}.inspection`)
    };
  };

  const getComplianceRatings = (region?: CareHomeRegion): ComplianceRating[] => {
    const currentRegion = region || locale as CareHomeRegion;
    const ratings = t(`compliance.${currentRegion}.ratings`, { returnObjects: true }) as Record<string, string>;
    
    const ratingColors: Record<string, string> = {
      outstanding: 'green',
      good: 'blue',
      requiresImprovement: 'amber',
      inadequate: 'red',
      excellent: 'green',
      adequate: 'amber',
      unsatisfactory: 'red'
    };

    return Object.entries(ratings).map(([key, name]) => ({
      name,
      description: t(`compliance.${currentRegion}.ratings.${key}.description`, { defaultValue: '' }),
      color: ratingColors[key] || 'gray'
    }));
  };

  const getQualityMetrics = (region?: CareHomeRegion): QualityMetrics => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      audits: t(`quality.${currentRegion}.audits`, { returnObjects: true }),
      kpis: t(`quality.${currentRegion}.kpis`, { returnObjects: true }),
      improvement: t(`quality.${currentRegion}.improvement`, { returnObjects: true })
    };
  };

  const getClinicalForms = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      assessments: t(`clinical.${currentRegion}.assessments`, { returnObjects: true }),
      care: t(`clinical.${currentRegion}.care`, { returnObjects: true }),
      monitoring: t(`clinical.${currentRegion}.monitoring`, { returnObjects: true })
    };
  };

  const getFacilityRequirements = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      maintenance: t(`facilities.${currentRegion}.maintenance`, { returnObjects: true }),
      safety: t(`facilities.${currentRegion}.safety`, { returnObjects: true }),
      equipment: t(`facilities.${currentRegion}.equipment`, { returnObjects: true })
    };
  };

  const getFinancialTerms = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      funding: t(`finance.${currentRegion}.funding`, { returnObjects: true }),
      documents: t(`finance.${currentRegion}.documents`, { returnObjects: true }),
      rates: t(`finance.${currentRegion}.rates`, { returnObjects: true })
    };
  };

  const getOfstedInfo = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      body: t(`ofsted.${currentRegion}.body`),
      abbreviation: t(`ofsted.${currentRegion}.abbreviation`),
      framework: t(`ofsted.${currentRegion}.framework`),
      inspection: t(`ofsted.${currentRegion}.inspection`),
      ratings: t(`ofsted.${currentRegion}.ratings`, { returnObjects: true }),
      areas: t(`ofsted.${currentRegion}.areas`, { returnObjects: true })
    };
  };

  const getOfstedRequirements = (region?: CareHomeRegion): OfstedRequirements => {
    const currentRegion = region || locale as CareHomeRegion;
    return t(`ofsted.${currentRegion}.requirements`, { returnObjects: true });
  };

  const getOfstedCurriculum = (region?: CareHomeRegion): OfstedCurriculum => {
    const currentRegion = region || locale as CareHomeRegion;
    return t(`ofsted.${currentRegion}.curriculum`, { returnObjects: true });
  };

  const getOfstedStaffing = (region?: CareHomeRegion): OfstedStaffing => {
    const currentRegion = region || locale as CareHomeRegion;
    return t(`ofsted.${currentRegion}.staffing`, { returnObjects: true });
  };

  const getOfstedDocumentation = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      policies: t(`ofsted.${currentRegion}.documentation.policies`, { returnObjects: true }),
      records: t(`ofsted.${currentRegion}.documentation.records`, { returnObjects: true }),
      assessment: t(`ofsted.${currentRegion}.documentation.assessment`, { returnObjects: true })
    };
  };

  const getOfstedQuality = (region?: CareHomeRegion) => {
    const currentRegion = region || locale as CareHomeRegion;
    return {
      monitoring: t(`ofsted.${currentRegion}.quality.monitoring`, { returnObjects: true }),
      improvement: t(`ofsted.${currentRegion}.quality.improvement`, { returnObjects: true })
    };
  };

  return {
    getRegionalTerm,
    getRegulatoryBody,
    getComplianceRatings,
    getQualityMetrics,
    getClinicalForms,
    getFacilityRequirements,
    getFinancialTerms,
    getOfstedInfo,
    getOfstedRequirements,
    getOfstedCurriculum,
    getOfstedStaffing,
    getOfstedDocumentation,
    getOfstedQuality,
    locale
  };
};
