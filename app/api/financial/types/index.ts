/**
 * @fileoverview Shared types for the financial module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

// Base Types
export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    createdAt: Date;
    organizationId: string;
    residentId?: string;
    metadata?: Record<string, any>;
    resident?: Resident;
}

export interface Resident {
    id: string;
    name: string;
    localAuthority?: string;
    fundingType?: string;
    carePackage?: CarePackage;
    trustArea?: string;    // RQIA specific
    hseArea?: string;      // HIQA specific
    nursingHomeSupport?: NursingHomeSupport;
}

export interface CarePackage {
    id: string;
    type: string;
    status: string;
    startDate: Date;
    endDate?: Date;
    weeklyAmount?: number;
    fundingSource: string;
}

export interface NursingHomeSupport {
    id: string;
    type: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    weeklyContribution?: number;
    assessedWeeklyMeans?: number;
    applicationDate: Date;
    reviewDate?: Date;
}

// Organization Types
export interface Organization {
    id: string;
    name: string;
    regulatoryBody: RegulatoryBody;
    settings: OrganizationSettings;
    serviceType: string;
    registrationNumber?: string;
    minimumStandards?: string[];
    nationalStandards?: string[];
    careStandards?: string[];
}

export interface OrganizationSettings {
    retentionPeriod: string;
    languages?: string[];
    auditSettings?: AuditSettings;
    complianceSettings?: ComplianceSettings;
}

export interface AuditSettings {
    enabled: boolean;
    retentionPeriod: string;
    detailLevel: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
}

export interface ComplianceSettings {
    autoCheck: boolean;
    checkFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    notifyOnFailure: boolean;
    notificationRecipients?: string[];
}

// Regulatory Types
export type RegulatoryBody = 'CQC' | 'CIW' | 'CARE_INSPECTORATE' | 'RQIA' | 'HIQA';

export interface RegulatoryReport {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    regulatoryBody: RegulatoryBody;
    period: string;
    format: 'pdf' | 'csv';
    language?: string;
    metadata: ReportMetadata;
    generatedAt: Date;
}

export interface ReportMetadata {
    organizationName: string;
    registrationNumber?: string;
    serviceType: string;
    retentionPeriod: string;
    complianceStatus: 'compliant' | 'non_compliant';
    transactionCount: number;
    totalAmount: number;
    residentCount: number;
    [key: string]: any; // Allow for regulatory body specific metadata
}

// Request/Response Types
export interface ReportRequest {
    organizationId: string;
    period: string;
    format: 'pdf' | 'csv';
    template?: string;
    language?: string;
}

export interface ComplianceRequest {
    organizationId: string;
    checkType: string;
    period?: string;
}

export interface ComplianceCheck {
    name: string;
    status: 'passed' | 'failed';
    details: string;
    timestamp?: Date;
}

export interface ComplianceResponse {
    status: 'compliant' | 'non_compliant';
    checks: ComplianceCheck[];
    timestamp: Date;
    details?: Record<string, any>;
}

// Error Types
export interface ValidationResult {
    success: boolean;
    error: string | null;
}

export interface ErrorResponse {
    error: string;
    details?: Record<string, any>;
    timestamp: Date;
}

// Metric Types
export interface MetricData {
    name: string;
    value: number;
    tags: Record<string, string>;
    timestamp: Date;
}

export interface AuditLog {
    id: string;
    organizationId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: Record<string, any>;
    createdAt: Date;
} 