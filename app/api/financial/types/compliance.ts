/**
 * @fileoverview Regional Compliance Dashboard Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export interface ComplianceDashboard {
    organizationId: string;
    lastUpdated: Date;
    overallStatus: ComplianceStatus;
    regulatoryBody: RegulatoryBody;
    metrics: ComplianceMetrics;
    upcomingDeadlines: ComplianceDeadline[];
    outstandingActions: ComplianceAction[];
    recentSubmissions: ComplianceSubmission[];
}

export type ComplianceStatus = 
    | 'COMPLIANT'
    | 'MINOR_ISSUES'
    | 'MAJOR_ISSUES'
    | 'CRITICAL'
    | 'UNDER_REVIEW';

export type RegulatoryBody = 
    | 'CQC'       // England
    | 'CIW'       // Wales
    | 'CI'        // Scotland (Care Inspectorate)
    | 'RQIA'      // Northern Ireland
    | 'HIQA';     // Ireland

export interface ComplianceMetrics {
    financialViability: {
        status: ComplianceStatus;
        lastAssessment: Date;
        nextAssessment: Date;
        keyIndicators: {
            liquidityRatio: number;
            debtServiceCoverage: number;
            operatingMargin: number;
            occupancyRate: number;
        };
    };
    regulatoryReturns: {
        submitted: number;
        pending: number;
        overdue: number;
        nextDue: Date;
    };
    auditStatus: {
        lastAudit: Date;
        findings: number;
        resolvedFindings: number;
        criticalIssues: number;
    };
    staffingCompliance: {
        status: ComplianceStatus;
        staffingRatios: Record<string, number>;
        qualificationCompliance: number;
        trainingCompliance: number;
    };
}

export interface ComplianceDeadline {
    id: string;
    type: 'RETURN' | 'AUDIT' | 'ASSESSMENT' | 'REVIEW';
    description: string;
    dueDate: Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'OVERDUE';
    assignedTo?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    regulatoryReference?: string;
}

export interface ComplianceAction {
    id: string;
    type: 'CORRECTION' | 'IMPROVEMENT' | 'DOCUMENTATION' | 'TRAINING';
    description: string;
    dueDate: Date;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
    assignedTo: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    evidence?: string[];
    notes?: string;
}

export interface ComplianceSubmission {
    id: string;
    type: 'FINANCIAL_RETURN' | 'AUDIT_RESPONSE' | 'IMPROVEMENT_PLAN';
    submissionDate: Date;
    submittedBy: string;
    status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED';
    reference: string;
    documents: string[];
    feedback?: string;
}

// Regional Specific Types

export interface CQCFinancialViability {
    marketOversightScheme: boolean;
    lastAssessmentGrade: 'GREEN' | 'AMBER' | 'RED';
    riskRating: number;
    contingencyFunding: boolean;
    businessContinuityPlan: boolean;
}

export interface CIWMonitoring {
    quarterlyReturns: boolean;
    annualAccounts: boolean;
    welshLanguageCompliance: boolean;
    localAuthorityContracts: string[];
}

export interface CareInspectorateReturns {
    annualReturns: boolean;
    financialCertification: boolean;
    staffingSchedule: boolean;
    improvementPlan?: string;
}

export interface RQIAFinancials {
    trustContracts: string[];
    registrationFees: boolean;
    annualAccounts: boolean;
    monthlyReturns: boolean;
}

export interface HIQAAssessment {
    fairDealCompliance: boolean;
    nursingHomeSupport: boolean;
    financialAssessment: boolean;
    annualReview: boolean;
} 
