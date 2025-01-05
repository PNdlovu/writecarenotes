import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAnalytics } from '../useAnalytics';
import { AlertService, AggregationService } from '../../../../services/analytics';

vi.mock('../../../../services/analytics/AlertService');
vi.mock('../../../../services/analytics/AggregationService');

describe('useAnalytics', () => {
  const mockAlerts = [{ id: '1', message: 'Test Alert' }];
  const mockInsights = {
    metrics: { totalSize: 1000 },
    syncStatus: { pendingCount: 0 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (AlertService as any).mockImplementation(() => ({
      getAlerts: vi.fn().mockResolvedValue(mockAlerts)
    }));
    (AggregationService as any).mockImplementation(() => ({
      getAggregatedData: vi.fn().mockResolvedValue(mockInsights)
    }));
  });

  it('fetches and returns analytics data', async () => {
    const { result } = renderHook(() => useAnalytics());

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({
      events: mockAlerts,
      metrics: mockInsights.metrics,
      syncStatus: mockInsights.syncStatus
    });
    expect(result.current.error).toBe(null);
  });

  it('handles errors gracefully', async () => {
    const error = new Error('API Error');
    (AlertService as any).mockImplementation(() => ({
      getAlerts: vi.fn().mockRejectedValue(error)
    }));

    const { result } = renderHook(() => useAnalytics());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(error);
  });

  it('updates data when timeRange changes', async () => {
    const { result, rerender } = renderHook(
      ({ timeRange }) => useAnalytics(timeRange),
      { initialProps: { timeRange: '24h' } }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const initialData = result.current.data;

    // Update timeRange
    rerender({ timeRange: '7d' });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.data).not.toBe(initialData);
  });
});
