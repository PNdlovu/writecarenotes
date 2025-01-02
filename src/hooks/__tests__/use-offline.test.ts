/**
 * @writecarenotes.com
 * @fileoverview Unit tests for useOffline hook
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../use-offline';

// Mock the analytics
jest.mock('@/utils/analytics', () => ({
  logEvent: jest.fn(),
}));

describe('useOffline', () => {
  let onlineStatus = true;
  const mockOnSync = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    onlineStatus = true;
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => onlineStatus,
    });
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
    mockOnSync.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current).toEqual(expect.objectContaining({
      isOnline: true,
      isSyncing: false,
      lastSyncTime: null,
      pendingActions: 0,
    }));
  });

  it('handles going offline', async () => {
    const { result } = renderHook(() => useOffline());

    // Simulate going offline
    act(() => {
      const offlineCallback = (window.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'offline')[1];
      offlineCallback();
    });

    expect(result.current.isOnline).toBe(false);
  });

  it('handles going online and triggers sync', async () => {
    const { result } = renderHook(() => useOffline({
      onSync: mockOnSync,
    }));

    // Simulate going online
    act(() => {
      const onlineCallback = (window.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'online')[1];
      onlineCallback();
    });

    expect(result.current.isOnline).toBe(true);
    expect(mockOnSync).toHaveBeenCalledTimes(1);
  });

  it('performs periodic sync when online', async () => {
    const { result } = renderHook(() => useOffline({
      syncInterval: 1000,
      onSync: mockOnSync,
    }));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnSync).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(mockOnSync).toHaveBeenCalledTimes(2);
  });

  it('does not sync when offline', async () => {
    const { result } = renderHook(() => useOffline({
      syncInterval: 1000,
      onSync: mockOnSync,
    }));

    // Go offline
    act(() => {
      const offlineCallback = (window.addEventListener as jest.Mock).mock.calls
        .find(call => call[0] === 'offline')[1];
      offlineCallback();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockOnSync).not.toHaveBeenCalled();
  });

  it('tracks pending actions correctly', () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.addPendingAction();
    });

    expect(result.current.pendingActions).toBe(1);

    act(() => {
      result.current.addPendingAction();
    });

    expect(result.current.pendingActions).toBe(2);
  });

  it('resets pending actions after successful sync', async () => {
    const { result } = renderHook(() => useOffline({
      onSync: mockOnSync,
    }));

    act(() => {
      result.current.addPendingAction();
      result.current.addPendingAction();
    });

    expect(result.current.pendingActions).toBe(2);

    await act(async () => {
      await result.current.sync();
    });

    expect(result.current.pendingActions).toBe(0);
  });
});
