/**
 * @fileoverview RQIA Financial Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * RQIA (Northern Ireland) specific financial handlers and compliance checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';

const logger = new Logger('rqia-financial');

export async function handleRQIAFinancialReport(
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

    // Get all financial data for the period with Northern Ireland specific requirements
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
            trustArea: true,
            carePackage: true,
            hscTrust: true,
          },
        },
      },
    });

    // Calculate RQIA required metrics
    const report = {
      period,
      metrics: {
        totalRevenue: calculateTotalRevenue(transactions),
        fundingBreakdown: calculateFundingBreakdown(transactions),
        occupancyRate: await calculateOccupancyRate(params.organizationId, period),
        staffingCosts: calculateStaffingCosts(transactions),
        hscTrustMetrics: await calculateHSCTrustMetrics(params.organizationId),
        minimumStandards: await calculateMinimumStandardsMetrics(params.organizationId),
        trustAreaBreakdown: calculateTrustAreaBreakdown(transactions),
        complianceMetrics: await generateRQIAComplianceMetrics(params.organizationId),
      },
      regulatoryBody: 'RQIA',
      generatedAt: new Date().toISOString(),
      languages: ['en', 'ga'], // English and Irish
    };

    // Log report generation for audit
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: session.user.id,
        action: 'GENERATE_RQIA_REPORT',
        resourceType: 'FINANCIAL_REPORT',
        details: {
          period,
          reportType: 'RQIA_FINANCIAL',
          languages: ['en', 'ga'],
        },
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    logger.error('Failed to generate RQIA report', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

async function calculateHSCTrustMetrics(organizationId: string): Promise<any> {
  const residents = await prisma.resident.findMany({
    where: { organizationId },
    select: {
      hscTrust: true,
      carePackage: {
        select: {
          trustFunded: true,
          weeklyTrustContribution: true,
        },
      },
    },
  });

  return {
    trustBreakdown: residents.reduce((acc, r) => {
      if (r.hscTrust) {
        acc[r.hscTrust] = {
          count: (acc[r.hscTrust]?.count || 0) + 1,
          trustFunded: (acc[r.hscTrust]?.trustFunded || 0) + (r.carePackage?.trustFunded ? 1 : 0),
          totalTrustContribution: (acc[r.hscTrust]?.totalTrustContribution || 0) + 
            (r.carePackage?.weeklyTrustContribution?.amount || 0),
        };
      }
      return acc;
    }, {} as Record<string, { count: number; trustFunded: number; totalTrustContribution: number }>),
  };
}

async function calculateMinimumStandardsMetrics(organizationId: string): Promise<any> {
  const [services, staff] = await Promise.all([
    prisma.service.findMany({
      where: { organizationId },
      include: {
        minimumStandards: true,
      },
    }),
    prisma.staff.findMany({
      where: { organizationId },
      include: {
        qualifications: {
          where: {
            type: {
              in: ['QCF', 'NVQ', 'NISCC_REGISTERED'],
            },
          },
        },
      },
    }),
  ]);

  return {
    serviceStandards: services.reduce((acc, s) => {
      s.minimumStandards.forEach(std => {
        acc[std.code] = {
          compliant: (acc[std.code]?.compliant || 0) + (std.compliant ? 1 : 0),
          total: (acc[std.code]?.total || 0) + 1,
        };
      });
      return acc;
    }, {} as Record<string, { compliant: number; total: number }>),
    staffQualifications: {
      qcfQualified: staff.filter(s => s.qualifications.some(q => q.type === 'QCF')).length,
      nvqQualified: staff.filter(s => s.qualifications.some(q => q.type === 'NVQ')).length,
      nisccRegistered: staff.filter(s => s.qualifications.some(q => q.type === 'NISCC_REGISTERED')).length,
      totalStaff: staff.length,
    },
  };
}

function calculateTrustAreaBreakdown(transactions: any[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    if (t.resident?.trustArea) {
      acc[t.resident.trustArea] = (acc[t.resident.trustArea] || 0) + t.amount.amount;
    }
    return acc;
  }, {});
}

async function generateRQIAComplianceMetrics(organizationId: string): Promise<any> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    include: {
      auditSettings: true,
      minimumStandardsSettings: true,
    },
  });

  return {
    auditCompliance: settings?.auditSettings?.enabled || false,
    minimumStandardsCompliance: settings?.minimumStandardsSettings?.compliant || false,
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
      type: 'RQIA',
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
      nisccRegistration: true,
    },
  });

  return {
    totalStaff: staff.length,
    qualifiedStaff: staff.filter(s => s.qualifications.length > 0).length,
    nisccRegisteredStaff: staff.filter(s => s.nisccRegistration?.active).length,
    qualificationTypes: staff.reduce((acc, s) => {
      s.qualifications.forEach(q => {
        acc[q.type] = (acc[q.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  };
} 
