import { renderHook, act } from '@testing-library/react-hooks';
import { useStaffPerformance } from '../useStaffPerformance';
import { useToast } from '@/hooks/useToast';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useTenantContext } from '@/contexts/TenantContext';

// Mock dependencies
jest.mock('@/hooks/useToast');
jest.mock('@/hooks/useOfflineSupport');
jest.mock('@/contexts/TenantContext');

describe('useStaffPerformance', () => {
  const mockToast = { showToast: jest.fn() };
  const mockOfflineSupport = {
    isOnline: true,
    syncStatus: {
      getOfflineData: jest.fn(),
      storeOfflineData: jest.fn()
    }
  };
  const mockTenant = {
    tenant: { id: 'tenant-1' }
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (useOfflineSupport as jest.Mock).mockReturnValue(mockOfflineSupport);
    (useTenantContext as jest.Mock).mockReturnValue(mockTenant);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useStaffPerformance());

    expect(result.current.performanceData).toEqual([]);
    expect(result.current.metrics).toEqual({});
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should fetch staff performance data successfully', async () => {
    const mockData = {
      performanceData: [
        { staffId: '1', metrics: { attendance: 95 } }
      ],
      metrics: {
        averageAttendance: 95
      }
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const { result } = renderHook(() => useStaffPerformance('1'));

    await act(async () => {
      await result.current.fetchPerformanceData('1');
    });

    expect(result.current.performanceData).toEqual(mockData.performanceData);
    expect(result.current.metrics).toEqual(mockData.metrics);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should handle offline data retrieval', async () => {
    const mockOfflineData = {
      performanceData: [
        { staffId: '1', metrics: { attendance: 90 } }
      ],
      metrics: {
        averageAttendance: 90
      }
    };

    mockOfflineSupport.isOnline = false;
    mockOfflineSupport.syncStatus.getOfflineData
      .mockResolvedValueOnce(mockOfflineData);

    const { result } = renderHook(() => useStaffPerformance('1'));

    await act(async () => {
      await result.current.fetchPerformanceData('1');
    });

    expect(result.current.performanceData).toEqual(mockOfflineData.performanceData);
    expect(result.current.metrics).toEqual(mockOfflineData.metrics);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should update performance metrics successfully', async () => {
    const mockUpdate = {
      staffId: '1',
      metrics: { attendance: 98 }
    };
    const mockResponse = { success: true };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useStaffPerformance('1'));

    await act(async () => {
      await result.current.updatePerformanceMetrics(mockUpdate);
    });

    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Performance metrics updated successfully',
      type: 'success'
    });
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('API Error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useStaffPerformance('1'));

    await act(async () => {
      await result.current.fetchPerformanceData('1');
    });

    expect(result.current.error).toBe(error);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to fetch performance data',
      type: 'error'
    });
  });

  it('should queue offline updates', async () => {
    mockOfflineSupport.isOnline = false;
    const mockUpdate = {
      staffId: '1',
      metrics: { attendance: 92 }
    };

    const { result } = renderHook(() => useStaffPerformance('1'));

    await act(async () => {
      await result.current.updatePerformanceMetrics(mockUpdate);
    });

    expect(mockOfflineSupport.syncStatus.storeOfflineData)
      .toHaveBeenCalledWith('staffPerformanceUpdates', '1', mockUpdate);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Info',
      description: 'Performance update saved offline',
      type: 'info'
    });
  });
});


