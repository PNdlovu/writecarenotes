/**
 * @writecarenotes.com
 * @fileoverview Tests for Base Repository
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '../../../../../src/lib/prisma';
import { BaseRepository } from '../BaseRepository';
import { BaseEntity, Region } from '../../types';

// Mock entity for testing
interface TestEntity extends BaseEntity {
  name: string;
  region: Region;
  startTime?: Date;
  endTime?: Date;
}

// Test implementation of BaseRepository
class TestRepository extends BaseRepository<TestEntity> {
  protected tableName = 'test_table';
}

// Mock Prisma client
jest.mock('../../../../../src/lib/prisma', () => ({
  prisma: {
    test_table: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  },
}));

describe('BaseRepository', () => {
  let repository: TestRepository;
  const mockEntity: TestEntity = {
    id: '1',
    name: 'Test Entity',
    region: 'england',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = new TestRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an entity with timestamps', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockEntity;
      (prisma.test_table.create as jest.Mock).mockResolvedValue(mockEntity);

      const result = await repository['create'](createData);

      expect(prisma.test_table.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockEntity);
    });

    it('should throw error if creation fails', async () => {
      const error = new Error('Creation failed');
      (prisma.test_table.create as jest.Mock).mockRejectedValue(error);

      await expect(repository['create'](mockEntity)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update an entity with new timestamp', async () => {
      const updates = { name: 'Updated Name' };
      const updatedEntity = { ...mockEntity, ...updates };
      (prisma.test_table.update as jest.Mock).mockResolvedValue(updatedEntity);

      const result = await repository['update'](mockEntity.id, updates);

      expect(prisma.test_table.update).toHaveBeenCalledWith({
        where: { id: mockEntity.id },
        data: {
          ...updates,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedEntity);
    });

    it('should throw error if update fails', async () => {
      const error = new Error('Update failed');
      (prisma.test_table.update as jest.Mock).mockRejectedValue(error);

      await expect(repository['update'](mockEntity.id, {})).rejects.toThrow(error);
    });
  });

  describe('findById', () => {
    it('should find entity by id', async () => {
      (prisma.test_table.findUnique as jest.Mock).mockResolvedValue(mockEntity);

      const result = await repository['findById'](mockEntity.id);

      expect(prisma.test_table.findUnique).toHaveBeenCalledWith({
        where: { id: mockEntity.id },
      });
      expect(result).toEqual(mockEntity);
    });

    it('should return null if entity not found', async () => {
      (prisma.test_table.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository['findById']('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should find entities with filters', async () => {
      const filters = { region: 'england' as Region };
      const entities = [mockEntity];
      (prisma.test_table.findMany as jest.Mock).mockResolvedValue(entities);

      const result = await repository['findMany'](filters);

      expect(prisma.test_table.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(entities);
    });

    it('should apply date filters correctly', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const filters = { region: 'england' as Region, startDate, endDate };
      const entities = [mockEntity];
      (prisma.test_table.findMany as jest.Mock).mockResolvedValue(entities);

      const result = await repository['findMany'](filters);

      expect(prisma.test_table.findMany).toHaveBeenCalledWith({
        where: {
          region: 'england',
          AND: [
            { startTime: { gte: startDate } },
            { endTime: { lte: endDate } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(entities);
    });
  });

  describe('delete', () => {
    it('should delete entity by id', async () => {
      await repository['delete'](mockEntity.id);

      expect(prisma.test_table.delete).toHaveBeenCalledWith({
        where: { id: mockEntity.id },
      });
    });

    it('should throw error if deletion fails', async () => {
      const error = new Error('Deletion failed');
      (prisma.test_table.delete as jest.Mock).mockRejectedValue(error);

      await expect(repository['delete'](mockEntity.id)).rejects.toThrow(error);
    });
  });

  describe('transaction', () => {
    it('should execute operation in transaction', async () => {
      const operation = jest.fn().mockResolvedValue(mockEntity);

      const result = await repository['transaction'](operation);

      expect(prisma.$transaction).toHaveBeenCalledWith(operation);
      expect(result).toEqual(mockEntity);
    });

    it('should throw error if transaction fails', async () => {
      const error = new Error('Transaction failed');
      (prisma.$transaction as jest.Mock).mockRejectedValue(error);
      const operation = jest.fn();

      await expect(repository['transaction'](operation)).rejects.toThrow(error);
    });
  });
}); 