/**
 * @fileoverview Resident Financial Assessment Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { FinancialMetrics } from '../../utils/metrics';
import { AuditLogger } from '../../utils/audit';
import { ValidationError } from '../../utils/errors';
import type {
    ResidentFinancialAssessment,
    FinancialDetails,
    BenefitsCheck,
    LocalAuthorityContribution,
    PaymentPlan,
    AssessmentDocument,
    FinancialReview,
    PaymentHistory
} from '../../types/residentFinancial';

const metrics = FinancialMetrics.getInstance();
const auditLogger = AuditLogger.getInstance();

export async function createFinancialAssessment(
    organizationId: string,
    userId: string,
    data: Omit<ResidentFinancialAssessment, 'id'>
): Promise<ResidentFinancialAssessment> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Create assessment
    const assessment = await prisma.residentFinancialAssessment.create({
        data: {
            ...data,
            status: 'IN_PROGRESS',
            assessmentDate: new Date()
        }
    });

    // Record metric
    metrics.recordTransactionMetric(
        calculateTotalIncome(data.financialDetails),
        {
            regulatory_body: organization.regulatoryBody,
            transaction_type: 'FINANCIAL_ASSESSMENT',
            currency: 'GBP'
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_FINANCIAL_ASSESSMENT',
        'FINANCIAL_ASSESSMENT',
        assessment.id,
        {
            residentId: data.residentId,
            assessor: data.assessor
        }
    );

    return assessment;
}

export async function performBenefitsCheck(
    organizationId: string,
    userId: string,
    assessmentId: string,
    financialDetails: FinancialDetails
): Promise<BenefitsCheck> {
    const assessment = await prisma.residentFinancialAssessment.findFirst({
        where: {
            id: assessmentId,
            organizationId
        }
    });

    if (!assessment) {
        throw new ValidationError('Assessment not found');
    }

    // Perform benefits eligibility checks
    const eligibleBenefits = checkBenefitsEligibility(financialDetails);

    // Create benefits check record
    const benefitsCheck = await prisma.benefitsCheck.create({
        data: {
            assessmentId,
            checkDate: new Date(),
            eligibleBenefits,
            recommendations: generateRecommendations(eligibleBenefits),
            nextReviewDate: calculateNextReviewDate()
        }
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'PERFORM_BENEFITS_CHECK',
        'BENEFITS_CHECK',
        benefitsCheck.id,
        {
            assessmentId,
            eligibleBenefitsCount: eligibleBenefits.length
        }
    );

    return benefitsCheck;
}

export async function createPaymentPlan(
    organizationId: string,
    userId: string,
    assessmentId: string,
    data: Omit<PaymentPlan, 'id'>
): Promise<PaymentPlan> {
    const assessment = await prisma.residentFinancialAssessment.findFirst({
        where: {
            id: assessmentId,
            organizationId
        }
    });

    if (!assessment) {
        throw new ValidationError('Assessment not found');
    }

    // Validate payment plan totals
    validatePaymentPlan(data);

    // Create payment plan
    const paymentPlan = await prisma.paymentPlan.create({
        data: {
            ...data,
            status: 'DRAFT'
        }
    });

    // Record metric
    metrics.recordTransactionMetric(
        data.totalWeeklyCharge * 52,
        {
            regulatory_body: assessment.regulatoryBody,
            transaction_type: 'PAYMENT_PLAN_CREATION',
            currency: 'GBP'
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_PAYMENT_PLAN',
        'PAYMENT_PLAN',
        paymentPlan.id,
        {
            assessmentId,
            totalWeeklyCharge: data.totalWeeklyCharge,
            startDate: data.startDate
        }
    );

    return paymentPlan;
}

export async function uploadAssessmentDocument(
    organizationId: string,
    userId: string,
    assessmentId: string,
    data: Omit<AssessmentDocument, 'id' | 'uploadDate' | 'uploadedBy' | 'status'>
): Promise<AssessmentDocument> {
    const assessment = await prisma.residentFinancialAssessment.findFirst({
        where: {
            id: assessmentId,
            organizationId
        }
    });

    if (!assessment) {
        throw new ValidationError('Assessment not found');
    }

    // Create document record
    const document = await prisma.assessmentDocument.create({
        data: {
            ...data,
            assessmentId,
            uploadDate: new Date(),
            uploadedBy: userId,
            status: 'PENDING_REVIEW'
        }
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'UPLOAD_ASSESSMENT_DOCUMENT',
        'ASSESSMENT_DOCUMENT',
        document.id,
        {
            assessmentId,
            documentType: data.type,
            filename: data.filename
        }
    );

    return document;
}

export async function createFinancialReview(
    organizationId: string,
    userId: string,
    assessmentId: string,
    data: Omit<FinancialReview, 'id' | 'reviewDate' | 'reviewer'>
): Promise<FinancialReview> {
    const assessment = await prisma.residentFinancialAssessment.findFirst({
        where: {
            id: assessmentId,
            organizationId
        }
    });

    if (!assessment) {
        throw new ValidationError('Assessment not found');
    }

    // Create review record
    const review = await prisma.financialReview.create({
        data: {
            ...data,
            assessmentId,
            reviewDate: new Date(),
            reviewer: userId
        }
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_FINANCIAL_REVIEW',
        'FINANCIAL_REVIEW',
        review.id,
        {
            assessmentId,
            type: data.type,
            outcome: data.outcome
        }
    );

    return review;
}

function calculateTotalIncome(financialDetails: FinancialDetails): number {
    const { income } = financialDetails;
    const annualMultiplier = income.frequency === 'WEEKLY' ? 52 : income.frequency === 'MONTHLY' ? 12 : 1;
    
    return Object.entries(income)
        .filter(([key]) => key !== 'frequency')
        .reduce((total, [_, value]) => total + (value || 0), 0) * annualMultiplier;
}

function checkBenefitsEligibility(financialDetails: FinancialDetails): any[] {
    // Implementation would include complex eligibility rules
    return []; // Placeholder
}

function generateRecommendations(eligibleBenefits: any[]): string[] {
    // Implementation would generate recommendations based on eligibility
    return []; // Placeholder
}

function calculateNextReviewDate(): Date {
    // Default to 12 months from now
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
}

function validatePaymentPlan(plan: Omit<PaymentPlan, 'id'>): void {
    const totalContributions = (plan.residentContribution || 0) +
        (plan.thirdPartyContribution || 0) +
        (plan.localAuthorityContribution || 0);

    if (totalContributions !== plan.totalWeeklyCharge) {
        throw new ValidationError('Total contributions do not match weekly charge');
    }
} 