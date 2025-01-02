/**
 * @fileoverview Care Package Financial Management Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export type FundingType = 
    | 'NHS_CONTINUING_HEALTHCARE'  // England
    | 'FUNDED_NURSING_CARE'       // Wales
    | 'FREE_PERSONAL_CARE'        // Scotland
    | 'HSC_TRUST_FUNDING'         // Northern Ireland
    | 'FAIR_DEAL_SCHEME'          // Ireland
    | 'LOCAL_AUTHORITY'
    | 'SELF_FUNDED'
    | 'MIXED_FUNDING';

export type CareLevel = 
    | 'RESIDENTIAL'
    | 'NURSING'
    | 'DEMENTIA'
    | 'SPECIALIST_DEMENTIA'
    | 'PALLIATIVE'
    | 'RESPITE'
    | 'COMPLEX_NEEDS';

export interface CarePackageFinancial {
    id: string;
    residentId: string;
    organizationId: string;
    fundingType: FundingType;
    careLevel: CareLevel;
    weeklyRate: number;
    localAuthorityRate?: number;
    nhsFundedNursingCare?: number;
    topUpAmount?: number;
    topUpPayor?: string;
    startDate: Date;
    endDate?: Date;
    reviewDate: Date;
    lastAssessmentDate: Date;
    status: 'ACTIVE' | 'PENDING' | 'UNDER_REVIEW' | 'TERMINATED';
    notes?: string;
    metadata: {
        assessmentReference?: string;
        localAuthorityReference?: string;
        nhsReference?: string;
        trustReference?: string;
        fairDealReference?: string;
    };
}

export interface RateCalculation {
    baseRate: number;
    localAuthorityContribution?: number;
    nhsContribution?: number;
    residentContribution?: number;
    topUpContribution?: number;
    totalWeeklyRate: number;
    effectiveDate: Date;
    notes?: string;
}

export interface FundingAssessment {
    id: string;
    carePackageId: string;
    assessmentType: 'INITIAL' | 'REVIEW' | 'CHANGE_OF_CIRCUMSTANCES';
    assessmentDate: Date;
    assessor: string;
    outcome: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'PARTIAL';
    fundingType: FundingType;
    weeklyAmount: number;
    startDate: Date;
    endDate?: Date;
    evidence: {
        financialAssessment?: boolean;
        medicalAssessment?: boolean;
        nursingAssessment?: boolean;
        socialWorkerAssessment?: boolean;
    };
    notes?: string;
}

export interface TopUpAgreement {
    id: string;
    carePackageId: string;
    payorType: 'FAMILY' | 'FRIEND' | 'CHARITY' | 'OTHER';
    payorName: string;
    weeklyAmount: number;
    startDate: Date;
    endDate?: Date;
    paymentMethod: 'DIRECT_DEBIT' | 'STANDING_ORDER' | 'INVOICE';
    paymentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    status: 'ACTIVE' | 'PENDING' | 'DEFAULTED' | 'TERMINATED';
    lastReviewDate: Date;
    nextReviewDate: Date;
}

export interface FeeChange {
    id: string;
    carePackageId: string;
    changeType: 'ANNUAL_INCREASE' | 'CARE_LEVEL_CHANGE' | 'FUNDING_CHANGE' | 'OTHER';
    previousWeeklyRate: number;
    newWeeklyRate: number;
    effectiveDate: Date;
    notificationDate: Date;
    notificationSentTo: string[];
    approvedBy?: string;
    approvalDate?: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
    notes?: string;
} 