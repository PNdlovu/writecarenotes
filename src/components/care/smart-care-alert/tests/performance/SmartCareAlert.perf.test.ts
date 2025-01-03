/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Performance Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { SmartCareAlertService } from '../../services/SmartCareAlertService';
import { mockAlertRecords, mockStaff } from '../mocks/mockData';

describe('Smart Care Alert Performance', () => {
    let service: SmartCareAlertService;
    const PERFORMANCE_THRESHOLD = {
        alertCreation: 200, // ms
        alertRetrieval: 100, // ms
        staffAssignment: 150, // ms
        batchProcessing: 1000, // ms
        syncOperation: 300, // ms
        reportGeneration: 2000 // ms
    };

    beforeEach(() => {
        service = SmartCareAlertService.getInstance();
        jest.clearAllMocks();
    });

    describe('Core Operations Performance', () => {
        it('creates alerts within performance threshold', async () => {
            const startTime = performance.now();
            
            await service.createAlert({
                priority: 'urgent',
                description: 'Performance test alert',
                location: { unit: 'A', floor: '1', room: '101' }
            });
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.alertCreation);
        });

        it('retrieves alerts within performance threshold', async () => {
            const startTime = performance.now();
            
            await service.getActiveAlerts();
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.alertRetrieval);
        });

        it('assigns staff within performance threshold', async () => {
            const alert = mockAlertRecords[0];
            const staff = mockStaff[0];
            
            const startTime = performance.now();
            
            await service.assignStaff(alert.id, staff.id);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.staffAssignment);
        });
    });

    describe('Batch Processing Performance', () => {
        it('handles multiple concurrent alerts efficiently', async () => {
            const startTime = performance.now();
            
            const alerts = Array(10).fill(null).map(() => ({
                priority: 'normal',
                description: 'Batch test alert',
                location: { unit: 'A', floor: '1', room: '101' }
            }));
            
            await Promise.all(alerts.map(alert => service.createAlert(alert)));
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.batchProcessing);
        });

        it('processes bulk updates efficiently', async () => {
            const alerts = mockAlertRecords;
            const startTime = performance.now();
            
            await Promise.all(alerts.map(alert => 
                service.updateAlert(alert.id, { status: 'resolved' })
            ));
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.batchProcessing);
        });
    });

    describe('Sync Performance', () => {
        it('syncs offline data efficiently', async () => {
            // Setup offline data
            localStorage.setItem('pendingAlerts', JSON.stringify(mockAlertRecords));
            
            const startTime = performance.now();
            
            await service.syncPendingChanges();
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.syncOperation);
        });

        it('handles large sync operations', async () => {
            // Create large dataset
            const largeDataset = Array(100).fill(null).map((_, index) => ({
                ...mockAlertRecords[0],
                id: `alert-${index}`,
                timestamp: new Date()
            }));
            
            localStorage.setItem('pendingAlerts', JSON.stringify(largeDataset));
            
            const startTime = performance.now();
            
            await service.syncPendingChanges();
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.syncOperation * 2);
        });
    });

    describe('Report Generation Performance', () => {
        it('generates compliance reports efficiently', async () => {
            const startTime = performance.now();
            
            await service.generateComplianceReport({
                startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
                type: 'CQC'
            });
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.reportGeneration);
        });

        it('handles large dataset reports', async () => {
            // Setup large dataset
            const largeDataset = Array(1000).fill(null).map((_, index) => ({
                ...mockAlertRecords[0],
                id: `alert-${index}`,
                timestamp: new Date(Date.now() - index * 24 * 60 * 60 * 1000)
            }));
            
            jest.spyOn(service, 'getAlertHistory').mockResolvedValue(largeDataset);
            
            const startTime = performance.now();
            
            await service.generateComplianceReport({
                startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                endDate: new Date(),
                type: 'CQC'
            });
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.reportGeneration * 2);
        });
    });

    describe('Memory Usage', () => {
        it('maintains stable memory usage during operations', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Perform multiple operations
            await Promise.all([
                service.getActiveAlerts(),
                service.getAvailableStaff(),
                service.generateComplianceReport({
                    startDate: new Date(),
                    endDate: new Date(),
                    type: 'CQC'
                })
            ]);
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Should not increase by more than 50MB
            expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        });

        it('properly cleans up resources', async () => {
            const initialMemory = process.memoryUsage().heapUsed;
            
            // Create and resolve multiple alerts
            const alerts = await Promise.all(
                Array(100).fill(null).map(() => service.createAlert({
                    priority: 'normal',
                    description: 'Memory test alert'
                }))
            );
            
            await Promise.all(
                alerts.map(alert => service.updateAlert(alert.id, { status: 'resolved' }))
            );
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }
            
            const finalMemory = process.memoryUsage().heapUsed;
            const memoryDiff = Math.abs(finalMemory - initialMemory);
            
            // Should return to within 10MB of initial memory
            expect(memoryDiff).toBeLessThan(10 * 1024 * 1024);
        });
    });
}); 