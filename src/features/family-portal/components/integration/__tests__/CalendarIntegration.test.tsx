import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CalendarIntegration } from '../CalendarIntegration';
import { useCalendarIntegration } from '../../../hooks/useCalendarIntegration';
import { vi } from 'vitest';

// Mock the custom hook
vi.mock('../../../hooks/useCalendarIntegration');

describe('CalendarIntegration', () => {
  const mockProps = {
    residentId: '123',
    familyMemberId: '456',
  };

  const mockHookReturn = {
    isConnecting: false,
    isSyncing: false,
    connectedProviders: ['google'],
    events: [],
    syncSettings: {},
    connect: vi.fn(),
    disconnect: vi.fn(),
    sync: vi.fn(),
    updateSettings: vi.fn(),
  };

  beforeEach(() => {
    (useCalendarIntegration as jest.Mock).mockReturnValue(mockHookReturn);
  });

  it('renders without crashing', () => {
    render(<CalendarIntegration {...mockProps} />);
    expect(screen.getByText('Calendar Integration')).toBeInTheDocument();
  });

  it('displays connected calendar providers', () => {
    render(<CalendarIntegration {...mockProps} />);
    expect(screen.getByText('Google Calendar')).toBeInTheDocument();
  });

  it('handles calendar connection', async () => {
    render(<CalendarIntegration {...mockProps} />);
    
    const connectButton = screen.getByText('Connect Calendar');
    fireEvent.click(connectButton);
    
    const googleButton = screen.getByText('Google Calendar');
    fireEvent.click(googleButton);
    
    await waitFor(() => {
      expect(mockHookReturn.connect).toHaveBeenCalledWith('google');
    });
  });

  it('handles calendar disconnection', async () => {
    render(<CalendarIntegration {...mockProps} />);
    
    const disconnectButton = screen.getByText('Disconnect');
    fireEvent.click(disconnectButton);
    
    await waitFor(() => {
      expect(mockHookReturn.disconnect).toHaveBeenCalledWith('google');
    });
  });

  it('handles sync settings update', async () => {
    render(<CalendarIntegration {...mockProps} />);
    
    const configureButton = screen.getByText('Configure');
    fireEvent.click(configureButton);
    
    const autoSyncSwitch = screen.getByRole('switch');
    fireEvent.click(autoSyncSwitch);
    
    const saveButton = screen.getByText('Save Settings');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockHookReturn.updateSettings).toHaveBeenCalled();
    });
  });

  it('displays loading state', () => {
    (useCalendarIntegration as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      isConnecting: true,
    });
    
    render(<CalendarIntegration {...mockProps} />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });

  it('displays sync status', () => {
    const mockEvents = [
      {
        id: '1',
        title: 'Test Event',
        start: new Date(),
        end: new Date(),
        type: 'appointment',
        provider: 'google',
        status: 'synced',
      },
    ];

    (useCalendarIntegration as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      events: mockEvents,
    });
    
    render(<CalendarIntegration {...mockProps} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('synced')).toBeInTheDocument();
  });
});


