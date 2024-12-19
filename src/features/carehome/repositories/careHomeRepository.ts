import { prisma } from '@/lib/prisma';
import { CareHomeWithRelations, CreateCareHomeDTO, CareHomeSearchParams, CareHomeFilterOptions } from '@/features/carehome/types/carehome.types';
import { Prisma } from '@prisma/client';
import { CacheService } from '@/lib/cache';
import { AuditService } from '@/lib/audit';
import { AuditLogOptions } from '@/lib/audit';

export class CareHomeRepository {
  private cache: CacheService;
  private audit: AuditService;

  constructor() {
    this.cache = CacheService.getInstance();
    this.audit = AuditService.getInstance();
  }

  private getIncludeObject(options?: CareHomeFilterOptions) {
    return {
      residents: options?.includeResidents ?? true,
      staff: options?.includeStaff ?? true,
      facilities: options?.includeFacilities ?? true,
      departments: options?.includeDepartments ?? true,
      compliance: options?.includeCompliance ?? true,
    };
  }

  async create(data: CreateCareHomeDTO): Promise<CareHomeWithRelations> {
    const careHome = await prisma.careHome.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    await this.audit.log({
      action: 'create',
      resourceType: 'careHome',
      resourceId: careHome.id,
      changes: data,
    });

    return careHome;
  }

  async findById(id: string, options?: CareHomeFilterOptions): Promise<CareHomeWithRelations | null> {
    const cacheKey = `careHome:${id}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const careHome = await prisma.careHome.findUnique({
      where: { id },
      include: this.getIncludeObject(options),
    });

    if (careHome) {
      await this.cache.set(cacheKey, careHome);
    }

    return careHome;
  }

  async findMany(params: CareHomeSearchParams): Promise<CareHomeWithRelations[]> {
    const { search, region, status, page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = params;

    const where: Prisma.CareHomeWhereInput = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        region ? { region } : {},
        status ? { status } : {},
      ],
    };

    return await prisma.careHome.findMany({
      where,
      include: this.getIncludeObject(),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });
  }

  async update(id: string, data: Partial<CareHomeWithRelations>): Promise<CareHomeWithRelations> {
    const careHome = await prisma.careHome.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: this.getIncludeObject(),
    });

    await this.audit.log({
      action: 'update',
      resourceType: 'careHome',
      resourceId: id,
      changes: data,
    });

    await this.cache.delete(`careHome:${id}`);
    return careHome;
  }

  async delete(id: string): Promise<void> {
    await prisma.careHome.delete({
      where: { id },
    });

    await this.audit.log({
      action: 'delete',
      resourceType: 'careHome',
      resourceId: id,
    });

    await this.cache.delete(`careHome:${id}`);
  }
}


