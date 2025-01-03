/**
 * @fileoverview Ofsted Financial Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Ofsted-specific financial handlers and compliance checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Logger } from '@/lib/logger';

const logger = new Logger('ofsted-financial');

export async function handleOfstedFinancialReport(
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

    // Get all financial data for the period
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
        child: {
          select: {
            id: true,
            placementType: true,
            localAuthority: true,
            fundingDetails: true,
          },
        },
      },
    });

    // Calculate Ofsted-required metrics
    const report = {
      period,
      metrics: {
        placementCosts: calculatePlacementCosts(transactions),
        localAuthorityBreakdown: calculateLocalAuthorityBreakdown(transactions),
        educationSpending: calculateEducationSpending(transactions),
        safeguardingCosts: calculateSafeguardingCosts(transactions),
        complianceMetrics: await generateOfstedComplianceMetrics(params.organizationId),
      },
      regulatoryBody: 'OFSTED',
      generatedAt: new Date().toISOString(),
    };

    // Log report generation for audit
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: session.user.id,
        action: 'GENERATE_OFSTED_REPORT',
        resourceType: 'FINANCIAL_REPORT',
        details: {
          period,
          reportType: 'OFSTED_FINANCIAL',
        },
      },
    });

    return NextResponse.json(report);
  } catch (error) {
    logger.error('Failed to generate Ofsted report', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

function calculatePlacementCosts(transactions: any[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    if (t.child?.placementType) {
      acc[t.child.placementType] = (acc[t.child.placementType] || 0) + t.amount.amount;
    }
    return acc;
  }, {});
}

function calculateLocalAuthorityBreakdown(transactions: any[]): Record<string, number> {
  return transactions.reduce((acc, t) => {
    if (t.child?.localAuthority) {
      acc[t.child.localAuthority] = (acc[t.child.localAuthority] || 0) + t.amount.amount;
    }
    return acc;
  }, {});
}

function calculateEducationSpending(transactions: any[]): number {
  return transactions
    .filter(t => t.type === 'EXPENSE' && t.category.name === 'EDUCATION')
    .reduce((sum, t) => sum + t.amount.amount, 0);
}

function calculateSafeguardingCosts(transactions: any[]): number {
  return transactions
    .filter(t => t.type === 'EXPENSE' && t.category.name === 'SAFEGUARDING')
    .reduce((sum, t) => sum + t.amount.amount, 0);
}

async function generateOfstedComplianceMetrics(organizationId: string): Promise<any> {
  const settings = await prisma.organizationSettings.findUnique({
    where: { organizationId },
    include: {
      auditSettings: true,
      safeguardingSettings: true,
    },
  });

  return {
    auditCompliance: settings?.auditSettings?.enabled || false,
    safeguardingCompliance: settings?.safeguardingSettings?.compliant || false,
    lastInspectionDate: await getLastInspectionDate(organizationId),
    staffQualifications: await getStaffQualificationsMetrics(organizationId),
  };
}

async function getLastInspectionDate(organizationId: string): Promise<string | null> {
  const lastInspection = await prisma.inspection.findFirst({
    where: {
      organizationId,
      type: 'OFSTED',
    },
    orderBy: { date: 'desc' },
  });

  return lastInspection?.date?.toISOString() || null;
}

async function getStaffQualificationsMetrics(organizationId: string): Promise<any> {
  const staff = await prisma.staff.findMany({
    where: { organizationId },
    include: { qualifications: true },
  });

  return {
    totalStaff: staff.length,
    qualifiedStaff: staff.filter(s => s.qualifications.length > 0).length,
    qualificationTypes: staff.reduce((acc, s) => {
      s.qualifications.forEach(q => {
        acc[q.type] = (acc[q.type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  };
} 
