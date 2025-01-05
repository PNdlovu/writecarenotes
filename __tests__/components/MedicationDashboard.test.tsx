import { render, screen, fireEvent, waitFor } from '../setup/test-utils';
import { MedicationDashboard } from '@/components/medication/MedicationDashboard';
import { MedicationService } from '@/services/medication.service';

jest.mock('@/services/medication.service');

describe('MedicationDashboard', () => {
  const mockMedications = [
    {
      id: '1',
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: '4 times daily',
      status: 'active',
      nextDue: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'as needed',
      status: 'pending',
      nextDue: new Date().toISOString()
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (MedicationService.getMedications as jest.Mock).mockResolvedValue(mockMedications);
  });

  test('renders medication dashboard', async () => {
    render(<MedicationDashboard residentId="123" />);
    
    expect(screen.getByText('Medication Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Loading medications...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    });
  });

  test('handles medication administration', async () => {
    const mockAdminister = jest.fn().mockResolvedValue({ success: true });
    (MedicationService.administerMedication as jest.Mock) = mockAdminister;

    render(<MedicationDashboard residentId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Administer'));

    expect(screen.getByText('Confirm Administration')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Confirm'));
    
    await waitFor(() => {
      expect(mockAdminister).toHaveBeenCalledWith('1', {
        residentId: '123',
        timestamp: expect.any(String)
      });
      expect(screen.getByText('Medication administered successfully')).toBeInTheDocument();
    });
  });

  test('displays error message on failed administration', async () => {
    const mockAdminister = jest.fn().mockRejectedValue(new Error('Failed to administer'));
    (MedicationService.administerMedication as jest.Mock) = mockAdminister;

    render(<MedicationDashboard residentId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Administer'));
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(screen.getByText('Failed to administer medication')).toBeInTheDocument();
    });
  });

  test('filters medications by status', async () => {
    render(<MedicationDashboard residentId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Active'));

    expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    expect(screen.queryByText('Ibuprofen')).not.toBeInTheDocument();
  });

  test('sorts medications by due time', async () => {
    render(<MedicationDashboard residentId="123" />);

    await waitFor(() => {
      expect(screen.getByText('Paracetamol')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sort by Due Time'));

    const medications = screen.getAllByTestId('medication-item');
    expect(medications[0]).toHaveTextContent('Paracetamol');
  });
}); 