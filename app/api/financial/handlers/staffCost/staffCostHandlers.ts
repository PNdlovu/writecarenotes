/**
 * @fileoverview Staff Cost Management Handlers
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
    StaffCostManagement,
    StaffCosts,
    AgencyStaffCosts,
    BankStaffCosts,
    StaffingRatios,
    QualificationPayRates,
    StaffCostMetrics
} from '../../types/staffCost';

const metrics = FinancialMetrics.getInstance();
const auditLogger = AuditLogger.getInstance();

export async function createStaffCostRecord(
    organizationId: string,
    userId: string,
    data: Omit<StaffCostManagement, 'id' | 'metrics'>
): Promise<StaffCostManagement> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Calculate metrics
    const calculatedMetrics = calculateStaffCostMetrics(data);

    // Create staff cost record
    const staffCost = await prisma.staffCostManagement.create({
        data: {
            ...data,
            metrics: calculatedMetrics,
            organizationId
        }
    });

    // Record metrics
    metrics.recordTransactionMetric(
        staffCost.totalCosts.total,
        {
            regulatory_body: organization.regulatoryBody,
            transaction_type: 'STAFF_COSTS',
            currency: 'GBP'
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_STAFF_COST_RECORD',
        'STAFF_COST',
        staffCost.id,
        {
            period: data.period,
            totalCosts: data.totalCosts
        }
    );

    return staffCost;
}

export async function updateAgencyStaffCosts(
    organizationId: string,
    userId: string,
    staffCostId: string,
    data: AgencyStaffCosts
): Promise<StaffCostManagement> {
    const staffCost = await prisma.staffCostManagement.findFirst({
        where: {
            id: staffCostId,
            organizationId
        }
    });

    if (!staffCost) {
        throw new ValidationError('Staff cost record not found');
    }

    // Update agency costs
    const updatedStaffCost = await prisma.staffCostManagement.update({
        where: { id: staffCostId },
        data: {
            agencyStaff: data,
            totalCosts: {
                ...staffCost.totalCosts,
                agency: calculateTotalAgencyCost(data),
                total: recalculateTotalCost({
                    ...staffCost.totalCosts,
                    agency: calculateTotalAgencyCost(data)
                })
            }
        }
    });

    // Record metric
    metrics.recordTransactionMetric(
        calculateTotalAgencyCost(data),
        {
            regulatory_body: staffCost.regulatoryBody,
            transaction_type: 'AGENCY_STAFF_COSTS',
            currency: 'GBP'
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'UPDATE_AGENCY_COSTS',
        'STAFF_COST',
        staffCostId,
        {
            totalAgencyCost: calculateTotalAgencyCost(data),
            agencyBreakdown: data.agencyBreakdown
        }
    );

    return updatedStaffCost;
}

export async function updateStaffingRatios(
    organizationId: string,
    userId: string,
    staffCostId: string,
    data: StaffingRatios
): Promise<StaffCostManagement> {
    const staffCost = await prisma.staffCostManagement.findFirst({
        where: {
            id: staffCostId,
            organizationId
        }
    });

    if (!staffCost) {
        throw new ValidationError('Staff cost record not found');
    }

    // Validate ratios
    validateStaffingRatios(data);

    // Update ratios
    const updatedStaffCost = await prisma.staffCostManagement.update({
        where: { id: staffCostId },
        data: {
            staffingRatios: data
        }
    });

    // Record metrics
    Object.entries(data.shifts).forEach(([shift, ratios]) => {
        metrics.recordTransactionMetric(
            ratios.variance,
            {
                regulatory_body: staffCost.regulatoryBody,
                transaction_type: 'STAFFING_RATIO',
                shift,
                currency: 'GBP'
            }
        );
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'UPDATE_STAFFING_RATIOS',
        'STAFF_COST',
        staffCostId,
        {
            overallRatio: data.overall,
            shiftRatios: data.shifts
        }
    );

    return updatedStaffCost;
}

export async function updateQualificationPayRates(
    organizationId: string,
    userId: string,
    staffCostId: string,
    data: QualificationPayRates
): Promise<StaffCostManagement> {
    const staffCost = await prisma.staffCostManagement.findFirst({
        where: {
            id: staffCostId,
            organizationId
        }
    });

    if (!staffCost) {
        throw new ValidationError('Staff cost record not found');
    }

    // Update pay rates
    const updatedStaffCost = await prisma.staffCostManagement.update({
        where: { id: staffCostId },
        data: {
            qualificationPay: data
        }
    });

    // Record metrics for each role type
    data.nursing.forEach(rate => {
        metrics.recordTransactionMetric(
            rate.baseRate,
            {
                regulatory_body: staffCost.regulatoryBody,
                transaction_type: 'QUALIFICATION_PAY',
                role_type: 'NURSING',
                qualification: rate.qualification,
                currency: 'GBP'
            }
        );
    });

    data.care.forEach(rate => {
        metrics.recordTransactionMetric(
            rate.baseRate,
            {
                regulatory_body: staffCost.regulatoryBody,
                transaction_type: 'QUALIFICATION_PAY',
                role_type: 'CARE',
                qualification: rate.qualification,
                currency: 'GBP'
            }
        );
    });

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'UPDATE_QUALIFICATION_PAY',
        'STAFF_COST',
        staffCostId,
        {
            nursingRates: data.nursing.length,
            careRates: data.care.length,
            specialistRoles: data.specialistRoles.length
        }
    );

    return updatedStaffCost;
}

function calculateStaffCostMetrics(data: Omit<StaffCostManagement, 'id' | 'metrics'>): StaffCostMetrics {
    const residentCount = 50; // This would come from the database
    const bedCount = 60; // This would come from the database

    const metrics: StaffCostMetrics = {
        costPerResident: {
            daily: data.totalCosts.total / (365 * residentCount),
            weekly: data.totalCosts.total / (52 * residentCount),
            monthly: data.totalCosts.total / (12 * residentCount)
        },
        costPerBed: {
            daily: data.totalCosts.total / (365 * bedCount),
            weekly: data.totalCosts.total / (52 * bedCount),
            monthly: data.totalCosts.total / (12 * bedCount)
        },
        agencyUsage: {
            percentageOfTotalHours: calculateAgencyHoursPercentage(data),
            percentageOfTotalCost: (data.totalCosts.agency / data.totalCosts.total) * 100,
            trendLastThreeMonths: [] // This would come from historical data
        },
        overtimeMetrics: {
            percentageOfTotalHours: calculateOvertimePercentage(data),
            costImpact: calculateOvertimeCost(data),
            trendLastThreeMonths: [] // This would come from historical data
        },
        turnoverMetrics: {
            rate: 0, // This would be calculated from HR data
            costImpact: 0, // This would be calculated from recruitment costs
            trendLastThreeMonths: [] // This would come from historical data
        },
        livingWageCompliance: calculateLivingWageCompliance(data)
    };

    return metrics;
}

function calculateTotalAgencyCost(agencyStaff: AgencyStaffCosts): number {
    return agencyStaff.totalCost;
}

function recalculateTotalCost(costs: { permanent: number; agency: number; bank: number }): number {
    return costs.permanent + costs.agency + costs.bank;
}

function validateStaffingRatios(ratios: StaffingRatios): void {
    if (ratios.overall.actualRatio < ratios.overall.targetRatio) {
        throw new ValidationError('Overall staffing ratio below target');
    }

    Object.values(ratios.shifts).forEach(shift => {
        if (shift.actual < shift.required) {
            throw new ValidationError(`Shift staffing below required level`);
        }
    });
}

function calculateAgencyHoursPercentage(data: any): number {
    const totalAgencyHours = data.agencyStaff.nursingStaff.reduce((total: number, staff: any) => total + staff.hours, 0) +
        data.agencyStaff.careStaff.reduce((total: number, staff: any) => total + staff.hours, 0);

    const totalHours = totalAgencyHours +
        data.permanentStaff.nursingStaff.totalHours +
        data.permanentStaff.careStaff.totalHours +
        data.bankStaff.nursingStaff.hours +
        data.bankStaff.careStaff.hours;

    return (totalAgencyHours / totalHours) * 100;
}

function calculateOvertimePercentage(data: any): number {
    const totalOvertimeHours = Object.values(data.permanentStaff).reduce((total: number, staff: any) => {
        return total + (staff.overtime / staff.basicPay) * staff.totalHours;
    }, 0);

    const totalHours = Object.values(data.permanentStaff).reduce((total: number, staff: any) => {
        return total + staff.totalHours;
    }, 0);

    return (totalOvertimeHours / totalHours) * 100;
}

function calculateOvertimeCost(data: any): number {
    return Object.values(data.permanentStaff).reduce((total: number, staff: any) => {
        return total + staff.overtime;
    }, 0);
}

function calculateLivingWageCompliance(data: any): {
    compliantCount: number;
    totalCount: number;
    percentageCompliant: number;
    actionRequired: boolean;
} {
    const livingWage = 10.90; // This would come from configuration
    let compliantCount = 0;
    let totalCount = 0;

    Object.values(data.permanentStaff).forEach((staff: any) => {
        const hourlyRate = staff.basicPay / staff.totalHours;
        totalCount += staff.count;
        if (hourlyRate >= livingWage) {
            compliantCount += staff.count;
        }
    });

    return {
        compliantCount,
        totalCount,
        percentageCompliant: (compliantCount / totalCount) * 100,
        actionRequired: compliantCount < totalCount
    };
} 
