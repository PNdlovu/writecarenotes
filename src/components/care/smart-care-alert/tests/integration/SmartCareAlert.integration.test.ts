/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Integration Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { SmartCareAlertService } from '../../services/SmartCareAlertService';
import { IncidentService } from '@/services/IncidentService';
import { StaffService } from '@/services/StaffService';
import { NotificationService } from '@/services/NotificationService';
import { mockAlertRecords, mockStaff } from '../mocks/mockData';

describe('Smart Care Alert Integration', () => {
    let alertService: SmartCareAlertService;
    let incidentService: IncidentService;
    let staffService: StaffService;
    let notificationService: NotificationService;

    beforeEach(() => {
        alertService = SmartCareAlertService.getInstance();
        incidentService = new IncidentService();
        staffService = new StaffService();
        notificationService = new NotificationService();
    });

    describe('Alert to Incident Flow', () => {
        it('creates incident from urgent alert', async () => {
            // Create urgent alert
            const alert = await alertService.createAlert({
                priority: 'urgent',
                description: 'Fall incident',
                location: { unit: 'A', floor: '1', room: '101' }
            });

            // Verify incident creation
            const incidents = await incidentService.getIncidentsByAlertId(alert.id);
            expect(incidents).toHaveLength(1);
            expect(incidents[0]).toMatchObject({
                type: 'fall',
                priority: 'high',
                status: 'open'
            });
        });

        it('updates incident when alert is resolved', async () => {
            const alert = mockAlertRecords[0];
            await alertService.updateAlert(alert.id, { status: 'resolved' });

            const incident = await incidentService.getIncidentsByAlertId(alert.id);
            expect(incident[0].status).toBe('resolved');
        });
    });

    describe('Staff Assignment Integration', () => {
        it('updates staff schedule when assigned to alert', async () => {
            const alert = mockAlertRecords[0];
            const staff = mockStaff[0];

            await alertService.assignStaff(alert.id, staff.id);
            
            const schedule = await staffService.getCurrentAssignment(staff.id);
            expect(schedule).toMatchObject({
                type: 'alert_response',
                alertId: alert.id
            });
        });

        it('handles staff availability across systems', async () => {
            const staff = mockStaff[0];
            
            // Mark staff as unavailable in main system
            await staffService.updateAvailability(staff.id, false);
            
            // Verify alert system reflects change
            const available = await alertService.getAvailableStaff();
            expect(available).not.toContainEqual(expect.objectContaining({
                id: staff.id
            }));
        });
    });

    describe('Notification Integration', () => {
        it('sends notifications to all relevant parties', async () => {
            const alert = await alertService.createAlert({
                priority: 'urgent',
                description: 'Medical emergency',
                location: { unit: 'B', floor: '2', room: '202' }
            });

            // Verify notifications
            const notifications = await notificationService.getNotificationsByAlertId(alert.id);
            expect(notifications).toContainEqual(expect.objectContaining({
                type: 'staff_alert'
            }));
            expect(notifications).toContainEqual(expect.objectContaining({
                type: 'management_alert'
            }));
        });

        it('handles family notifications correctly', async () => {
            const alert = mockAlertRecords[0];
            await alertService.updateAlert(alert.id, {
                status: 'resolved',
                notifyFamily: true
            });

            const familyNotifications = await notificationService.getFamilyNotifications(alert.id);
            expect(familyNotifications).toHaveLength(1);
            expect(familyNotifications[0]).toMatchObject({
                type: 'family_update',
                status: 'sent'
            });
        });
    });

    describe('Compliance Integration', () => {
        it('generates integrated compliance reports', async () => {
            const startDate = new Date();
            const endDate = new Date();

            const report = await alertService.generateComplianceReport({
                startDate,
                endDate,
                type: 'CQC'
            });

            expect(report).toMatchObject({
                alerts: expect.any(Array),
                incidents: expect.any(Array),
                staffResponses: expect.any(Array),
                responseTimeMetrics: expect.any(Object)
            });
        });

        it('tracks cross-system response times', async () => {
            const alert = mockAlertRecords[0];
            
            // Get response metrics from both systems
            const alertMetrics = await alertService.getResponseMetrics(alert.id);
            const incidentMetrics = await incidentService.getResponseMetrics(alert.id);

            // Verify consistency
            expect(alertMetrics.responseTime).toBe(incidentMetrics.responseTime);
            expect(alertMetrics.resolutionTime).toBe(incidentMetrics.resolutionTime);
        });
    });

    describe('Error Handling', () => {
        it('handles system-wide failures gracefully', async () => {
            // Simulate network failure
            jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

            const alert = await alertService.createAlert({
                priority: 'urgent',
                description: 'Test alert'
            });

            // Verify alert was saved locally
            expect(alert).toHaveProperty('id');
            expect(alert.status).toBe('pending');

            // Verify incident service received backup notification
            const backupIncidents = await incidentService.getOfflineAlerts();
            expect(backupIncidents).toContainEqual(expect.objectContaining({
                alertId: alert.id
            }));
        });

        it('maintains data consistency across systems', async () => {
            const alert = mockAlertRecords[0];
            
            // Update in both systems
            await Promise.all([
                alertService.updateAlert(alert.id, { status: 'resolved' }),
                incidentService.updateIncident(alert.id, { status: 'closed' })
            ]);

            // Verify consistency
            const alertStatus = await alertService.getAlert(alert.id);
            const incidentStatus = await incidentService.getIncident(alert.id);
            
            expect(alertStatus.status).toBe('resolved');
            expect(incidentStatus.status).toBe('closed');
        });
    });
}); 