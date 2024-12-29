import { prisma } from '@/lib/prisma';
import { WaitlistEntry, WaitlistStatus } from '../../types';

export class WaitlistRepository {
  async findAll(): Promise<WaitlistEntry[]> {
    return prisma.waitlistEntry.findMany({
      orderBy: { priority: 'desc' }
    });
  }

  async findById(id: string): Promise<WaitlistEntry | null> {
    return prisma.waitlistEntry.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<WaitlistEntry, 'id'>): Promise<WaitlistEntry> {
    return prisma.waitlistEntry.create({
      data
    });
  }

  async update(id: string, data: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
    return prisma.waitlistEntry.update({
      where: { id },
      data
    });
  }

  async updateStatus(id: string, status: WaitlistStatus): Promise<WaitlistEntry> {
    return prisma.waitlistEntry.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.waitlistEntry.delete({
      where: { id }
    });
  }
} 