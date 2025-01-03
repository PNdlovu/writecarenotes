/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Service Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { SmartCareAlertService } from '../services/SmartCareAlertService';
import { mockAlertRecords, mockStaff, mockOfflineData } from './mocks/mockData';

describe('SmartCareAlertService', () => {
    let service: SmartCareAlertService;

    beforeEach(() => {
        service = SmartCareAlertService.getInstance();
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Alert Management', () => {
        it('creates new alerts', async () => {
            const newAlert = {
                priority: 'urgent',
                location: { unit: 'A', floor: '1', room: '101' },
                description: 'Test alert'
            };

            const result = await service.createAlert(newAlert);
            expect(result).toHaveProperty('id');
            expect(result.status).toBe('active');
        });

        it('updates existing alerts', async () => {
            const alert = mockAlertRecords[0];
            const update = {
                status: 'resolved',
                updates: [...alert.updates, {
                    timestamp: new Date(),
                    type: 'status',
                    message: 'Alert resolved'
                }]
            };

            const result = await service.updateAlert(alert.id, update);
            expect(result.status).toBe('resolved');
            expect(result.updates).toHaveLength(alert.updates.length + 1);
        });

        it('handles offline alert creation', async () => {
            // Mock offline state
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

            const newAlert = {
                priority: 'urgent',
                location: { unit: 'B', floor: '2', room: '202' },
                description: 'Offline test alert'
            };

            const result = await service.createAlert(newAlert);
            expect(result).toHaveProperty('id');
            expect(result.status).toBe('pending');

            // Verify stored in local storage
            const stored = JSON.parse(localStorage.getItem('pendingAlerts') || '[]');
            expect(stored).toContainEqual(expect.objectContaining({
                description: 'Offline test alert'
            }));
        });
    });

    describe('Staff Management', () => {
        it('assigns staff to alerts', async () => {
            const alert = mockAlertRecords[0];
            const staff = mockStaff[0];

            const result = await service.assignStaff(alert.id, staff.id);
            expect(result.responderId).toBe(staff.id);
            expect(result.status).toBe('assigned');
        });

        it('tracks staff availability', async () => {
            const staff = mockStaff[0];
            await service.updateStaffAvailability(staff.id, false);

            const available = await service.getAvailableStaff();
            expect(available).not.toContainEqual(expect.objectContaining({
                id: staff.id
            }));
        });
    });

    describe('Compliance Features', () => {
        it('tracks response times for CQC compliance', async () => {
            const alert = mockAlertRecords[0];
            const responseTime = await service.getResponseTime(alert.id);
            expect(responseTime).toBeDefined();
            expect(typeof responseTime).toBe('number');
        });

        it('generates Ofsted-compliant reports', async () => {
            const report = await service.generateOfstedReport({
                startDate: new Date(),
                endDate: new Date()
            });

            expect(report).toHaveProperty('safeguardingIncidents');
            expect(report).toHaveProperty('responseTimesAnalysis');
            expect(report).toHaveProperty('staffingLevels');
        });
    });

    describe('Offline Sync', () => {
        it('syncs pending alerts when back online', async () => {
            // Setup offline data
            localStorage.setItem('pendingAlerts', JSON.stringify(mockOfflineData.pendingAlerts));

            // Mock coming back online
            jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);

            await service.syncPendingChanges();

            // Verify pending alerts were synced
            const stored = JSON.parse(localStorage.getItem('pendingAlerts') || '[]');
            expect(stored).toHaveLength(0);
        });

        it('handles sync conflicts', async () => {
            const alert = mockOfflineData.pendingAlerts[0];
            const conflictingUpdate = {
                status: 'resolved',
                timestamp: new Date()
            };

            // Simulate conflict
            await service.updateAlert(alert.id, conflictingUpdate);
            await service.syncPendingChanges();

            // Verify conflict resolution
            const result = await service.getAlert(alert.id);
            expect(result.updates).toContainEqual(expect.objectContaining({
                type: 'conflict_resolution'
            }));
        });
    });
}); 