import { render, screen, fireEvent } from '@testing-library/react';
import { YoungAdultCare } from '@/components/care/specialized/young-adult/YoungAdultCare';
import { mockPerson } from '../../mocks/personData';

const mockAssessment = {
  transitionPlanning: {
    assessment: true,
    goals: true,
    support: true,
  },
  educationSupport: {
    needs: true,
    plans: true,
    coordination: true,
  },
  independentSkills: {
    assessment: true,
    development: true,
    monitoring: true,
  }
};

describe('YoungAdultCare Component', () => {
  it('renders without crashing', () => {
    render(<YoungAdultCare person={mockPerson} assessment={mockAssessment} />);
    expect(screen.getByText('Transition Planning')).toBeInTheDocument();
  });

  it('displays all assessment sections', () => {
    render(<YoungAdultCare person={mockPerson} assessment={mockAssessment} />);
    expect(screen.getByText('Transition Planning')).toBeInTheDocument();
    expect(screen.getByText('Education Support')).toBeInTheDocument();
    expect(screen.getByText('Independent Skills')).toBeInTheDocument();
  });

  it('shows assessment details correctly', () => {
    render(<YoungAdultCare person={mockPerson} assessment={mockAssessment} />);
    expect(screen.getByText('Assessment')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('handles missing assessment data gracefully', () => {
    render(<YoungAdultCare person={mockPerson} assessment={undefined} />);
    expect(screen.getByText('Transition Planning')).toBeInTheDocument();
    expect(screen.queryByText('Assessment: Complete')).not.toBeInTheDocument();
  });

  it('allows navigation between sections', () => {
    render(<YoungAdultCare person={mockPerson} assessment={mockAssessment} />);
    fireEvent.click(screen.getByText('Education Support'));
    expect(screen.getByText('Education Needs')).toBeInTheDocument();
  });
});
