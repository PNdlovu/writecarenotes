import { prisma } from '@/lib/prisma';
import { Bed, BedStatus } from '../../types';

export class BedRepository {
  async findAll(): Promise<Bed[]> {
    return prisma.bed.findMany();
  }

  async findById(id: string): Promise<Bed | null> {
    return prisma.bed.findUnique({
      where: { id }
    });
  }

  async create(data: Omit<Bed, 'id'>): Promise<Bed> {
    return prisma.bed.create({
      data
    });
  }

  async update(id: string, data: Partial<Bed>): Promise<Bed> {
    return prisma.bed.update({
      where: { id },
      data
    });
  }

  async updateStatus(id: string, status: BedStatus): Promise<Bed> {
    return prisma.bed.update({
      where: { id },
      data: { status }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.bed.delete({
      where: { id }
    });
  }
} 