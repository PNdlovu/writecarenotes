import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';
import { AlertService, SettingsService, AggregationService } from '../../../services/analytics';
import { useAssessmentContext } from '../../../context/AssessmentContext';

vi.mock('../../../context/AssessmentContext', () => ({
  useAssessmentContext: vi.fn()
}));

vi.mock('../../../services/analytics/AlertService');
vi.mock('../../../services/analytics/SettingsService');
vi.mock('../../../services/analytics/AggregationService');

describe('AnalyticsDashboard', () => {
  const mockAlertService = {
    getAlerts: vi.fn(),
    acknowledgeAlert: vi.fn()
  };

  const mockSettingsService = {
    getSettings: vi.fn(),
    updateSettings: vi.fn()
  };

  const mockAggregationService = {
    getAggregatedData: vi.fn(),
    getInsights: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (AlertService as any).mockImplementation(() => mockAlertService);
    (SettingsService as any).mockImplementation(() => mockSettingsService);
    (AggregationService as any).mockImplementation(() => mockAggregationService);
    (useAssessmentContext as any).mockReturnValue({
      assessments: [],
      loading: false,
      error: null
    });
  });

  it('renders dashboard with all panels', () => {
    render(<AnalyticsDashboard />);
    
    expect(screen.getByTestId('analytics-dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('alerts-panel')).toBeInTheDocument();
    expect(screen.getByTestId('insights-panel')).toBeInTheDocument();
    expect(screen.getByTestId('settings-button')).toBeInTheDocument();
  });

  it('opens settings dialog on button click', async () => {
    render(<AnalyticsDashboard />);
    
    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-dialog')).toBeInTheDocument();
    });
  });

  it('loads and displays analytics data', async () => {
    const mockData = {
      alerts: [{ id: '1', message: 'Test Alert' }],
      insights: [{ id: '1', title: 'Test Insight' }]
    };

    mockAlertService.getAlerts.mockResolvedValue(mockData.alerts);
    mockAggregationService.getInsights.mockResolvedValue(mockData.insights);

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Alert')).toBeInTheDocument();
      expect(screen.getByText('Test Insight')).toBeInTheDocument();
    });
  });

  it('handles alert acknowledgment', async () => {
    const mockAlert = { id: '1', message: 'Test Alert' };
    mockAlertService.getAlerts.mockResolvedValue([mockAlert]);

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const acknowledgeButton = screen.getByTestId('acknowledge-alert-1');
      fireEvent.click(acknowledgeButton);
      expect(mockAlertService.acknowledgeAlert).toHaveBeenCalledWith('1');
    });
  });

  it('updates settings when changed', async () => {
    const newSettings = {
      refreshInterval: 60,
      showAlerts: true,
      chartType: 'bar'
    };

    render(<AnalyticsDashboard />);

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      const saveButton = screen.getByTestId('save-settings');
      fireEvent.click(saveButton);
      expect(mockSettingsService.updateSettings).toHaveBeenCalledWith(newSettings);
    });
  });
});
