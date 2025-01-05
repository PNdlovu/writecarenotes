import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmergencyDashboard } from '../EmergencyDashboard';
import { useEmergencyResponse } from '@/hooks/useEmergencyResponse';
import { useToast } from '@/components/ui/use-toast';

// Mock the hooks
jest.mock('@/hooks/useEmergencyResponse');
jest.mock('@/components/ui/use-toast');

const mockActiveAlerts = [
  {
    id: '1',
    type: 'MEDICAL',
    priority: 'HIGH',
    status: 'ACTIVE',
    description: 'Medical emergency in Room 101',
    createdAt: new Date().toISOString(),
    createdBy: 'John Doe',
    location: { floor: 1, wing: 'A', roomId: '101' },
  },
  {
    id: '2',
    type: 'FIRE',
    priority: 'HIGH',
    status: 'ACKNOWLEDGED',
    description: 'Fire alarm in Kitchen',
    createdAt: new Date().toISOString(),
    createdBy: 'Jane Smith',
    acknowledgedBy: 'Mike Johnson',
    location: { floor: 1, wing: 'B' },
    responseTime: 45,
  },
];

const mockEmergencyContacts = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Emergency Coordinator',
    phone: '123-456-7890',
    priority: 1,
  },
];

const mockIncidentReports = [
  {
    id: '1',
    type: 'MEDICAL',
    dateTime: new Date().toISOString(),
    description: 'Patient fall incident',
    actions: [
      { description: 'First aid administered' },
      { description: 'Family notified' },
    ],
  },
];

describe('EmergencyDashboard', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });

    (useEmergencyResponse as jest.Mock).mockReturnValue({
      activeAlerts: mockActiveAlerts,
      emergencyContacts: mockEmergencyContacts,
      incidentReports: mockIncidentReports,
      loadActiveAlerts: jest.fn().mockResolvedValue(undefined),
      loadEmergencyContacts: jest.fn().mockResolvedValue(undefined),
      loadIncidentReports: jest.fn().mockResolvedValue(undefined),
      acknowledgeAlert: jest.fn().mockResolvedValue(undefined),
      resolveAlert: jest.fn().mockResolvedValue(undefined),
      activateEmergencyMode: jest.fn().mockResolvedValue(undefined),
      deactivateEmergencyMode: jest.fn().mockResolvedValue(undefined),
      activateProtocol: jest.fn().mockResolvedValue(undefined),
      completeProtocolStep: jest.fn().mockResolvedValue(undefined),
      documentOverride: jest.fn().mockResolvedValue(undefined),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<EmergencyDashboard facilityId="facility-1" />);
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('displays active alerts count correctly', async () => {
    render(<EmergencyDashboard facilityId="facility-1" />);
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // One ACTIVE alert
    });
  });

  it('displays acknowledged alerts count correctly', async () => {
    render(<EmergencyDashboard facilityId="facility-1" />);
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // One ACKNOWLEDGED alert
    });
  });

  it('calculates average response time correctly', async () => {
    render(<EmergencyDashboard facilityId="facility-1" />);
    await waitFor(() => {
      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });

  it('displays emergency contacts count correctly', async () => {
    render(<EmergencyDashboard facilityId="facility-1" />);
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // One emergency contact
    });
  });

  it('handles alert acknowledgment', async () => {
    const { acknowledgeAlert } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Acknowledge'));
    });

    expect(acknowledgeAlert).toHaveBeenCalledWith('1');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Alert Acknowledged',
      description: 'The alert has been acknowledged and is being handled.',
    });
  });

  it('handles alert resolution', async () => {
    const { resolveAlert } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Resolve'));
    });

    expect(resolveAlert).toHaveBeenCalledWith('2');
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Alert Resolved',
      description: 'The alert has been resolved and archived.',
    });
  });

  it('handles emergency mode activation', async () => {
    const { activateEmergencyMode } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Activate Emergency Mode'));
    });

    expect(activateEmergencyMode).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Emergency Mode Activated',
      description: 'Emergency protocols are now in effect.',
      variant: 'destructive',
    });
  });

  it('handles emergency mode deactivation', async () => {
    const { deactivateEmergencyMode } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Deactivate Emergency Mode'));
    });

    expect(deactivateEmergencyMode).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Emergency Mode Deactivated',
      description: 'Normal operations have resumed.',
    });
  });

  it('handles protocol activation', async () => {
    const { activateProtocol } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Activate Protocol'));
    });

    expect(activateProtocol).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Protocol Activated',
      description: 'Emergency protocol is now active.',
    });
  });

  it('handles protocol step completion', async () => {
    const { completeProtocolStep } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Complete Step'));
    });

    expect(completeProtocolStep).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Step Completed',
      description: 'Protocol step has been marked as complete.',
    });
  });

  it('handles override documentation', async () => {
    const { documentOverride } = useEmergencyResponse();
    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Document Override'));
    });

    expect(documentOverride).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Override Documented',
      description: 'Emergency override has been recorded.',
    });
  });

  it('displays error toast on API failure', async () => {
    const mockError = new Error('API Error');
    (useEmergencyResponse as jest.Mock).mockReturnValue({
      ...useEmergencyResponse(),
      loadActiveAlerts: jest.fn().mockRejectedValue(mockError),
    });

    render(<EmergencyDashboard facilityId="facility-1" />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load emergency data. Please try again.',
        variant: 'destructive',
      });
    });
  });
});


