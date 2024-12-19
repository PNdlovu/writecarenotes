import React from 'react';
import { render, screen } from '@testing-library/react';
import { StaffAvailabilityPanel } from '@/components/staff/availability/StaffAvailabilityPanel';

describe('StaffAvailabilityPanel', () => {
  it('renders the component with correct heading', () => {
    render(<StaffAvailabilityPanel />);
    
    expect(screen.getByText('Staff Availability')).toBeInTheDocument();
  });

  it('renders the placeholder content', () => {
    render(<StaffAvailabilityPanel />);
    
    expect(screen.getByText('Staff availability panel content will go here')).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<StaffAvailabilityPanel />);
    
    const container = screen.getByText('Staff Availability').parentElement;
    expect(container).toHaveClass('p-4');
    expect(screen.getByText('Staff Availability')).toHaveClass('text-lg', 'font-semibold', 'mb-4');
  });
});
