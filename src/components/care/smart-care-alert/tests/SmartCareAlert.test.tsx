/**
 * @writecarenotes.com
 * @fileoverview Smart Care Alert Component Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SmartCareAlertDashboard } from '../components/SmartCareAlertDashboard';
import { SmartCareAlertService } from '../services/SmartCareAlertService';
import { mockAlertRecords, mockStaff } from './mocks/mockData';

// Mock the service
jest.mock('../services/SmartCareAlertService');

describe('SmartCareAlertDashboard', () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        
        // Setup default mock implementations
        (SmartCareAlertService as jest.Mock).mockImplementation(() => ({
            getActiveAlerts: jest.fn().mockResolvedValue(mockAlertRecords),
            getAvailableStaff: jest.fn().mockResolvedValue(mockStaff),
            createAlert: jest.fn(),
            updateAlert: jest.fn(),
            assignStaff: jest.fn()
        }));
    });

    it('renders dashboard with active alerts', async () => {
        render(<SmartCareAlertDashboard />);
        
        expect(screen.getByText('Smart Care Alert Dashboard')).toBeInTheDocument();
        await waitFor(() => {
            mockAlertRecords.forEach(record => {
                expect(screen.getByText(record.description)).toBeInTheDocument();
            });
        });
    });

    it('handles new alert creation', async () => {
        render(<SmartCareAlertDashboard />);
        
        fireEvent.click(screen.getByText('New Alert'));
        
        // Fill form
        fireEvent.change(screen.getByLabelText('Description'), {
            target: { value: 'Test emergency alert' }
        });
        
        fireEvent.click(screen.getByText('Create Alert'));
        
        await waitFor(() => {
            expect(SmartCareAlertService.prototype.createAlert).toHaveBeenCalled();
        });
    });

    it('handles staff assignment', async () => {
        render(<SmartCareAlertDashboard />);
        
        // Select an alert and assign staff
        const alert = mockAlertRecords[0];
        fireEvent.click(screen.getByText(alert.description));
        fireEvent.click(screen.getByText('Assign Staff'));
        
        const staff = mockStaff[0];
        fireEvent.click(screen.getByText(staff.name));
        
        await waitFor(() => {
            expect(SmartCareAlertService.prototype.assignStaff).toHaveBeenCalledWith(
                alert.id,
                staff.id
            );
        });
    });

    it('handles offline mode', async () => {
        // Mock offline status
        const mockOnline = jest.spyOn(navigator, 'onLine', 'get');
        mockOnline.mockReturnValue(false);
        
        render(<SmartCareAlertDashboard />);
        
        expect(screen.getByText('Offline Mode')).toBeInTheDocument();
        
        // Create alert while offline
        fireEvent.click(screen.getByText('New Alert'));
        fireEvent.change(screen.getByLabelText('Description'), {
            target: { value: 'Offline alert' }
        });
        fireEvent.click(screen.getByText('Create Alert'));
        
        await waitFor(() => {
            expect(screen.getByText('Alert saved offline')).toBeInTheDocument();
        });
    });

    it('handles priority-based alerts', async () => {
        render(<SmartCareAlertDashboard />);
        
        // Create urgent alert
        fireEvent.click(screen.getByText('New Alert'));
        fireEvent.change(screen.getByLabelText('Description'), {
            target: { value: 'Urgent care needed' }
        });
        fireEvent.click(screen.getByLabelText('Urgent'));
        fireEvent.click(screen.getByText('Create Alert'));
        
        await waitFor(() => {
            expect(SmartCareAlertService.prototype.createAlert).toHaveBeenCalledWith(
                expect.objectContaining({
                    priority: 'urgent',
                    description: 'Urgent care needed'
                })
            );
        });
    });

    it('displays compliance information', () => {
        render(<SmartCareAlertDashboard />);
        
        // Check CQC compliance info
        expect(screen.getByText('CQC Compliant')).toBeInTheDocument();
        
        // Check Ofsted compliance info
        expect(screen.getByText('Ofsted Approved')).toBeInTheDocument();
    });
}); 