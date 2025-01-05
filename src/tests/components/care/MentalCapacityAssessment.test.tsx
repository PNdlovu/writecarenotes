import { render, screen, fireEvent } from '@testing-library/react';
import { MentalCapacityAssessment } from '@/components/care/specialized/mental-capacity/MentalCapacityAssessment';
import { mockPerson } from '../../mocks/personData';

const mockAssessment = {
  capacity: {
    understanding: true,
    retention: true,
    weighing: true,
    communication: true,
  },
  bestInterests: {
    consultation: true,
    documentation: true,
    review: true,
  },
  safeguards: {
    restrictions: true,
    authorizations: true,
    monitoring: true,
  }
};

describe('MentalCapacityAssessment Component', () => {
  it('renders without crashing', () => {
    render(<MentalCapacityAssessment person={mockPerson} assessment={mockAssessment} />);
    expect(screen.getByText('Mental Capacity Assessment')).toBeInTheDocument();
  });

  it('displays all assessment sections', () => {
    render(<MentalCapacityAssessment person={mockPerson} assessment={mockAssessment} />);
    expect(screen.getByText('Capacity Assessment')).toBeInTheDocument();
    expect(screen.getByText('Best Interests')).toBeInTheDocument();
    expect(screen.getByText('Safeguards')).toBeInTheDocument();
  });

  it('shows capacity details correctly', () => {
    render(<MentalCapacityAssessment person={mockPerson} assessment={mockAssessment} />);
    expect(screen.getByText('Understanding')).toBeInTheDocument();
    expect(screen.getByText('Retention')).toBeInTheDocument();
    expect(screen.getByText('Weighing Information')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
  });

  it('handles missing assessment data gracefully', () => {
    render(<MentalCapacityAssessment person={mockPerson} assessment={undefined} />);
    expect(screen.getByText('Mental Capacity Assessment')).toBeInTheDocument();
    expect(screen.queryByText('Understanding: Complete')).not.toBeInTheDocument();
  });

  it('allows navigation between sections', () => {
    render(<MentalCapacityAssessment person={mockPerson} assessment={mockAssessment} />);
    fireEvent.click(screen.getByText('Best Interests'));
    expect(screen.getByText('Consultation Process')).toBeInTheDocument();
  });
});
