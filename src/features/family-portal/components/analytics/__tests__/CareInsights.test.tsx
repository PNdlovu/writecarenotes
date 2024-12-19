import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CareInsights } from '../CareInsights';
import { useCareAnalytics } from '../../../hooks/useCareAnalytics';
import { vi } from 'vitest';

// Mock the custom hook
vi.mock('../../../hooks/useCareAnalytics');

// Mock recharts components
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('CareInsights', () => {
  const mockProps = {
    residentId: '123',
    familyMemberId: '456',
  };

  const mockInsights = [
    {
      id: '1',
      title: 'Sleep Pattern Change',
      description: 'Significant improvement in sleep duration',
      confidence: 85,
      trend: 'positive',
      data: [{ date: '2024-01-01', value: 75 }],
    },
  ];

  const mockPatterns = [
    {
      id: '1',
      name: 'Social Engagement',
      description: 'Regular participation in activities',
      significance: 'high',
      observations: ['Consistently joins morning activities'],
    },
  ];

  const mockMetrics = [
    {
      id: '1',
      name: 'Well-being Score',
      description: 'Overall well-being assessment',
      currentValue: 85,
      unit: '%',
      trend: 5,
      history: [{ date: '2024-01-01', value: 80 }],
    },
  ];

  const mockHookReturn = {
    insights: mockInsights,
    patterns: mockPatterns,
    metrics: mockMetrics,
    timeRange: '30d',
    isLoading: false,
    setTimeRange: vi.fn(),
    refreshData: vi.fn(),
  };

  beforeEach(() => {
    (useCareAnalytics as jest.Mock).mockReturnValue(mockHookReturn);
  });

  it('renders without crashing', () => {
    render(<CareInsights {...mockProps} />);
    expect(screen.getByText('Care Insights')).toBeInTheDocument();
  });

  it('displays key insights', () => {
    render(<CareInsights {...mockProps} />);
    expect(screen.getByText('Sleep Pattern Change')).toBeInTheDocument();
    expect(screen.getByText('85% Confidence')).toBeInTheDocument();
  });

  it('displays behavioral patterns', () => {
    render(<CareInsights {...mockProps} />);
    
    const patternsTab = screen.getByText('Behavioral Patterns');
    fireEvent.click(patternsTab);
    
    expect(screen.getByText('Social Engagement')).toBeInTheDocument();
    expect(screen.getByText('high significance')).toBeInTheDocument();
  });

  it('displays care metrics', () => {
    render(<CareInsights {...mockProps} />);
    
    const metricsTab = screen.getByText('Care Metrics');
    fireEvent.click(metricsTab);
    
    expect(screen.getByText('Well-being Score')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('handles time range selection', async () => {
    render(<CareInsights {...mockProps} />);
    
    const timeRangeSelect = screen.getByRole('combobox');
    fireEvent.change(timeRangeSelect, { target: { value: '90d' } });
    
    await waitFor(() => {
      expect(mockHookReturn.setTimeRange).toHaveBeenCalledWith('90d');
    });
  });

  it('displays loading state', () => {
    (useCareAnalytics as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      isLoading: true,
    });
    
    render(<CareInsights {...mockProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders charts correctly', () => {
    render(<CareInsights {...mockProps} />);
    const charts = screen.getAllByTestId('line-chart');
    expect(charts.length).toBeGreaterThan(0);
  });

  it('displays trend indicators', () => {
    render(<CareInsights {...mockProps} />);
    
    const metricsTab = screen.getByText('Care Metrics');
    fireEvent.click(metricsTab);
    
    expect(screen.getByText('↑5%')).toBeInTheDocument();
  });

  it('displays observations list', () => {
    render(<CareInsights {...mockProps} />);
    
    const patternsTab = screen.getByText('Behavioral Patterns');
    fireEvent.click(patternsTab);
    
    expect(screen.getByText('Consistently joins morning activities')).toBeInTheDocument();
  });
});


