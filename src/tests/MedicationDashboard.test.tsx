import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import MedicationDashboard from '../components/MedicationDashboard'
import { MedicationProvider } from '@/contexts/MedicationContext';
import { TenantProvider } from '@/contexts/TenantContext';
import { useMedications } from '@/hooks/useMedications'
import { useToast } from '@/components/ui/use-toast'

// Mock the hooks
jest.mock('@/hooks/useMedications')
jest.mock('@/components/ui/use-toast')

const mockMedications = [
  {
    id: '1',
    name: 'Aspirin',
    dosage: '100mg',
    frequency: 'Daily',
    nextDue: new Date().toISOString(),
    status: 'PENDING',
  },
  {
    id: '2',
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: '4 hours',
    nextDue: new Date().toISOString(),
    status: 'COMPLETED',
  },
]

describe('MedicationDashboard', () => {
  const mockToast = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })
    
    ;(useMedications as jest.Mock).mockReturnValue({
      medications: mockMedications,
      isLoading: false,
      error: null,
      updateMedication: jest.fn(),
      addMedication: jest.fn(),
      deleteMedication: jest.fn(),
    })
  })

  const renderDashboard = () => {
    return render(
      <TenantProvider>
        <MedicationProvider>
          <MedicationDashboard />
        </MedicationProvider>
      </TenantProvider>
    );
  };

  it('renders medication list', () => {
    renderDashboard()
    
    expect(screen.getByText('Aspirin')).toBeInTheDocument()
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    ;(useMedications as jest.Mock).mockReturnValue({
      medications: [],
      isLoading: true,
      error: null,
    })

    renderDashboard()
    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('shows error state', () => {
    ;(useMedications as jest.Mock).mockReturnValue({
      medications: [],
      isLoading: false,
      error: 'Failed to load medications',
    })

    renderDashboard()
    expect(screen.getByText(/Failed to load medications/i)).toBeInTheDocument()
  })

  it('handles medication status update', async () => {
    const mockUpdateMedication = jest.fn()
    ;(useMedications as jest.Mock).mockReturnValue({
      medications: mockMedications,
      isLoading: false,
      error: null,
      updateMedication: mockUpdateMedication,
    })

    renderDashboard()
    
    const statusButton = screen.getByRole('button', { name: /complete/i })
    fireEvent.click(statusButton)

    await waitFor(() => {
      expect(mockUpdateMedication).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          status: 'COMPLETED',
        })
      )
    })
  })

  it('handles medication deletion', async () => {
    const mockDeleteMedication = jest.fn()
    ;(useMedications as jest.Mock).mockReturnValue({
      medications: mockMedications,
      isLoading: false,
      error: null,
      deleteMedication: mockDeleteMedication,
    })

    renderDashboard()
    
    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeleteMedication).toHaveBeenCalledWith('1')
    })
  })
})


