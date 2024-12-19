import { renderHook, act } from '@testing-library/react';
import { useOfflineCarePlans } from '@/hooks/useOfflineCarePlans';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('@/hooks/useNetworkStatus');
vi.mock('@/hooks/useOfflineStorage');
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
  })),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

const mockCarePlan = {
  id: '1',
  residentId: 'resident1',
  type: 'PERSONAL_CARE',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useOfflineCarePlans', () => {
  const mockOptions = {
    organizationId: 'org1',
    facilityId: 'facility1',
    region: 'ENGLAND',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock network status
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: true,
    });

    // Mock storage functions
    (useOfflineStorage as jest.Mock).mockReturnValue({
      getItem: vi.fn().mockResolvedValue([]),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
      getPendingSync: vi.fn().mockResolvedValue([]),
    });

    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve([mockCarePlan]),
    });
  });

  it('fetches care plans when online', async () => {
    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    await act(async () => {
      await result.current.createCarePlan(mockCarePlan);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/careplans'),
      expect.any(Object)
    );
  });

  it('stores care plans locally when offline', async () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: false,
    });

    const mockStorage = {
      getItem: vi.fn().mockResolvedValue([]),
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
      getPendingSync: vi.fn().mockResolvedValue([]),
    };

    (useOfflineStorage as jest.Mock).mockReturnValue(mockStorage);

    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    await act(async () => {
      await result.current.createCarePlan(mockCarePlan);
    });

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      'pendingCarePlans',
      expect.arrayContaining([
        expect.objectContaining({
          ...mockCarePlan,
          syncStatus: 'pending',
        }),
      ])
    );
  });

  it('syncs pending changes when coming online', async () => {
    let isOnline = false;
    (useNetworkStatus as jest.Mock).mockImplementation(() => ({
      isOnline,
    }));

    const { result, rerender } = renderHook(() => useOfflineCarePlans(mockOptions));

    // Create offline care plan
    await act(async () => {
      await result.current.createCarePlan(mockCarePlan);
    });

    // Simulate coming online
    isOnline = true;
    rerender();

    expect(result.current.syncStatus).toBe('syncing');
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(result.current.syncStatus).toBe('idle');
  });

  it('handles sync errors gracefully', async () => {
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: true,
    });

    global.fetch = vi.fn().mockRejectedValue(new Error('Sync failed'));

    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    await act(async () => {
      await result.current.syncPendingChanges();
    });

    expect(result.current.syncStatus).toBe('error');
    expect(result.current.syncError).toBe('Sync failed');
  });

  it('returns correct pending changes count', async () => {
    const mockStorage = {
      getItem: vi.fn()
        .mockResolvedValueOnce([{ id: '1' }]) // pendingCarePlans
        .mockResolvedValueOnce([{ id: '2' }]) // pendingUpdates
        .mockResolvedValueOnce(['3']), // pendingDeletions
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
      getPendingSync: vi.fn().mockResolvedValue([]),
    };

    (useOfflineStorage as jest.Mock).mockReturnValue(mockStorage);

    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    const count = await result.current.getPendingChangesCount();
    expect(count).toBe(3);
  });

  it('handles update operations correctly', async () => {
    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    await act(async () => {
      await result.current.updateCarePlan({
        ...mockCarePlan,
        status: 'COMPLETED',
      });
    });

    expect(fetch).toHaveBeenCalledWith(
      `/api/careplans/${mockCarePlan.id}`,
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  it('handles delete operations correctly', async () => {
    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    await act(async () => {
      await result.current.deleteCarePlan(mockCarePlan.id);
    });

    expect(fetch).toHaveBeenCalledWith(
      `/api/careplans/${mockCarePlan.id}`,
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('maintains data consistency during sync', async () => {
    const mockStorage = {
      getItem: vi.fn()
        .mockResolvedValueOnce([mockCarePlan]) // pendingCarePlans
        .mockResolvedValueOnce([]) // pendingUpdates
        .mockResolvedValueOnce([]), // pendingDeletions
      setItem: vi.fn().mockResolvedValue(undefined),
      removeItem: vi.fn().mockResolvedValue(undefined),
      getPendingSync: vi.fn().mockResolvedValue([]),
    };

    (useOfflineStorage as jest.Mock).mockReturnValue(mockStorage);

    const { result } = renderHook(() => useOfflineCarePlans(mockOptions));

    await act(async () => {
      await result.current.syncPendingChanges();
    });

    expect(mockStorage.removeItem).toHaveBeenCalledWith('pendingCarePlans');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('pendingUpdates');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('pendingDeletions');
  });
}); 