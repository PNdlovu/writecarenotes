/**
 * @fileoverview Staff Cost Management Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export interface StaffCostManagement {
    id: string;
    organizationId: string;
    period: {
        from: Date;
        to: Date;
    };
    permanentStaff: StaffCosts;
    agencyStaff: AgencyStaffCosts;
    bankStaff: BankStaffCosts;
    staffingRatios: StaffingRatios;
    qualificationPay: QualificationPayRates;
    totalCosts: {
        permanent: number;
        agency: number;
        bank: number;
        total: number;
    };
    metrics: StaffCostMetrics;
}

export interface StaffCosts {
    nursingStaff: {
        count: number;
        totalHours: number;
        basicPay: number;
        overtime: number;
        allowances: number;
        nationalInsurance: number;
        pension: number;
        total: number;
    };
    careStaff: {
        count: number;
        totalHours: number;
        basicPay: number;
        overtime: number;
        allowances: number;
        nationalInsurance: number;
        pension: number;
        total: number;
    };
    ancillaryStaff: {
        count: number;
        totalHours: number;
        basicPay: number;
        overtime: number;
        allowances: number;
        nationalInsurance: number;
        pension: number;
        total: number;
    };
    managementStaff: {
        count: number;
        totalHours: number;
        basicPay: number;
        overtime: number;
        allowances: number;
        nationalInsurance: number;
        pension: number;
        total: number;
    };
}

export interface AgencyStaffCosts {
    nursingStaff: {
        hours: number;
        rate: number;
        total: number;
        agency: string;
    }[];
    careStaff: {
        hours: number;
        rate: number;
        total: number;
        agency: string;
    }[];
    totalCost: number;
    agencyBreakdown: {
        agencyName: string;
        totalHours: number;
        totalCost: number;
        averageRate: number;
    }[];
}

export interface BankStaffCosts {
    nursingStaff: {
        hours: number;
        rate: number;
        total: number;
    };
    careStaff: {
        hours: number;
        rate: number;
        total: number;
    };
    totalCost: number;
    utilizationRate: number;
}

export interface StaffingRatios {
    overall: {
        targetRatio: number;
        actualRatio: number;
        variance: number;
    };
    nursing: {
        targetRatio: number;
        actualRatio: number;
        variance: number;
    };
    care: {
        targetRatio: number;
        actualRatio: number;
        variance: number;
    };
    shifts: {
        morning: {
            required: number;
            actual: number;
            variance: number;
        };
        afternoon: {
            required: number;
            actual: number;
            variance: number;
        };
        night: {
            required: number;
            actual: number;
            variance: number;
        };
    };
}

export interface QualificationPayRates {
    nursing: {
        qualification: string;
        baseRate: number;
        experienceIncrements: {
            years: number;
            increment: number;
        }[];
    }[];
    care: {
        qualification: string;
        baseRate: number;
        experienceIncrements: {
            years: number;
            increment: number;
        }[];
    }[];
    specialistRoles: {
        role: string;
        additionalAllowance: number;
        requirements: string[];
    }[];
}

export interface StaffCostMetrics {
    costPerResident: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    costPerBed: {
        daily: number;
        weekly: number;
        monthly: number;
    };
    agencyUsage: {
        percentageOfTotalHours: number;
        percentageOfTotalCost: number;
        trendLastThreeMonths: number[];
    };
    overtimeMetrics: {
        percentageOfTotalHours: number;
        costImpact: number;
        trendLastThreeMonths: number[];
    };
    turnoverMetrics: {
        rate: number;
        costImpact: number;
        trendLastThreeMonths: number[];
    };
    livingWageCompliance: {
        compliantCount: number;
        totalCount: number;
        percentageCompliant: number;
        actionRequired: boolean;
    };
} 