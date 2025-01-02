/**
 * @fileoverview Care Package Financial Management Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { FinancialMetrics } from '../../utils/metrics';
import { AuditLogger } from '../../utils/audit';
import { ValidationError, ComplianceError } from '../../utils/errors';
import type {
    CarePackageFinancial,
    FundingAssessment,
    RateCalculation,
    TopUpAgreement,
    FeeChange,
    FundingType,
    CareLevel
} from '../../types/carePackage';

const metrics = FinancialMetrics.getInstance();
const auditLogger = AuditLogger.getInstance();

export async function createCarePackage(
    organizationId: string,
    userId: string,
    data: Omit<CarePackageFinancial, 'id'>
): Promise<CarePackageFinancial> {
    // Validate organization exists and user has permissions
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Validate resident exists
    const resident = await prisma.resident.findUnique({
        where: { id: data.residentId }
    });

    if (!resident) {
        throw new ValidationError('Resident not found');
    }

    // Create care package
    const carePackage = await prisma.carePackage.create({
        data: {
            ...data,
            organizationId,
            status: 'PENDING'
        }
    });

    // Record metric
    metrics.recordTransactionMetric(data.weeklyRate * 52, {
        regulatory_body: organization.regulatoryBody,
        transaction_type: 'CARE_PACKAGE_CREATION',
        currency: 'GBP',
        funding_type: data.fundingType
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_CARE_PACKAGE',
        'CARE_PACKAGE',
        carePackage.id,
        {
            fundingType: data.fundingType,
            careLevel: data.careLevel,
            weeklyRate: data.weeklyRate
        }
    );

    return carePackage;
}

export async function updateCarePackage(
    organizationId: string,
    userId: string,
    carePackageId: string,
    data: Partial<CarePackageFinancial>
): Promise<CarePackageFinancial> {
    // Validate care package exists and belongs to organization
    const existingPackage = await prisma.carePackage.findFirst({
        where: {
            id: carePackageId,
            organizationId
        }
    });

    if (!existingPackage) {
        throw new ValidationError('Care package not found');
    }

    // Update care package
    const updatedPackage = await prisma.carePackage.update({
        where: { id: carePackageId },
        data
    });

    // Record metric if rate changed
    if (data.weeklyRate && data.weeklyRate !== existingPackage.weeklyRate) {
        metrics.recordTransactionMetric(
            (data.weeklyRate - existingPackage.weeklyRate) * 52,
            {
                regulatory_body: existingPackage.regulatoryBody,
                transaction_type: 'CARE_PACKAGE_UPDATE',
                currency: 'GBP',
                funding_type: existingPackage.fundingType
            }
        );
    }

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'UPDATE_CARE_PACKAGE',
        'CARE_PACKAGE',
        carePackageId,
        {
            changes: Object.keys(data).map(key => ({
                field: key,
                oldValue: existingPackage[key],
                newValue: data[key]
            }))
        }
    );

    return updatedPackage;
}

export async function calculateRate(
    organizationId: string,
    careLevel: CareLevel,
    fundingType: FundingType
): Promise<RateCalculation> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            rateCards: true
        }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Get base rate from rate card
    const baseRate = organization.rateCards.find(
        card => card.careLevel === careLevel
    )?.baseRate;

    if (!baseRate) {
        throw new ValidationError('Rate not found for care level');
    }

    // Calculate contributions based on funding type
    const calculation: RateCalculation = {
        baseRate,
        totalWeeklyRate: baseRate,
        effectiveDate: new Date()
    };

    switch (fundingType) {
        case 'NHS_CONTINUING_HEALTHCARE':
            calculation.nhsContribution = baseRate;
            break;
        case 'FUNDED_NURSING_CARE':
            calculation.nhsContribution = 209.19; // Current FNC rate
            calculation.residentContribution = baseRate - 209.19;
            break;
        case 'FREE_PERSONAL_CARE':
            calculation.localAuthorityContribution = 193.50; // Current FPC rate
            calculation.residentContribution = baseRate - 193.50;
            break;
        case 'LOCAL_AUTHORITY':
            calculation.localAuthorityContribution = baseRate;
            break;
        case 'SELF_FUNDED':
            calculation.residentContribution = baseRate;
            break;
        // Add other funding types...
    }

    return calculation;
}

export async function createFundingAssessment(
    organizationId: string,
    userId: string,
    data: Omit<FundingAssessment, 'id'>
): Promise<FundingAssessment> {
    // Validate care package exists and belongs to organization
    const carePackage = await prisma.carePackage.findFirst({
        where: {
            id: data.carePackageId,
            organizationId
        }
    });

    if (!carePackage) {
        throw new ValidationError('Care package not found');
    }

    // Create funding assessment
    const assessment = await prisma.fundingAssessment.create({
        data: {
            ...data,
            assessmentDate: new Date()
        }
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_FUNDING_ASSESSMENT',
        'FUNDING_ASSESSMENT',
        assessment.id,
        {
            carePackageId: data.carePackageId,
            fundingType: data.fundingType,
            outcome: data.outcome
        }
    );

    return assessment;
}

export async function createTopUpAgreement(
    organizationId: string,
    userId: string,
    data: Omit<TopUpAgreement, 'id'>
): Promise<TopUpAgreement> {
    // Validate care package exists and belongs to organization
    const carePackage = await prisma.carePackage.findFirst({
        where: {
            id: data.carePackageId,
            organizationId
        }
    });

    if (!carePackage) {
        throw new ValidationError('Care package not found');
    }

    // Create top-up agreement
    const agreement = await prisma.topUpAgreement.create({
        data: {
            ...data,
            status: 'PENDING'
        }
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_TOPUP_AGREEMENT',
        'TOPUP_AGREEMENT',
        agreement.id,
        {
            carePackageId: data.carePackageId,
            weeklyAmount: data.weeklyAmount,
            payorType: data.payorType
        }
    );

    return agreement;
}

export async function createFeeChange(
    organizationId: string,
    userId: string,
    data: Omit<FeeChange, 'id'>
): Promise<FeeChange> {
    // Validate care package exists and belongs to organization
    const carePackage = await prisma.carePackage.findFirst({
        where: {
            id: data.carePackageId,
            organizationId
        }
    });

    if (!carePackage) {
        throw new ValidationError('Care package not found');
    }

    // Create fee change record
    const feeChange = await prisma.feeChange.create({
        data: {
            ...data,
            status: 'PENDING',
            notificationDate: new Date()
        }
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_FEE_CHANGE',
        'FEE_CHANGE',
        feeChange.id,
        {
            carePackageId: data.carePackageId,
            changeType: data.changeType,
            previousRate: data.previousWeeklyRate,
            newRate: data.newWeeklyRate
        }
    );

    return feeChange;
} 