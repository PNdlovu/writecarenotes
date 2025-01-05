import { renderHook, act } from '@testing-library/react';
import { useCareAnalytics } from '../useCareAnalytics';
import { vi } from 'vitest';

// Mock useToast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useCareAnalytics', () => {
  const mockProps = {
    residentId: '123',
  };

  it('initializes with default values', () => {
    const { result } = renderHook(() => useCareAnalytics(mockProps));

    expect(result.current.insights).toEqual([]);
    expect(result.current.patterns).toEqual([]);
    expect(result.current.metrics).toEqual([]);
    expect(result.current.timeRange).toBe('30d');
    expect(result.current.isLoading).toBe(true);
  });

  it('loads analytics data on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    await waitForNextUpdate();

    expect(result.current.insights.length).toBeGreaterThan(0);
    expect(result.current.patterns.length).toBeGreaterThan(0);
    expect(result.current.metrics.length).toBeGreaterThan(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('updates time range', async () => {
    const { result } = renderHook(() => useCareAnalytics(mockProps));

    act(() => {
      result.current.setTimeRange('90d');
    });

    expect(result.current.timeRange).toBe('90d');
  });

  it('refreshes data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    await waitForNextUpdate();
    const initialInsights = result.current.insights;

    await act(async () => {
      await result.current.refreshData();
    });

    expect(result.current.insights).not.toBe(initialInsights);
  });

  it('handles loading state correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
  });

  it('generates valid mock time series data', () => {
    const { result } = renderHook(() => useCareAnalytics(mockProps));

    const metric = result.current.metrics[0];
    expect(metric?.history).toBeDefined();
    expect(metric?.history.length).toBeGreaterThan(0);
    expect(metric?.history[0]).toHaveProperty('date');
    expect(metric?.history[0]).toHaveProperty('value');
  });

  it('includes valid insight properties', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    await waitForNextUpdate();

    const insight = result.current.insights[0];
    expect(insight).toHaveProperty('id');
    expect(insight).toHaveProperty('title');
    expect(insight).toHaveProperty('description');
    expect(insight).toHaveProperty('confidence');
    expect(insight).toHaveProperty('trend');
    expect(insight).toHaveProperty('data');
  });

  it('includes valid pattern properties', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    await waitForNextUpdate();

    const pattern = result.current.patterns[0];
    expect(pattern).toHaveProperty('id');
    expect(pattern).toHaveProperty('name');
    expect(pattern).toHaveProperty('description');
    expect(pattern).toHaveProperty('significance');
    expect(pattern).toHaveProperty('observations');
  });

  it('includes valid metric properties', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    await waitForNextUpdate();

    const metric = result.current.metrics[0];
    expect(metric).toHaveProperty('id');
    expect(metric).toHaveProperty('name');
    expect(metric).toHaveProperty('description');
    expect(metric).toHaveProperty('currentValue');
    expect(metric).toHaveProperty('trend');
    expect(metric).toHaveProperty('history');
  });

  it('handles error state correctly', async () => {
    // Mock console.error to prevent error logging during test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a failed API call
    vi.mock('../api', () => ({
      fetchAnalytics: () => Promise.reject(new Error('API Error')),
    }));

    const { result, waitForNextUpdate } = renderHook(() => useCareAnalytics(mockProps));

    await waitForNextUpdate();

    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);

    consoleSpy.mockRestore();
  });
});


