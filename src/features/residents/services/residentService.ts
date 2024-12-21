import { PrismaClient } from '@prisma/client';
import { ResidentCreateDTO, ResidentUpdateDTO, Resident } from '../types';
import { OfflineManager } from '@/lib/offline/offlineManager';
import { auditLog } from '@/lib/audit/auditLogger';
import { NotFoundError, ValidationError } from '@/lib/error/errors';
import { TenantContext } from '@/lib/tenant/tenantContext';

const prisma = new PrismaClient();

export class ResidentService {
  private offlineManager: OfflineManager;

  constructor() {
    this.offlineManager = OfflineManager.getInstance();
  }

  @auditLog('resident:list')
  async getResidents(filters: any): Promise<Resident[]> {
    const residents = await prisma.resident.findMany({
      where: filters,
      include: {
        careHome: true,
        carePlan: true,
        assessments: true,
      },
    });
    
    await this.offlineManager.syncData('residents', residents);
    return residents;
  }

  @auditLog('resident:get')
  async getResident(id: string): Promise<Resident> {
    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        careHome: true,
        carePlan: true,
        assessments: true,
      },
    });

    if (!resident) {
      throw new NotFoundError('Resident not found');
    }

    await this.offlineManager.syncData(`resident:${id}`, resident);
    return resident;
  }

  @auditLog('resident:create')
  async createResident(data: ResidentCreateDTO): Promise<Resident> {
    this.validateResidentData(data);
    
    const resident = await prisma.resident.create({
      data,
      include: {
        careHome: true,
        carePlan: true,
      },
    });

    await this.offlineManager.syncData(`resident:${resident.id}`, resident);
    return resident;
  }

  @auditLog('resident:update')
  async updateResident(id: string, data: ResidentUpdateDTO): Promise<Resident> {
    this.validateResidentData(data);

    const resident = await prisma.resident.update({
      where: { id },
      data,
      include: {
        careHome: true,
        carePlan: true,
      },
    });

    await this.offlineManager.syncData(`resident:${id}`, resident);
    return resident;
  }

  private validateResidentData(data: ResidentCreateDTO | ResidentUpdateDTO): void {
    if (!data.name || !data.dateOfBirth) {
      throw new ValidationError('Name and date of birth are required');
    }
    // Add more validation as needed
  }
}


