export type Region = 'ENGLAND' | 'WALES' | 'SCOTLAND' | 'NORTHERN_IRELAND' | 'IRELAND';

export type FundingType = 'LOCAL_AUTHORITY' | 'NHS' | 'SELF_FUNDED' | 'MIXED';

export interface RegionalConfig {
  region: Region;
  authority: string;
  currency: string;
  vatRate: number;
  fundingTypes: FundingType[];
  reportingFrequency: string;
  financialYearEnd: string;
}

export interface LocalAuthorityRate {
  id: string;
  authorityId: string;
  baseRate: number;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  additionalNeeds: AdditionalNeedRate[];
}

export interface AdditionalNeedRate {
  id: string;
  category: string;
  rate: number;
}

export interface FundingAssessment {
  id: string;
  residentId: string;
  region: Region;
  fundingType: FundingType;
  weeklyAmount: number;
  startDate: Date;
  endDate?: Date;
  contributionBreakdown: ContributionBreakdown[];
}

export interface ContributionBreakdown {
  source: string;
  amount: number;
  frequency: string;
}


