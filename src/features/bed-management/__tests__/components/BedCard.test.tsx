import { render, screen, fireEvent } from '@testing-library/react'
import { BedCard } from '../../components/BedCard'
import { Bed } from '../../types/bed.types'

const mockBed: Bed = {
  id: '123',
  roomId: '456',
  careHomeId: '789',
  number: 'A101',
  type: 'STANDARD',
  status: 'AVAILABLE',
  features: ['Window', 'En-suite'],
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user1',
    updatedBy: 'user1'
  }
}

describe('BedCard', () => {
  it('renders bed information correctly', () => {
    render(<BedCard bed={mockBed} />)
    
    expect(screen.getByText('Bed A101')).toBeInTheDocument()
    expect(screen.getByText('STANDARD')).toBeInTheDocument()
    expect(screen.getByText('AVAILABLE')).toBeInTheDocument()
  })

  it('calls onAssign when assign button is clicked', () => {
    const onAssign = jest.fn()
    render(<BedCard bed={mockBed} onAssign={onAssign} />)
    
    const assignButton = screen.getByText('Assign')
    fireEvent.click(assignButton)
    
    expect(onAssign).toHaveBeenCalledWith(mockBed.id)
  })

  it('shows discharge button when bed is occupied', () => {
    const occupiedBed = {
      ...mockBed,
      status: 'OCCUPIED',
      currentOccupant: {
        residentId: '123',
        admissionDate: new Date(),
        careLevel: 'MEDIUM',
        specialRequirements: []
      }
    }
    
    const onDischarge = jest.fn()
    render(<BedCard bed={occupiedBed} onDischarge={onDischarge} />)
    
    const dischargeButton = screen.getByText('Discharge')
    fireEvent.click(dischargeButton)
    
    expect(onDischarge).toHaveBeenCalledWith(occupiedBed.id)
  })

  it('shows maintenance information when available', () => {
    const bedWithMaintenance = {
      ...mockBed,
      maintenanceSchedule: {
        lastChecked: new Date('2024-01-01'),
        nextDue: new Date('2024-02-01'),
        issues: ['Needs new mattress']
      }
    }
    
    render(<BedCard bed={bedWithMaintenance} />)
    
    expect(screen.getByText('Maintenance')).toBeInTheDocument()
    expect(screen.getByText('Next Due: 2/1/2024')).toBeInTheDocument()
  })
})


