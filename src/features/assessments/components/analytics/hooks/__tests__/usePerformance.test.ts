import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePerformance } from '../usePerformance';
import { AggregationService } from '../../../../services/analytics';

vi.mock('../../../../services/analytics/AggregationService');

describe('usePerformance', () => {
  const mockPerformanceData = [
    {
      timestamp: Date.now(),
      syncDuration: 100,
      storageSize: 1000,
      eventCount: 50,
      errorCount: 2
    },
    {
      timestamp: Date.now() - 60000,
      syncDuration: 150,
      storageSize: 900,
      eventCount: 45,
      errorCount: 1
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (AggregationService as any).mockImplementation(() => ({
      getPerformanceMetrics: vi.fn().mockResolvedValue(mockPerformanceData)
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches and calculates performance metrics', async () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.loading).toBe(true);
    expect(result.current.metrics).toBe(null);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockPerformanceData);
    expect(result.current.metrics).toEqual({
      avgSyncDuration: 125, // (100 + 150) / 2
      maxSyncDuration: 150,
      storageGrowthRate: 11.11111111111111, // ((1000 - 900) / 900) * 100
      errorRate: 1.5 // (2 + 1) / 2
    });
    expect(result.current.error).toBe(null);
  });

  it('updates metrics periodically', async () => {
    const { result } = renderHook(() => usePerformance());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    const initialMetrics = result.current.metrics;

    // Update mock data for next interval
    const newMockData = mockPerformanceData.map(d => ({
      ...d,
      syncDuration: d.syncDuration + 50
    }));
    (AggregationService as any).mockImplementation(() => ({
      getPerformanceMetrics: vi.fn().mockResolvedValue(newMockData)
    }));

    // Fast-forward time by 1 minute
    await act(async () => {
      vi.advanceTimersByTime(60000);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.metrics).not.toEqual(initialMetrics);
  });

  it('handles errors gracefully', async () => {
    const error = new Error('API Error');
    (AggregationService as any).mockImplementation(() => ({
      getPerformanceMetrics: vi.fn().mockRejectedValue(error)
    }));

    const { result } = renderHook(() => usePerformance());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.metrics).toBe(null);
    expect(result.current.error).toEqual(error);
  });

  it('cleans up interval on unmount', () => {
    const { unmount } = renderHook(() => usePerformance());
    
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
