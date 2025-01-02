/**
 * @fileoverview Local Authority Integration Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export interface LocalAuthorityContract {
    id: string;
    organizationId: string;
    authorityId: string;
    authorityName: string;
    region: 'ENGLAND' | 'WALES' | 'SCOTLAND' | 'NORTHERN_IRELAND' | 'IRELAND';
    contractType: 'BLOCK' | 'SPOT' | 'FRAMEWORK' | 'DYNAMIC_PURCHASING';
    startDate: Date;
    endDate?: Date;
    rates: LocalAuthorityRate[];
    paymentTerms: PaymentTerms;
    status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'TERMINATED';
}

export interface LocalAuthorityRate {
    id: string;
    contractId: string;
    serviceType: string;
    careLevel: string;
    weeklyRate: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
    additionalCosts?: {
        description: string;
        amount: number;
        frequency: 'WEEKLY' | 'MONTHLY' | 'ONE_OFF';
    }[];
}

export interface PaymentTerms {
    paymentFrequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
    paymentMethod: 'DIRECT_DEBIT' | 'BACS' | 'INVOICE';
    paymentDays: number;
    vatApplicable: boolean;
    specialConditions?: string[];
}

export interface LocalAuthorityPayment {
    id: string;
    contractId: string;
    residentId: string;
    period: {
        from: Date;
        to: Date;
    };
    amount: number;
    status: 'PENDING' | 'PROCESSED' | 'PAID' | 'DISPUTED';
    reference: string;
    breakdown: {
        basicRate: number;
        additionalCosts: number;
        adjustments: number;
        vat?: number;
    };
}

export interface HSEPayment {
    id: string;
    nursingHomeId: string;
    residentId: string;
    fairDealId: string;
    period: {
        from: Date;
        to: Date;
    };
    amount: number;
    status: 'PENDING' | 'PROCESSED' | 'PAID';
    reference: string;
}

export interface TrustPayment {
    id: string;
    trustId: string;
    careHomeId: string;
    residentId: string;
    period: {
        from: Date;
        to: Date;
    };
    amount: number;
    status: 'PENDING' | 'PROCESSED' | 'PAID';
    reference: string;
    trustArea: string;
}

export interface FundingGapAnalysis {
    id: string;
    organizationId: string;
    period: {
        from: Date;
        to: Date;
    };
    analysis: {
        totalExpectedIncome: number;
        actualIncome: number;
        variance: number;
        gapsByAuthority: {
            authorityId: string;
            expectedAmount: number;
            actualAmount: number;
            variance: number;
            residentCount: number;
        }[];
    };
    recommendations?: string[];
    status: 'DRAFT' | 'REVIEWED' | 'APPROVED';
}

export interface ContractManagement {
    id: string;
    contractId: string;
    reviews: {
        date: Date;
        reviewer: string;
        findings: string[];
        actions: string[];
    }[];
    amendments: {
        date: Date;
        description: string;
        approvedBy: string;
        documents: string[];
    }[];
    performance: {
        period: {
            from: Date;
            to: Date;
        };
        metrics: {
            occupancyRate: number;
            paymentCompliance: number;
            qualityMetrics: Record<string, number>;
        };
    }[];
} 