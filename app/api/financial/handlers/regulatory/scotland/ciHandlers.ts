/**
 * @fileoverview Care Inspectorate Financial Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Care Inspectorate (Scotland) specific financial handlers and compliance checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';

const logger = new Logger('ci-financial');

export async function handleCIFinancialReport(
  req: NextRequest,
  { params }: { params: { organizationId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId === params.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period');

    // Get all financial data for the period with Scottish-specific requirements
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        organizationId: params.organizationId,
        date: {
          gte: new Date(period + '-01'),
          lt: new Date(period + '-01').setMonth(new Date(period + '-01').getMonth() + 1),
        },
      },
      include: {
        category: true,
        resident: {
          select: {
            id: true,
            fundingType: true,
            weeklyFee: true,
            localAuthority: true,
            carePackage: true,
            healthBoard: true,
          },
        },
      },
    });

    // Calculate Care Inspectorate required metrics
    const report = {
      period,
      metrics: {
        totalRevenue: calculateTotalRevenue(transactions),
        fundingBreakdown: calculateFundingBreakdown(transactions),
        occupancyRate: await calculateOccupancyRate(params.organizationId, period),
        staffingCosts: calculateStaffingCosts(transactions),
        healthBoardMetrics: await calculateHealthBoardMetrics(params.organizationId),
        nationalCareStandards: await calculateNationalCareStandardsMetrics(params.organizationId),
        localAuthorityBreakdown: calculateLocalAuthorityBreakdown(transactions),
        complianceMetrics: await generateCIComplianceMetrics(params.organizationId),
      },
      regulatoryBody: 'CI',
      generatedAt: new Date().toISOString(),
      languages: ['en', 'gd'], // English and Scottish Gaelic
    };

    // Log report generation for audit
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: session.user.id,
        action: 'GENERATE_CI_REPORT',
        resourceType: 'FINANCIAL_REPORT',
        details: {
          period,
          reportType: 'CI_FINANCIAL',
          languages: ['en', 'gd'],
        },
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    logger.error('Failed to generate Care Inspectorate report', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function calculateHealthBoardMetrics(organizationId: string): Promise<any> {
  const residents = await prisma.resident.findMany({
    where: { organizationId },
    select: {
      healthBoard: true,
      carePackage: {
        select: {
          nhsFunded: true,
          weeklyNHSContribution: true,
        },
      },
    },
  });

  return {
    healthBoardBreakdown: residents.reduce((acc, r) => {
      if (r.healthBoard) {
        acc[r.healthBoard] = {
          count: (acc[r.healthBoard]?.count || 0) + 1,
          nhsFunded: (acc[r.healthBoard]?.nhsFunded || 0) + (r.carePackage?.nhsFunded ? 1 : 0),
          totalNHSContribution: (acc[r.healthBoard]?.totalNHSContribution || 0) + 
            (r.carePackage?.weeklyNHSContribution?.amount || 0),
        };
      }
      return acc;
    }, {} as Record<string, { count: number; nhsFunded: number; totalNHSContribution: number }>),
  };
}

async function calculateNationalCareStandardsMetrics(organizationId: string): Promise<any> {
  const [services, staff] = await Promise.all([
    prisma.service.findMany({
      where: { organizationId },
      include: {
        nationalCareStandards: true,
      },
    }),
    prisma.staff.findMany({
      where: { organizationId },
      include: {
        qualifications: {
          where: {
            type: {
              in: ['SVQ', 'HNC', 'SSSC_REGISTERED'],
            },
          },
        },
      },
    }),
  ]);

  return {
    serviceStandards: services.reduce((acc, s) => {
      s.nationalCareStandards.forEach(std => {
        acc[std.code] = {
          compliant: (acc[std.code]?.compliant || 0) + (std.compliant ? 1 : 0),
          total: (acc[std.code]?.total || 0) + 1,
        };
      });
      return acc;
    }, {} as Record<string, { compliant: number; total: number }>),
    staffQualifications: {
      svqQualified: staff.filter(s => s.qualifications.some(q => q.type === 'SVQ')).length,
      hncQualified: staff.filter(s => s.qualifications.some(q => q.type === 'HNC')).length,
      ssscRegistered: staff.filter(s => s.qualifications.some(q => q.type === 'SSSC_REGISTERED')).length,
      totalStaff: staff.length,
    },
  };
}

function calculateLocalAuthorityBreakdown(transactions: any[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    if (t.resident?.localAuthority) {
      acc[t.resident.localAuthority] = (acc[t.resident.localAuthority] || 0) + t.amount.amount;
    }
    return acc;
  }, {});
}

async function generateCIComplianceMetrics(organizationId: string): Promise<any> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    include: {
      auditSettings: true,
      nationalCareStandardsSettings: true,
    },
  });

  return {
    auditCompliance: settings?.auditSettings?.enabled || false,
    nationalCareStandardsCompliance: settings?.nationalCareStandardsSettings?.compliant || false,
    lastInspectionDate: await getLastInspectionDate(organizationId),
    staffQualifications: await getStaffQualificationsMetrics(organizationId),
  };
}

// Reuse common functions
async function calculateOccupancyRate(organizationId: string, period: string): Promise<number> {
  const beds = await prisma.bed.count({
    where: { organizationId },
  });

  const occupiedBeds = await prisma.bed.count({
    where: {
      organizationId,
      status: 'OCCUPIED',
      resident: {
        admissionDate: {
          lte: new Date(period + '-01'),
        },
        dischargeDate: {
          gte: new Date(period + '-01'),
        },
      },
    },
  });

  return (occupiedBeds / beds) * 100;
}

function calculateTotalRevenue(transactions: any[]): number {
  return transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount.amount, 0);
}

function calculateFundingBreakdown(transactions: any[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    if (t.resident?.fundingType) {
      acc[t.resident.fundingType] = (acc[t.resident.fundingType] || 0) + t.amount.amount;
    }
    return acc;
  }, {});
}

function calculateStaffingCosts(transactions: any[]): number {
  return transactions
    .filter(t => t.type === 'EXPENSE' && t.category.name === 'STAFFING')
    .reduce((sum, t) => sum + t.amount.amount, 0);
}

async function getLastInspectionDate(organizationId: string): Promise<string | null> {
  const lastInspection = await prisma.inspection.findFirst({
    where: {
      organizationId,
      type: 'CI',
    },
    orderBy: { date: 'desc' },
  });

  return lastInspection?.date?.toISOString() || null;
}

async function getStaffQualificationsMetrics(organizationId: string): Promise<any> {
  const staff = await prisma.staff.findMany({
    where: { organizationId },
    include: {
      qualifications: true,
      ssscRegistration: true,
    },
  });

  return {
    totalStaff: staff.length,
    qualifiedStaff: staff.filter(s => s.qualifications.length > 0).length,
    ssscRegisteredStaff: staff.filter(s => s.ssscRegistration?.active).length,
    qualificationTypes: staff.reduce((acc, s) => {
      s.qualifications.forEach(q => {
        acc[q.type] = (acc[q.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  };
} 
