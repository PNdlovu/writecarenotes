/**
 * @writecarenotes.com
 * @fileoverview Tests for OnCallDashboard component
 * @version 2.0.0
 * @created 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { OnCallDashboard } from '@/components/care/oncall/components/OnCallDashboard';
import { OnCallService } from '@/components/care/oncall/services/OnCallService';
import { mockCareHome, mockOrganization, mockPerson } from '@/tests/mocks/care';
import { mockOnCallRecords, mockStaff } from '@/tests/mocks/oncall';
import { LocaleProvider } from '@/providers/LocaleProvider';
import { RegionProvider } from '@/providers/RegionProvider';
import { OfflineProvider } from '@/providers/OfflineProvider';

// Mock the service
vi.mock('@/components/care/oncall/services/OnCallService');

describe('OnCallDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup mock implementations
        (OnCallService as any).mockImplementation(() => ({
            getActiveRecords: vi.fn().mockResolvedValue(mockOnCallRecords),
            getAvailableStaff: vi.fn().mockResolvedValue(mockStaff),
            createCall: vi.fn().mockImplementation((data) => Promise.resolve({ ...data, id: 'new-call-id' })),
            updateCall: vi.fn().mockImplementation((data) => Promise.resolve(data)),
            assignStaff: vi.fn().mockImplementation((call, staffId) => Promise.resolve({ ...call, responderId: staffId }))
        }));
    });

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <OfflineProvider>
                <RegionProvider defaultRegion="en-GB">
                    <LocaleProvider>
                        {ui}
                    </LocaleProvider>
                </RegionProvider>
            </OfflineProvider>
        );
    };

    it('renders without crashing', () => {
        renderWithProviders(
            <OnCallDashboard
                careHome={mockCareHome}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );
        expect(screen.getByText('On-Call Dashboard')).toBeInTheDocument();
    });

    it('displays active calls correctly', async () => {
        renderWithProviders(
            <OnCallDashboard
                careHome={mockCareHome}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );

        await waitFor(() => {
            mockOnCallRecords.forEach(record => {
                expect(screen.getByText(record.category)).toBeInTheDocument();
            });
        });
    });

    it('handles new call creation', async () => {
        renderWithProviders(
            <OnCallDashboard
                careHome={mockCareHome}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );

        // Open new call form
        fireEvent.click(screen.getByText('New Call'));

        // Fill form
        fireEvent.change(screen.getByLabelText('Category'), {
            target: { value: 'medical' }
        });
        fireEvent.change(screen.getByLabelText('Description'), {
            target: { value: 'Test emergency call' }
        });

        // Submit form
        fireEvent.click(screen.getByText('Create Call'));

        await waitFor(() => {
            expect(OnCallService.prototype.createCall).toHaveBeenCalled();
        });
    });

    it('handles offline mode correctly', async () => {
        // Mock offline status
        const mockOffline = vi.fn(() => false);
        Object.defineProperty(navigator, 'onLine', {
            get: mockOffline
        });

        renderWithProviders(
            <OnCallDashboard
                careHome={mockCareHome}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );

        // Verify offline indicator is shown
        expect(screen.getByText('Offline Mode')).toBeInTheDocument();

        // Create call in offline mode
        fireEvent.click(screen.getByText('New Call'));
        fireEvent.change(screen.getByLabelText('Category'), {
            target: { value: 'medical' }
        });
        fireEvent.click(screen.getByText('Create Call'));

        await waitFor(() => {
            // Verify call is stored locally
            expect(localStorage.getItem('pendingCalls')).toBeTruthy();
        });
    });

    it('supports different regions and languages', async () => {
        // Test UK English
        renderWithProviders(
            <OnCallDashboard
                careHome={{ ...mockCareHome, region: 'en-GB' }}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );
        expect(screen.getByText('On-Call Dashboard')).toBeInTheDocument();

        // Test Irish English
        renderWithProviders(
            <OnCallDashboard
                careHome={{ ...mockCareHome, region: 'en-IE' }}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );
        expect(screen.getByText('On-Call Dashboard')).toBeInTheDocument();

        // Verify region-specific compliance rules
        const complianceSection = screen.getByTestId('compliance-section');
        if (mockCareHome.region === 'en-GB') {
            expect(complianceSection).toHaveTextContent('CQC');
        } else if (mockCareHome.region === 'en-IE') {
            expect(complianceSection).toHaveTextContent('HIQA');
        }
    });

    it('maintains accessibility standards', async () => {
        const { container } = renderWithProviders(
            <OnCallDashboard
                careHome={mockCareHome}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );

        // Check ARIA labels
        expect(screen.getByRole('button', { name: 'New Call' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'Active Calls' })).toBeInTheDocument();

        // Verify color contrast
        const styles = window.getComputedStyle(container.firstChild!);
        expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
        expect(styles.color).toBe('rgb(17, 24, 39)');
    });

    it('handles enterprise-grade features', async () => {
        renderWithProviders(
            <OnCallDashboard
                careHome={mockCareHome}
                organization={mockOrganization}
                person={mockPerson}
                careType="elderly"
            />
        );

        // Test audit logging
        fireEvent.click(screen.getByText('New Call'));
        await waitFor(() => {
            expect(OnCallService.prototype.logAudit).toHaveBeenCalled();
        });

        // Test compliance reporting
        const complianceButton = screen.getByText('View Compliance');
        fireEvent.click(complianceButton);
        await waitFor(() => {
            expect(screen.getByText('Compliance Report')).toBeInTheDocument();
        });

        // Test analytics
        const analyticsButton = screen.getByText('Analytics');
        fireEvent.click(analyticsButton);
        await waitFor(() => {
            expect(screen.getByText('Response Time Trends')).toBeInTheDocument();
        });
    });
});
