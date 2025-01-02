import { render, screen, fireEvent } from '@testing-library/react';
import { ChildrensCare } from '@/components/care/specialized/childrens/ChildrensCare';
import { mockOfstedData } from '../../mocks/ofstedData';
import { mockPerson } from '../../mocks/personData';

describe('ChildrensCare Component', () => {
  it('renders without crashing', () => {
    render(<ChildrensCare person={mockPerson} ofstedData={mockOfstedData} />);
    expect(screen.getByText('Registration Details')).toBeInTheDocument();
  });

  it('displays correct registration information', () => {
    render(<ChildrensCare person={mockPerson} ofstedData={mockOfstedData} />);
    expect(screen.getByText(mockOfstedData.registration.registrationNumber)).toBeInTheDocument();
  });

  it('shows all required tabs', () => {
    render(<ChildrensCare person={mockPerson} ofstedData={mockOfstedData} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inspections' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Education' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Safeguarding' })).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    render(<ChildrensCare person={mockPerson} ofstedData={mockOfstedData} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Education' }));
    expect(screen.getByText('Education Provision')).toBeInTheDocument();
  });

  it('handles missing Ofsted data gracefully', () => {
    render(<ChildrensCare person={mockPerson} ofstedData={undefined} />);
    expect(screen.queryByText('Registration Details')).toBeInTheDocument();
    expect(screen.queryByText(mockOfstedData.registration.registrationNumber)).not.toBeInTheDocument();
  });
});
