/**
 * @fileoverview Resident Financial Assessment Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export interface ResidentFinancialAssessment {
    id: string;
    residentId: string;
    organizationId: string;
    assessmentDate: Date;
    assessor: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_REQUIRED' | 'APPROVED';
    financialDetails: FinancialDetails;
    benefitsCheck: BenefitsCheck;
    localAuthorityContribution?: LocalAuthorityContribution;
    paymentPlan?: PaymentPlan;
    documents: AssessmentDocument[];
    notes?: string;
}

export interface FinancialDetails {
    income: {
        salary?: number;
        pension?: number;
        benefits?: number;
        investments?: number;
        otherIncome?: number;
        frequency: 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
    };
    assets: {
        property?: {
            value: number;
            mortgage?: number;
            ownership: 'SOLE' | 'JOINT' | 'OTHER';
        };
        savings: number;
        investments: number;
        otherAssets?: {
            description: string;
            value: number;
        }[];
    };
    expenses: {
        description: string;
        amount: number;
        frequency: 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
        mandatory: boolean;
    }[];
    dependents?: {
        relationship: string;
        financialDependency: 'FULL' | 'PARTIAL' | 'NONE';
    }[];
}

export interface BenefitsCheck {
    id: string;
    assessmentId: string;
    checkDate: Date;
    eligibleBenefits: {
        benefitType: string;
        eligibility: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'MAYBE';
        estimatedAmount?: number;
        frequency?: 'WEEKLY' | 'MONTHLY' | 'ANNUAL';
        notes?: string;
    }[];
    recommendations: string[];
    nextReviewDate: Date;
}

export interface LocalAuthorityContribution {
    id: string;
    assessmentId: string;
    authorityId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    weeklyAmount?: number;
    startDate?: Date;
    endDate?: Date;
    conditions?: string[];
    reviewDate?: Date;
    reference?: string;
}

export interface PaymentPlan {
    id: string;
    assessmentId: string;
    totalWeeklyCharge: number;
    residentContribution: number;
    thirdPartyContribution?: number;
    localAuthorityContribution?: number;
    paymentSchedule: {
        payee: string;
        amount: number;
        frequency: 'WEEKLY' | 'MONTHLY';
        method: 'DIRECT_DEBIT' | 'STANDING_ORDER' | 'INVOICE';
        dayOfPayment: number;
    }[];
    startDate: Date;
    reviewDate: Date;
    status: 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'TERMINATED';
}

export interface AssessmentDocument {
    id: string;
    assessmentId: string;
    type: 'BANK_STATEMENT' | 'PENSION_STATEMENT' | 'PROPERTY_VALUATION' | 'BENEFIT_LETTER' | 'OTHER';
    description: string;
    uploadDate: Date;
    uploadedBy: string;
    filename: string;
    contentType: string;
    size: number;
    status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface FinancialReview {
    id: string;
    assessmentId: string;
    reviewDate: Date;
    reviewer: string;
    type: 'SCHEDULED' | 'CHANGE_OF_CIRCUMSTANCE' | 'REQUESTED';
    changes: {
        field: string;
        previousValue: any;
        newValue: any;
        reason: string;
    }[];
    outcome: 'NO_CHANGE' | 'ADJUSTMENT_REQUIRED' | 'REASSESSMENT_REQUIRED';
    nextReviewDate: Date;
    notes?: string;
}

export interface PaymentHistory {
    id: string;
    residentId: string;
    payments: {
        date: Date;
        amount: number;
        type: 'RESIDENT' | 'LOCAL_AUTHORITY' | 'THIRD_PARTY';
        method: string;
        reference: string;
        status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
    }[];
    balance: number;
    lastUpdated: Date;
} 