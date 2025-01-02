/**
 * @writecarenotes.com
 * @fileoverview Tests for OnCall Service
 * @version 1.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { OnCallService } from '../../../../components/care/oncall/services/OnCallService';
import { OnCallAPI } from '../../../../components/care/oncall/api/OnCallAPI';
import { OnCallStorage } from '../../../../components/care/oncall/storage/OnCallStorage';
import { OnCallRecord, Staff } from '../../../../components/care/oncall/types/OnCallTypes';

// Mock dependencies
jest.mock('../../../../components/care/oncall/api/OnCallAPI');
jest.mock('../../../../components/care/oncall/storage/OnCallStorage');

describe('OnCallService', () => {
    let service: OnCallService;
    let mockAPI: jest.Mocked<OnCallAPI>;
    let mockStorage: jest.Mocked<OnCallStorage>;

    const mockRecord: OnCallRecord = {
        id: '1',
        careHomeId: 'care-home-1',
        timestamp: new Date(),
        callerId: 'caller-1',
        responderId: 'responder-1',
        priority: 'high',
        status: 'active',
        category: 'medical',
        description: 'Test description',
        actions: [],
        compliance: {
            regulatoryRequirements: [],
            standardsMet: true
        },
        metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            region: 'region-1'
        }
    };

    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Setup mock implementations
        mockAPI = OnCallAPI.getInstance() as jest.Mocked<OnCallAPI>;
        mockStorage = OnCallStorage.getInstance() as jest.Mocked<OnCallStorage>;

        // Get service instance
        service = OnCallService.getInstance();
    });

    describe('getActiveRecords', () => {
        it('should fetch records from API and update storage when online', async () => {
            const records = [mockRecord];
            mockAPI.getActiveRecords.mockResolvedValueOnce(records);

            const result = await service.getActiveRecords('care-home-1');

            expect(mockAPI.getActiveRecords).toHaveBeenCalledWith('care-home-1');
            expect(mockStorage.saveRecord).toHaveBeenCalledWith(mockRecord);
            expect(result).toEqual(records);
        });

        it('should fallback to storage when API fails', async () => {
            const records = [mockRecord];
            mockAPI.getActiveRecords.mockRejectedValueOnce(new Error('Network error'));
            mockStorage.getActiveRecords.mockResolvedValueOnce(records);

            const result = await service.getActiveRecords('care-home-1');

            expect(mockStorage.getActiveRecords).toHaveBeenCalledWith('care-home-1');
            expect(result).toEqual(records);
        });
    });

    describe('createRecord', () => {
        it('should create record in API and storage when online', async () => {
            mockAPI.createRecord.mockResolvedValueOnce(mockRecord);

            const result = await service.createRecord(mockRecord);

            expect(mockAPI.createRecord).toHaveBeenCalledWith(mockRecord);
            expect(mockStorage.saveRecord).toHaveBeenCalledWith(mockRecord);
            expect(result).toEqual(mockRecord);
        });

        it('should create temporary record in storage when offline', async () => {
            mockAPI.createRecord.mockRejectedValueOnce(new Error('Network error'));

            const result = await service.createRecord(mockRecord);

            expect(mockStorage.saveRecord).toHaveBeenCalled();
            expect(result.id).toContain('temp-');
            expect(mockStorage.addPendingSync).toHaveBeenCalled();
        });
    });

    describe('updateRecord', () => {
        const updates = { status: 'resolved' as const };

        it('should update record in API and storage when online', async () => {
            const updatedRecord = { ...mockRecord, ...updates };
            mockAPI.updateRecord.mockResolvedValueOnce(updatedRecord);

            const result = await service.updateRecord(mockRecord.id, updates);

            expect(mockAPI.updateRecord).toHaveBeenCalledWith(mockRecord.id, updates);
            expect(mockStorage.saveRecord).toHaveBeenCalledWith(updatedRecord);
            expect(result).toEqual(updatedRecord);
        });

        it('should update record in storage and queue sync when offline', async () => {
            mockAPI.updateRecord.mockRejectedValueOnce(new Error('Network error'));
            mockStorage.getRecord.mockResolvedValueOnce(mockRecord);

            const result = await service.updateRecord(mockRecord.id, updates);

            expect(mockStorage.saveRecord).toHaveBeenCalled();
            expect(mockStorage.addPendingSync).toHaveBeenCalled();
            expect(result.status).toBe('resolved');
        });
    });

    describe('assignStaff', () => {
        const mockStaff: Staff = {
            id: 'staff-1',
            name: 'John Doe',
            role: 'nurse',
            qualifications: ['RN'],
            contactNumber: '1234567890',
            email: 'john@example.com',
            regions: ['region-1'],
            specializations: ['emergency'],
            availability: []
        };

        it('should assign staff and update record', async () => {
            mockStorage.getStaff.mockResolvedValueOnce(mockStaff);
            mockAPI.updateRecord.mockResolvedValueOnce({
                ...mockRecord,
                responderId: mockStaff.id,
                status: 'active'
            });

            await service.assignStaff(mockRecord.id, mockStaff.id);

            expect(mockStorage.getStaff).toHaveBeenCalledWith(mockStaff.id);
            expect(mockAPI.updateRecord).toHaveBeenCalledWith(mockRecord.id, {
                responderId: mockStaff.id,
                status: 'active'
            });
        });

        it('should throw error if staff not found', async () => {
            mockStorage.getStaff.mockResolvedValueOnce(undefined);

            await expect(service.assignStaff(mockRecord.id, 'invalid-id'))
                .rejects
                .toThrow('Staff not found');
        });
    });
});
