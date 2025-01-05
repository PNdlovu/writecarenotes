/**
 * @writecarenotes.com
 * @fileoverview Tests for Recording Repository
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { prisma } from '../../../../../src/lib/prisma';
import { RecordingRepository } from '../RecordingRepository';
import { Recording, RecordingStatus } from '../../types';

// Mock Prisma client
jest.mock('../../../../../src/lib/prisma', () => ({
  prisma: {
    onCallRecording: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback()),
  },
}));

describe('RecordingRepository', () => {
  let repository: RecordingRepository;
  const mockRecording: Recording = {
    id: '1',
    callId: 'call_1',
    url: 'https://storage.example.com/recordings/1.mp3',
    duration: 300, // 5 minutes in seconds
    status: 'completed' as RecordingStatus,
    organizationId: 'org_1',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    repository = RecordingRepository.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = RecordingRepository.getInstance();
      const instance2 = RecordingRepository.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createRecording', () => {
    it('should create a recording record', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockRecording;
      (prisma.onCallRecording.create as jest.Mock).mockResolvedValue(mockRecording);

      const result = await repository.createRecording(createData);

      expect(prisma.onCallRecording.create).toHaveBeenCalledWith({
        data: {
          ...createData,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(mockRecording);
    });

    it('should validate recording URL', async () => {
      const { id, createdAt, updatedAt, ...createData } = mockRecording;
      const invalidData = {
        ...createData,
        url: 'invalid-url',
      };

      await expect(repository.createRecording(invalidData)).rejects.toThrow(
        'Invalid recording URL format'
      );
    });
  });

  describe('updateRecording', () => {
    it('should update a recording record', async () => {
      const updates = {
        status: 'failed' as RecordingStatus,
        duration: 360,
      };
      const updatedRecording = { ...mockRecording, ...updates };
      (prisma.onCallRecording.update as jest.Mock).mockResolvedValue(updatedRecording);

      const result = await repository.updateRecording(mockRecording.id, updates);

      expect(prisma.onCallRecording.update).toHaveBeenCalledWith({
        where: { id: mockRecording.id },
        data: {
          ...updates,
          updatedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(updatedRecording);
    });
  });

  describe('getRecordingById', () => {
    it('should find recording by id', async () => {
      (prisma.onCallRecording.findUnique as jest.Mock).mockResolvedValue(mockRecording);

      const result = await repository.getRecordingById(mockRecording.id);

      expect(prisma.onCallRecording.findUnique).toHaveBeenCalledWith({
        where: { id: mockRecording.id },
      });
      expect(result).toEqual(mockRecording);
    });

    it('should return null if recording not found', async () => {
      (prisma.onCallRecording.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await repository.getRecordingById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('listRecordings', () => {
    it('should list recordings with filters', async () => {
      const filters = {
        callId: 'call_1',
        status: 'completed' as RecordingStatus,
      };
      const recordings = [mockRecording];
      (prisma.onCallRecording.findMany as jest.Mock).mockResolvedValue(recordings);

      const result = await repository.listRecordings(filters);

      expect(prisma.onCallRecording.findMany).toHaveBeenCalledWith({
        where: filters,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(recordings);
    });

    it('should apply date range filters', async () => {
      const startDate = new Date('2024-03-21');
      const endDate = new Date('2024-03-22');
      const filters = {
        callId: 'call_1',
        startDate,
        endDate,
      };
      const recordings = [mockRecording];
      (prisma.onCallRecording.findMany as jest.Mock).mockResolvedValue(recordings);

      const result = await repository.listRecordings(filters);

      expect(prisma.onCallRecording.findMany).toHaveBeenCalledWith({
        where: {
          callId: 'call_1',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(recordings);
    });
  });

  describe('deleteRecording', () => {
    it('should delete a recording record', async () => {
      await repository.deleteRecording(mockRecording.id);

      expect(prisma.onCallRecording.delete).toHaveBeenCalledWith({
        where: { id: mockRecording.id },
      });
    });
  });

  describe('getRecordingsByCall', () => {
    it('should get recordings for a call', async () => {
      const callId = 'call_1';
      const recordings = [mockRecording];
      (prisma.onCallRecording.findMany as jest.Mock).mockResolvedValue(recordings);

      const result = await repository.getRecordingsByCall(callId);

      expect(prisma.onCallRecording.findMany).toHaveBeenCalledWith({
        where: {
          callId,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(recordings);
    });
  });

  describe('getFailedRecordings', () => {
    it('should get failed recordings', async () => {
      const failedRecordings = [{ ...mockRecording, status: 'failed' as RecordingStatus }];
      (prisma.onCallRecording.findMany as jest.Mock).mockResolvedValue(failedRecordings);

      const result = await repository.getFailedRecordings();

      expect(prisma.onCallRecording.findMany).toHaveBeenCalledWith({
        where: {
          status: 'failed',
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(failedRecordings);
    });
  });

  describe('getLongRecordings', () => {
    it('should get recordings longer than specified duration', async () => {
      const minDuration = 600; // 10 minutes in seconds
      const longRecordings = [{ ...mockRecording, duration: 900 }]; // 15 minutes
      (prisma.onCallRecording.findMany as jest.Mock).mockResolvedValue(longRecordings);

      const result = await repository.getLongRecordings(minDuration);

      expect(prisma.onCallRecording.findMany).toHaveBeenCalledWith({
        where: {
          duration: {
            gte: minDuration,
          },
        },
        orderBy: { duration: 'desc' },
      });
      expect(result).toEqual(longRecordings);
    });
  });
}); 