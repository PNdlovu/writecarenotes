/**
 * @writecarenotes.com
 * @fileoverview Tests for NotificationService
 * @version 2.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService } from '@/components/care/oncall/services/NotificationService';
import { OnCallRecord } from '@/components/care/oncall/types/OnCallTypes';
import { mockOnCallRecords } from '@/tests/mocks/oncall';

describe('NotificationService', () => {
    let notificationService: NotificationService;
    const mockPermission = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock Notification API
        Object.defineProperty(window, 'Notification', {
            value: {
                permission: 'granted',
                requestPermission: mockPermission.mockResolvedValue('granted'),
            },
        });
        notificationService = new NotificationService();
    });

    it('initializes with correct configuration', () => {
        expect(notificationService).toBeDefined();
        expect(notificationService.isSupported()).toBe(true);
    });

    it('handles permission requests correctly', async () => {
        await notificationService.requestPermission();
        expect(mockPermission).toHaveBeenCalled();
    });

    it('sends notifications for new calls', async () => {
        const mockCall: OnCallRecord = mockOnCallRecords[0];
        const mockNotify = vi.fn();
        global.Notification = vi.fn().mockImplementation(() => ({
            onclick: vi.fn(),
            close: vi.fn(),
        }));

        await notificationService.notifyNewCall(mockCall);
        expect(global.Notification).toHaveBeenCalledWith(
            expect.stringContaining('New Call'),
            expect.objectContaining({
                body: expect.stringContaining(mockCall.category),
                icon: expect.any(String),
                tag: mockCall.id,
            })
        );
    });

    it('handles offline notifications', async () => {
        const mockCall: OnCallRecord = mockOnCallRecords[0];
        const mockStorage = vi.fn();
        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn(),
                setItem: mockStorage,
            },
        });

        // Simulate offline
        Object.defineProperty(navigator, 'onLine', {
            get: () => false,
        });

        await notificationService.notifyNewCall(mockCall);
        expect(mockStorage).toHaveBeenCalledWith(
            'pendingNotifications',
            expect.stringContaining(mockCall.id)
        );
    });

    it('supports different regions and languages', async () => {
        const mockCall: OnCallRecord = {
            ...mockOnCallRecords[0],
            compliance: {
                region: 'en-GB',
                standards: { cqc: true },
                requirements: {
                    responseTime: 5,
                    escalationTime: 15,
                    documentationTime: 30
                },
                audit: {
                    lastCheck: new Date(),
                    status: 'compliant'
                }
            }
        };

        // Test UK format
        await notificationService.notifyNewCall(mockCall);
        expect(global.Notification).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: expect.stringContaining(mockCall.timestamp.toLocaleString('en-GB')),
            })
        );

        // Test Irish format
        mockCall.compliance.region = 'en-IE';
        await notificationService.notifyNewCall(mockCall);
        expect(global.Notification).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: expect.stringContaining(mockCall.timestamp.toLocaleString('en-IE')),
            })
        );
    });

    it('handles enterprise features', async () => {
        const mockCall: OnCallRecord = mockOnCallRecords[0];

        // Test audit logging
        const mockAudit = vi.fn();
        notificationService.logAudit = mockAudit;
        await notificationService.notifyNewCall(mockCall);
        expect(mockAudit).toHaveBeenCalledWith({
            action: 'notification_sent',
            callId: mockCall.id,
            timestamp: expect.any(Date),
        });

        // Test compliance rules
        const mockCompliance = vi.fn();
        notificationService.checkCompliance = mockCompliance;
        await notificationService.notifyNewCall(mockCall);
        expect(mockCompliance).toHaveBeenCalledWith(mockCall);

        // Test analytics
        const mockAnalytics = vi.fn();
        notificationService.trackAnalytics = mockAnalytics;
        await notificationService.notifyNewCall(mockCall);
        expect(mockAnalytics).toHaveBeenCalledWith({
            type: 'notification',
            callId: mockCall.id,
            timestamp: expect.any(Date),
        });
    });

    it('handles error cases gracefully', async () => {
        // Test permission denied
        Object.defineProperty(window, 'Notification', {
            value: {
                permission: 'denied',
                requestPermission: mockPermission.mockResolvedValue('denied'),
            },
        });

        const mockCall: OnCallRecord = mockOnCallRecords[0];
        const result = await notificationService.notifyNewCall(mockCall);
        expect(result).toBe(false);

        // Test network error
        const mockError = new Error('Network error');
        global.Notification = vi.fn().mockImplementation(() => {
            throw mockError;
        });

        const errorResult = await notificationService.notifyNewCall(mockCall);
        expect(errorResult).toBe(false);
        // Verify error is logged
        expect(console.error).toHaveBeenCalledWith(
            'Failed to send notification:',
            mockError
        );
    });

    it('supports accessibility features', async () => {
        const mockCall: OnCallRecord = mockOnCallRecords[0];

        // Test screen reader support
        await notificationService.notifyNewCall(mockCall);
        expect(global.Notification).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                silent: false, // Ensure audio cues for screen readers
                requireInteraction: true, // Ensure notification stays until acknowledged
            })
        );

        // Test high contrast support
        expect(global.Notification).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                icon: expect.stringContaining('high-contrast'),
            })
        );
    });
});
