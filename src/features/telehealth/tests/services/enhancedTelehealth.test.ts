/**
 * @fileoverview Tests for Enhanced Telehealth Service
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { EnhancedTelehealth } from '../../services/enhancedTelehealth';
import { db } from '@/lib/db';
import { TelehealthServiceError } from '../../services/enhancedTelehealth';

// Mock database
jest.mock('@/lib/db', () => ({
  consultationRequest: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  notification: {
    createMany: jest.fn(),
  },
  alert: {
    create: jest.fn(),
  },
}));

describe('EnhancedTelehealth Service', () => {
  let service: EnhancedTelehealth;

  beforeEach(() => {
    service = new EnhancedTelehealth();
    jest.clearAllMocks();
  });

  describe('facilitateRemoteConsultations', () => {
    const mockConsultationData = {
      residentId: 'resident-123',
      type: 'GP',
      urgency: 'ROUTINE',
      reason: 'Regular checkup',
      participants: [
        { id: 'gp-123', role: 'GP', name: 'Dr. Smith' },
      ],
    };

    it('should create a consultation request successfully', async () => {
      const mockCreatedConsultation = {
        id: 'consultation-123',
        ...mockConsultationData,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      (db.consultationRequest.create as jest.Mock).mockResolvedValue(mockCreatedConsultation);

      const result = await service.facilitateRemoteConsultations(
        'care-home-123',
        mockConsultationData
      );

      expect(result).toEqual(mockCreatedConsultation);
      expect(db.consultationRequest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ...mockConsultationData,
          status: 'PENDING',
        }),
      });
    });

    it('should handle emergency consultations appropriately', async () => {
      const emergencyData = {
        ...mockConsultationData,
        urgency: 'EMERGENCY',
      };

      const mockCreatedConsultation = {
        id: 'consultation-123',
        ...emergencyData,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      (db.consultationRequest.create as jest.Mock).mockResolvedValue(mockCreatedConsultation);
      (db.notification.createMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.alert.create as jest.Mock).mockResolvedValue({ id: 'alert-123' });

      const result = await service.facilitateRemoteConsultations(
        'care-home-123',
        emergencyData
      );

      expect(result).toEqual(mockCreatedConsultation);
      expect(db.notification.createMany).toHaveBeenCalled();
      expect(db.alert.create).toHaveBeenCalled();
    });

    it('should throw error for invalid input', async () => {
      const invalidData = {
        ...mockConsultationData,
        residentId: undefined,
      };

      await expect(
        service.facilitateRemoteConsultations('care-home-123', invalidData)
      ).rejects.toThrow(TelehealthServiceError);
    });

    it('should handle database errors gracefully', async () => {
      (db.consultationRequest.create as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(
        service.facilitateRemoteConsultations('care-home-123', mockConsultationData)
      ).rejects.toThrow(TelehealthServiceError);
    });
  });

  describe('recordConsultation', () => {
    const mockRecordData = {
      consultationId: 'consultation-123',
      summary: 'Regular checkup completed',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    };

    it('should record consultation details successfully', async () => {
      const mockCreatedRecord = {
        id: 'record-123',
        ...mockRecordData,
      };

      (db.consultationRequest.update as jest.Mock).mockResolvedValue({ status: 'COMPLETED' });

      const result = await service.recordConsultation(
        mockRecordData.consultationId,
        mockRecordData
      );

      expect(result).toBeDefined();
      expect(db.consultationRequest.update).toHaveBeenCalledWith({
        where: { id: mockRecordData.consultationId },
        data: { status: 'COMPLETED' },
      });
    });

    it('should process prescription changes if present', async () => {
      const dataWithPrescription = {
        ...mockRecordData,
        prescriptionChanges: [
          {
            medicationId: 'med-123',
            type: 'NEW',
            details: 'New medication prescribed',
          },
        ],
      };

      await service.recordConsultation(
        dataWithPrescription.consultationId,
        dataWithPrescription
      );

      // Verify prescription changes were processed
      // Add specific assertions based on your implementation
    });

    it('should handle missing consultation gracefully', async () => {
      (db.consultationRequest.update as jest.Mock).mockRejectedValue(
        new Error('Consultation not found')
      );

      await expect(
        service.recordConsultation('invalid-id', mockRecordData)
      ).rejects.toThrow(TelehealthServiceError);
    });
  });
});


