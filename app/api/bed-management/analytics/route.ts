/**
 * @fileoverview Bed management analytics API routes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateRequest } from '@/lib/api';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { user } = await validateRequest(request);
    const { searchParams } = request.nextUrl;
    const metric = searchParams.get('metric');
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    switch (metric) {
      case 'occupancy-rate': {
        const [totalBeds, occupiedBeds] = await Promise.all([
          prisma.bed.count({
            where: { organizationId: user.organizationId }
          }),
          prisma.bed.count({
            where: {
              organizationId: user.organizationId,
              status: 'OCCUPIED'
            }
          })
        ]);

        return NextResponse.json({
          totalBeds,
          occupiedBeds,
          occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0
        });
      }

      case 'maintenance-stats': {
        const maintenanceStats = await prisma.bedMaintenance.groupBy({
          by: ['type'],
          where: {
            organizationId: user.organizationId,
            ...(startDate && endDate && {
              scheduledDate: {
                gte: startDate,
                lte: endDate
              }
            })
          },
          _count: true,
          _avg: {
            cost: true,
            estimatedDuration: true,
            actualDuration: true
          }
        });

        return NextResponse.json(maintenanceStats);
      }

      case 'transfer-history': {
        const transfers = await prisma.bedTransfer.findMany({
          where: {
            organizationId: user.organizationId,
            ...(startDate && endDate && {
              scheduledDate: {
                gte: startDate,
                lte: endDate
              }
            })
          },
          include: {
            sourceBed: true,
            targetBed: true,
            resident: true
          },
          orderBy: {
            scheduledDate: 'desc'
          }
        });

        return NextResponse.json(transfers);
      }

      case 'cleaning-stats': {
        const cleaningStats = await prisma.bedCleaning.groupBy({
          by: ['type', 'status'],
          where: {
            organizationId: user.organizationId,
            ...(startDate && endDate && {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            })
          },
          _count: true
        });

        const infectionControlStats = await prisma.bedCleaning.count({
          where: {
            organizationId: user.organizationId,
            type: 'INFECTION_CONTROL',
            ...(startDate && endDate && {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            })
          }
        });

        return NextResponse.json({
          cleaningStats,
          infectionControlStats,
          averageCompletionTime: await calculateAverageCleaningTime(user.organizationId, startDate, endDate)
        });
      }

      case 'risk-assessment': {
        const riskStats = await prisma.bedRiskAssessment.groupBy({
          by: ['status'],
          where: {
            organizationId: user.organizationId,
            ...(startDate && endDate && {
              assessmentDate: {
                gte: startDate,
                lte: endDate
              }
            })
          },
          _count: true
        });

        const highRiskBeds = await prisma.bed.count({
          where: {
            organizationId: user.organizationId,
            riskLevel: 'HIGH'
          }
        });

        return NextResponse.json({
          riskStats,
          highRiskBeds,
          riskDistribution: await calculateRiskDistribution(user.organizationId)
        });
      }

      case 'audit-compliance': {
        const auditStats = await prisma.bedAudit.groupBy({
          by: ['type'],
          where: {
            organizationId: user.organizationId,
            ...(startDate && endDate && {
              auditDate: {
                gte: startDate,
                lte: endDate
              }
            })
          },
          _count: true,
          _avg: {
            complianceScore: true
          }
        });

        const followUpRequired = await prisma.bedAudit.count({
          where: {
            organizationId: user.organizationId,
            followUpRequired: true,
            followUpDate: {
              gte: new Date()
            }
          }
        });

        return NextResponse.json({
          auditStats,
          followUpRequired,
          complianceTrend: await calculateComplianceTrend(user.organizationId, startDate, endDate)
        });
      }

      case 'equipment-utilization': {
        const equipmentStats = await prisma.bed.groupBy({
          by: ['specializedEquipment'],
          where: {
            organizationId: user.organizationId,
            specializedEquipment: { not: [] }
          },
          _count: true
        });

        return NextResponse.json({
          equipmentStats,
          utilizationRate: await calculateEquipmentUtilization(user.organizationId)
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid metric specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in GET /api/bed-management/analytics:', error);
    
    if (error.name === 'UnauthorizedError') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions for analytics calculations
async function calculateAverageCleaningTime(organizationId: string, startDate?: Date, endDate?: Date) {
  const cleanings = await prisma.bedCleaning.findMany({
    where: {
      organizationId,
      status: 'COMPLETED',
      ...(startDate && endDate && {
        createdAt: { gte: startDate },
        updatedAt: { lte: endDate }
      })
    },
    select: {
      createdAt: true,
      updatedAt: true,
      type: true
    }
  });

  if (cleanings.length === 0) return null;

  const averagesByType = cleanings.reduce((acc, cleaning) => {
    const duration = cleaning.updatedAt.getTime() - cleaning.createdAt.getTime();
    if (!acc[cleaning.type]) {
      acc[cleaning.type] = { total: 0, count: 0 };
    }
    acc[cleaning.type].total += duration;
    acc[cleaning.type].count++;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return Object.entries(averagesByType).reduce((acc, [type, { total, count }]) => {
    acc[type] = Math.round(total / count / (1000 * 60)); // Convert to minutes
    return acc;
  }, {} as Record<string, number>);
}

async function calculateRiskDistribution(organizationId: string) {
  const riskCounts = await prisma.bed.groupBy({
    by: ['riskLevel'],
    where: { organizationId },
    _count: true
  });

  const totalBeds = await prisma.bed.count({
    where: { organizationId }
  });

  return {
    distribution: riskCounts.reduce((acc, { riskLevel, _count }) => {
      acc[riskLevel] = {
        count: _count,
        percentage: Math.round((_count / totalBeds) * 100)
      };
      return acc;
    }, {} as Record<string, { count: number; percentage: number }>),
    totalBeds
  };
}

async function calculateComplianceTrend(organizationId: string, startDate?: Date, endDate?: Date) {
  const audits = await prisma.bedAudit.findMany({
    where: {
      organizationId,
      ...(startDate && endDate && {
        auditDate: {
          gte: startDate,
          lte: endDate
        }
      })
    },
    select: {
      auditDate: true,
      complianceScore: true,
      type: true
    },
    orderBy: {
      auditDate: 'asc'
    }
  });

  // Group by month and type
  const monthlyScores = audits.reduce((acc, audit) => {
    const monthKey = audit.auditDate.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        averageScore: 0,
        byType: {} as Record<string, { total: number; count: number }>
      };
    }
    
    if (!acc[monthKey].byType[audit.type]) {
      acc[monthKey].byType[audit.type] = { total: 0, count: 0 };
    }
    
    acc[monthKey].byType[audit.type].total += audit.complianceScore;
    acc[monthKey].byType[audit.type].count++;
    
    return acc;
  }, {} as Record<string, { month: string; averageScore: number; byType: Record<string, { total: number; count: number }> }>);

  // Calculate averages
  return Object.values(monthlyScores).map(({ month, byType }) => ({
    month,
    overall: Object.values(byType).reduce((sum, { total, count }) => sum + total / count, 0) / Object.keys(byType).length,
    byType: Object.entries(byType).reduce((acc, [type, { total, count }]) => {
      acc[type] = total / count;
      return acc;
    }, {} as Record<string, number>)
  }));
}

async function calculateEquipmentUtilization(organizationId: string) {
  const beds = await prisma.bed.findMany({
    where: {
      organizationId,
      specializedEquipment: { not: [] }
    },
    select: {
      specializedEquipment: true,
      status: true
    }
  });

  const equipmentStats = beds.reduce((acc, bed) => {
    bed.specializedEquipment.forEach(equipment => {
      if (!acc[equipment]) {
        acc[equipment] = {
          total: 0,
          inUse: 0
        };
      }
      acc[equipment].total++;
      if (bed.status === 'OCCUPIED') {
        acc[equipment].inUse++;
      }
    });
    return acc;
  }, {} as Record<string, { total: number; inUse: number }>);

  return Object.entries(equipmentStats).reduce((acc, [equipment, stats]) => {
    acc[equipment] = {
      ...stats,
      utilizationRate: Math.round((stats.inUse / stats.total) * 100)
    };
    return acc;
  }, {} as Record<string, { total: number; inUse: number; utilizationRate: number }>);
} 
