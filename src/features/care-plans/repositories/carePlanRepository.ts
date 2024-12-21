/**
 * @fileoverview Care Plan Repository for server-side operations
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';
import type {
  CarePlan,
  CarePlanTemplate,
  CarePlanStats,
  CarePlanFilters
} from '@/features/careplans/types/careplan.types';

export class CarePlanRepository {
  async createCarePlan(data: Omit<CarePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarePlan> {
    return await prisma.carePlan.create({
      data: {
        ...data,
        goals: { create: data.goals },
        reviews: { create: data.reviews },
        riskAssessments: { create: data.riskAssessments }
      },
      include: {
        goals: true,
        reviews: true,
        riskAssessments: true
      }
    });
  }

  async getCarePlan(id: string): Promise<CarePlan | null> {
    return await prisma.carePlan.findUnique({
      where: { id },
      include: {
        goals: true,
        reviews: true,
        riskAssessments: true
      }
    });
  }

  async updateCarePlan(id: string, data: Partial<CarePlan>): Promise<CarePlan> {
    const { goals, reviews, riskAssessments, ...rest } = data;
    
    // Update the main care plan
    const updated = await prisma.carePlan.update({
      where: { id },
      data: {
        ...rest,
        updatedAt: new Date().toISOString()
      }
    });

    // Update related records if provided
    if (goals) {
      await prisma.carePlanGoal.deleteMany({ where: { carePlanId: id } });
      await prisma.carePlanGoal.createMany({ data: goals.map(g => ({ ...g, carePlanId: id })) });
    }

    if (reviews) {
      await prisma.carePlanReview.deleteMany({ where: { carePlanId: id } });
      await prisma.carePlanReview.createMany({ data: reviews.map(r => ({ ...r, carePlanId: id })) });
    }

    if (riskAssessments) {
      await prisma.riskAssessment.deleteMany({ where: { carePlanId: id } });
      await prisma.riskAssessment.createMany({ data: riskAssessments.map(r => ({ ...r, carePlanId: id })) });
    }

    return this.getCarePlan(id) as Promise<CarePlan>;
  }

  async deleteCarePlan(id: string): Promise<void> {
    await prisma.carePlan.delete({ where: { id } });
  }

  async getCarePlansByCareHome(careHomeId: string, filters?: CarePlanFilters): Promise<CarePlan[]> {
    const where: any = { careHomeId };

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.language) where.language = filters.language;
      if (filters.region) where.region = filters.region;
      if (filters.fromDate) where.createdAt = { gte: filters.fromDate };
      if (filters.toDate) where.createdAt = { ...where.createdAt, lte: filters.toDate };
      if (filters.searchTerm) {
        where.OR = [
          { title: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }
    }

    return await prisma.carePlan.findMany({
      where,
      include: {
        goals: true,
        reviews: true,
        riskAssessments: true
      },
      skip: filters?.offset,
      take: filters?.limit,
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getCarePlanStats(careHomeId: string): Promise<CarePlanStats> {
    const [total, active, archived, draft] = await Promise.all([
      prisma.carePlan.count({ where: { careHomeId } }),
      prisma.carePlan.count({ where: { careHomeId, status: 'active' } }),
      prisma.carePlan.count({ where: { careHomeId, status: 'archived' } }),
      prisma.carePlan.count({ where: { careHomeId, status: 'draft' } })
    ]);

    return {
      total,
      active,
      archived,
      draft,
      lastUpdated: new Date().toISOString()
    };
  }

  async getCarePlanTemplates(isActive: boolean = true): Promise<CarePlanTemplate[]> {
    return await prisma.carePlanTemplate.findMany({
      where: { isActive },
      orderBy: { updatedAt: 'desc' }
    });
  }
}
