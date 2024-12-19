import { renderHook, act } from '@testing-library/react-hooks';
import { useCareHomeData } from '../useCareHomeData';
import { useToast } from '@/hooks/useToast';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { useTenantContext } from '@/contexts/TenantContext';

// Mock dependencies
jest.mock('@/hooks/useToast');
jest.mock('@/hooks/useOfflineSupport');
jest.mock('@/contexts/TenantContext');

describe('useCareHomeData', () => {
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
    const { result } = renderHook(() => useCareHomeData());

    expect(result.current.careHome).toBeNull();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should fetch care home data successfully when online', async () => {
    const mockCareHome = {
      id: '1',
      name: 'Test Care Home'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCareHome)
    });

    const { result } = renderHook(() => useCareHomeData('1'));

    expect(result.current.isLoading).toBeTruthy();

    await act(async () => {
      await result.current.fetchCareHome('1');
    });

    expect(result.current.careHome).toEqual(mockCareHome);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(mockOfflineSupport.syncStatus.storeOfflineData)
      .toHaveBeenCalledWith('careHome', '1', mockCareHome);
  });

  it('should use offline data when available and offline', async () => {
    const mockOfflineData = {
      id: '1',
      name: 'Offline Care Home'
    };

    mockOfflineSupport.isOnline = false;
    mockOfflineSupport.syncStatus.getOfflineData
      .mockResolvedValueOnce(mockOfflineData);

    const { result } = renderHook(() => useCareHomeData('1'));

    await act(async () => {
      await result.current.fetchCareHome('1');
    });

    expect(result.current.careHome).toEqual(mockOfflineData);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    const error = new Error('API Error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCareHomeData('1'));

    await act(async () => {
      await result.current.fetchCareHome('1');
    });

    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBeFalsy();
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to fetch care home data',
      type: 'error'
    });
  });

  it('should update care home data successfully', async () => {
    const mockUpdate = { name: 'Updated Care Home' };
    const mockResponse = { id: '1', ...mockUpdate };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useCareHomeData('1'));

    await act(async () => {
      await result.current.updateCareHome(mockUpdate);
    });

    expect(result.current.careHome).toEqual(mockResponse);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Care home updated successfully',
      type: 'success'
    });
  });

  it('should handle offline updates', async () => {
    mockOfflineSupport.isOnline = false;
    const mockUpdate = { name: 'Offline Update' };

    const { result } = renderHook(() => useCareHomeData('1'));

    await act(async () => {
      await result.current.updateCareHome(mockUpdate);
    });

    expect(mockOfflineSupport.syncStatus.storeOfflineData)
      .toHaveBeenCalledWith('careHomeUpdates', '1', mockUpdate);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Changes saved offline and will sync when online',
      type: 'info'
    });
  });
});


