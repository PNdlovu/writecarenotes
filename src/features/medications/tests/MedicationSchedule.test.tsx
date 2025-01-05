/**
 * @writecarenotes.com
 * @fileoverview Tests for MedicationSchedule component
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MedicationSchedule } from '../components/schedule/MedicationSchedule';
import { useSchedule } from '../hooks/useSchedule';
import { useRegionalSettings } from '@/hooks/useRegionalSettings';
import { format } from 'date-fns';
import { MedicationStatus, MedicationUnit, MedicationRoute } from '../types';

// Mock the hooks
jest.mock('../hooks/useSchedule');
jest.mock('@/hooks/useRegionalSettings');

const mockScheduleData = [
  {
    id: '1',
    medication: {
      id: 'med1',
      name: 'Paracetamol',
      dosage: 500,
      unit: MedicationUnit.MG,
      route: MedicationRoute.ORAL,
      frequency: 'Every 6 hours',
      active: true,
      controlledDrug: false,
      requiresDoubleSignature: false,
      stockLevel: 100,
    },
    scheduledTime: '2024-01-07T08:00:00Z',
    status: MedicationStatus.PENDING,
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-07T00:00:00Z',
    createdBy: {
      id: 'user1',
      name: 'John Doe',
      role: 'Nurse',
    },
    updatedBy: {
      id: 'user1',
      name: 'John Doe',
      role: 'Nurse',
    },
  },
  {
    id: '2',
    medication: {
      id: 'med2',
      name: 'Morphine',
      dosage: 10,
      unit: MedicationUnit.MG,
      route: MedicationRoute.INJECTION,
      frequency: 'Every 4 hours',
      active: true,
      controlledDrug: true,
      requiresDoubleSignature: true,
      stockLevel: 50,
    },
    scheduledTime: '2024-01-07T10:00:00Z',
    status: MedicationStatus.COMPLETED,
    administeredBy: {
      id: 'user2',
      name: 'Jane Smith',
      role: 'Senior Nurse',
    },
    witness: {
      id: 'user3',
      name: 'Bob Wilson',
      role: 'Doctor',
    },
    administeredAt: '2024-01-07T10:05:00Z',
    createdAt: '2024-01-07T00:00:00Z',
    updatedAt: '2024-01-07T10:05:00Z',
    createdBy: {
      id: 'user1',
      name: 'John Doe',
      role: 'Nurse',
    },
    updatedBy: {
      id: 'user2',
      name: 'Jane Smith',
      role: 'Senior Nurse',
    },
  },
];

const mockSettings = {
  requiresControlledDrugWitness: true,
  requiresStockCheck: true,
};

describe('MedicationSchedule', () => {
  beforeEach(() => {
    (useSchedule as jest.Mock).mockReturnValue({
      schedule: mockScheduleData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      prefetchNextDay: jest.fn(),
      isOffline: false,
      syncOfflineChanges: jest.fn(),
    });

    (useRegionalSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
    });
  });

  it('renders the schedule correctly', () => {
    render(<MedicationSchedule residentId="resident1" />);

    // Check header
    expect(screen.getByText('Medication Schedule')).toBeInTheDocument();
    expect(screen.getByText(format(new Date(), 'EEEE, dd MMMM yyyy'))).toBeInTheDocument();

    // Check table headers
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('Medication')).toBeInTheDocument();
    expect(screen.getByText('Dose')).toBeInTheDocument();
    expect(screen.getByText('Route')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Witness')).toBeInTheDocument();
    expect(screen.getByText('Stock Level')).toBeInTheDocument();

    // Check medication entries
    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(screen.getByText('500 mg')).toBeInTheDocument();
    expect(screen.getByText('oral')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();

    expect(screen.getByText('Morphine')).toBeInTheDocument();
    expect(screen.getByText('10 mg')).toBeInTheDocument();
    expect(screen.getByText('injection')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('CD')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useSchedule as jest.Mock).mockReturnValue({
      schedule: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      prefetchNextDay: jest.fn(),
      isOffline: false,
      syncOfflineChanges: jest.fn(),
    });

    render(<MedicationSchedule residentId="resident1" />);
    expect(screen.getAllByTestId('loading-skeleton')).toHaveLength(5);
  });

  it('shows error state', () => {
    (useSchedule as jest.Mock).mockReturnValue({
      schedule: [],
      isLoading: false,
      error: { message: 'Failed to load schedule' },
      refetch: jest.fn(),
      prefetchNextDay: jest.fn(),
      isOffline: false,
      syncOfflineChanges: jest.fn(),
    });

    render(<MedicationSchedule residentId="resident1" />);
    expect(screen.getByText('Failed to load medication schedule. Please try again.')).toBeInTheDocument();
  });

  it('shows offline state', () => {
    (useSchedule as jest.Mock).mockReturnValue({
      schedule: mockScheduleData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      prefetchNextDay: jest.fn(),
      isOffline: true,
      syncOfflineChanges: jest.fn(),
    });

    render(<MedicationSchedule residentId="resident1" />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('handles refresh button click', () => {
    const mockRefetch = jest.fn();
    const mockSyncOfflineChanges = jest.fn();

    (useSchedule as jest.Mock).mockReturnValue({
      schedule: mockScheduleData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      prefetchNextDay: jest.fn(),
      isOffline: false,
      syncOfflineChanges: mockSyncOfflineChanges,
    });

    render(<MedicationSchedule residentId="resident1" />);
    fireEvent.click(screen.getByText('Refresh'));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles refresh button click in offline mode', () => {
    const mockRefetch = jest.fn();
    const mockSyncOfflineChanges = jest.fn();

    (useSchedule as jest.Mock).mockReturnValue({
      schedule: mockScheduleData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
      prefetchNextDay: jest.fn(),
      isOffline: true,
      syncOfflineChanges: mockSyncOfflineChanges,
    });

    render(<MedicationSchedule residentId="resident1" />);
    fireEvent.click(screen.getByText('Refresh'));
    expect(mockSyncOfflineChanges).toHaveBeenCalled();
  });

  it('prefetches next day schedule on mount', () => {
    const mockPrefetchNextDay = jest.fn();
    (useSchedule as jest.Mock).mockReturnValue({
      schedule: mockScheduleData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      prefetchNextDay: mockPrefetchNextDay,
      isOffline: false,
      syncOfflineChanges: jest.fn(),
    });

    render(<MedicationSchedule residentId="resident1" />);
    expect(mockPrefetchNextDay).toHaveBeenCalled();
  });

  it('shows empty state when no medications are scheduled', () => {
    (useSchedule as jest.Mock).mockReturnValue({
      schedule: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      prefetchNextDay: jest.fn(),
      isOffline: false,
      syncOfflineChanges: jest.fn(),
    });

    render(<MedicationSchedule residentId="resident1" />);
    expect(screen.getByText('No medications scheduled for this day')).toBeInTheDocument();
  });

  it('handles regional settings correctly', () => {
    (useRegionalSettings as jest.Mock).mockReturnValue({
      settings: {
        ...mockSettings,
        requiresControlledDrugWitness: false,
        requiresStockCheck: false,
      },
    });

    render(<MedicationSchedule residentId="resident1" />);
    expect(screen.queryByText('Witness')).not.toBeInTheDocument();
    expect(screen.queryByText('Stock Level')).not.toBeInTheDocument();
  });
}); 