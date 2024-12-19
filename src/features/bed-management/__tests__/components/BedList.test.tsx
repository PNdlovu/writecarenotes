// src/features/bed-management/__tests__/components/BedList.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import { BedList } from '../../components/lists/BedList'
import { BedStatus, BedType } from '../../types/bed.types'

const mockBeds = [
  {
    id: '1',
    number: 'A101',
    type: BedType.STANDARD,
    status: BedStatus.AVAILABLE,
    floor: 1,
    wing: 'A',
    features: ['window'],
    lastMaintenanceDate: new Date('2024-01-01'),
    nextMaintenanceDate: new Date('2024-02-01'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    number: 'B202',
    type: BedType.BARIATRIC,
    status: BedStatus.OCCUPIED,
    floor: 2,
    wing: 'B',
    features: ['bathroom'],
    lastMaintenanceDate: new Date('2024-01-15'),
    nextMaintenanceDate: new Date('2024-02-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

describe('BedList', () => {
  it('renders all beds', () => {
    render(<BedList beds={mockBeds} />)
    
    expect(screen.getByText('A101')).toBeInTheDocument()
    expect(screen.getByText('B202')).toBeInTheDocument()
  })

  it('filters beds by search', () => {
    render(<BedList beds={mockBeds} />)
    
    const searchInput = screen.getByPlaceholderText('Search beds...')
    fireEvent.change(searchInput, { target: { value: 'A101' } })
    
    expect(screen.getByText('A101')).toBeInTheDocument()
    expect(screen.queryByText('B202')).not.toBeInTheDocument()
  })

  it('filters beds by status', () => {
    render(<BedList beds={mockBeds} />)
    
    const statusSelect = screen.getByRole('combobox', { name: /status/i })
    fireEvent.change(statusSelect, { target: { value: BedStatus.AVAILABLE } })
    
    expect(screen.getByText('A101')).toBeInTheDocument()
    expect(screen.queryByText('B202')).not.toBeInTheDocument()
  })

  it('calls onSelect when bed is clicked', () => {
    const onSelect = jest.fn()
    render(<BedList beds={mockBeds} onSelect={onSelect} />)
    
    fireEvent.click(screen.getByText('A101'))
    
    expect(onSelect).toHaveBeenCalledWith(mockBeds[0])
  })
})


