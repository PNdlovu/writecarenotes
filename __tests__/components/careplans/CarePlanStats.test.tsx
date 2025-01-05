import { render, screen } from '@testing-library/react';
import { CarePlanStats } from '@/components/careplans/CarePlanStats';

const mockStats = {
  total: 100,
  active: 75,
  pendingReview: 15,
  overdue: 10,
  byType: {
    PERSONAL_CARE: 30,
    MEDICATION: 25,
    MOBILITY: 20,
    NUTRITION: 15,
    SOCIAL: 10
  },
  byRegion: {
    ENGLAND: 40,
    WALES: 25,
    SCOTLAND: 20,
    NORTHERN_IRELAND: 10,
    IRELAND: 5
  },
  reviewsThisMonth: 25,
  complianceRate: 85
};

describe('CarePlanStats', () => {
  it('renders all statistics correctly', () => {
    render(<CarePlanStats stats={mockStats} />);

    // Check total care plans
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText(/total care plans/i)).toBeInTheDocument();

    // Check active care plans
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();

    // Check pending reviews
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();

    // Check overdue reviews
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();

    // Check compliance rate
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText(/compliance rate/i)).toBeInTheDocument();
  });

  it('displays care plan distribution by type', () => {
    render(<CarePlanStats stats={mockStats} />);

    Object.entries(mockStats.byType).forEach(([type, count]) => {
      expect(screen.getByText(type.replace('_', ' '))).toBeInTheDocument();
      expect(screen.getByText(count.toString())).toBeInTheDocument();
    });
  });

  it('displays regional distribution', () => {
    render(<CarePlanStats stats={mockStats} />);

    Object.entries(mockStats.byRegion).forEach(([region, count]) => {
      expect(screen.getByText(region.replace('_', ' '))).toBeInTheDocument();
      expect(screen.getByText(count.toString())).toBeInTheDocument();
    });
  });

  it('shows warning indicator for low compliance rate', () => {
    const lowComplianceStats = {
      ...mockStats,
      complianceRate: 65
    };

    render(<CarePlanStats stats={lowComplianceStats} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/compliance rate below threshold/i)).toBeInTheDocument();
  });

  it('shows critical indicator for high overdue rate', () => {
    const highOverdueStats = {
      ...mockStats,
      total: 100,
      overdue: 25 // 25% overdue
    };

    render(<CarePlanStats stats={highOverdueStats} />);
    
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/high number of overdue reviews/i)).toBeInTheDocument();
  });

  it('displays loading state when stats are not available', () => {
    render(<CarePlanStats stats={undefined} />);
    
    expect(screen.getByText(/loading statistics/i)).toBeInTheDocument();
  });

  it('displays error state when stats fail to load', () => {
    render(<CarePlanStats stats={null} error="Failed to load statistics" />);
    
    expect(screen.getByText(/failed to load statistics/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const largeStats = {
      ...mockStats,
      total: 1500,
      active: 1200
    };

    render(<CarePlanStats stats={largeStats} />);
    
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });

  it('calculates and displays correct percentages', () => {
    render(<CarePlanStats stats={mockStats} />);
    
    // Active percentage (75/100 = 75%)
    expect(screen.getByText('75%')).toBeInTheDocument();
    
    // Pending review percentage (15/100 = 15%)
    expect(screen.getByText('15%')).toBeInTheDocument();
    
    // Overdue percentage (10/100 = 10%)
    expect(screen.getByText('10%')).toBeInTheDocument();
  });
}); 