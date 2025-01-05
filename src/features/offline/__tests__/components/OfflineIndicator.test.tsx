/**
 * @writecarenotes.com
 * @fileoverview Tests for OfflineIndicator component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-01
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';
import { OfflineIndicator } from '../../components/OfflineIndicator';
import { useOffline } from '../../hooks/useOffline';

// Mock the useOffline hook
vi.mock('../../hooks/useOffline', () => ({
  useOffline: vi.fn()
}));

describe('OfflineIndicator', () => {
  const mockSync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online and no pending actions', () => {
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingActions: 0,
      syncNow: mockSync,
      lastSyncTime: null,
    });

    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('should show offline status when offline', () => {
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
      isSyncing: false,
      pendingActions: 0,
      syncNow: mockSync,
      lastSyncTime: null,
    });

    render(<OfflineIndicator />);
    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should show syncing status when syncing', () => {
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: true,
      pendingActions: 2,
      syncNow: mockSync,
      lastSyncTime: null,
    });

    render(<OfflineIndicator />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('should show pending actions count', () => {
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingActions: 5,
      syncNow: mockSync,
      lastSyncTime: null,
    });

    render(<OfflineIndicator showPendingCount />);
    expect(screen.getByText('5 pending changes')).toBeInTheDocument();
  });

  it('should trigger sync when clicked', () => {
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingActions: 3,
      syncNow: mockSync,
      lastSyncTime: null,
    });

    render(<OfflineIndicator />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSync).toHaveBeenCalled();
  });

  it('should show last sync time', () => {
    const lastSyncTime = new Date().toISOString();
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: true,
      isSyncing: false,
      pendingActions: 0,
      syncNow: mockSync,
      lastSyncTime,
    });

    render(<OfflineIndicator />);
    expect(screen.getByText(/Last synced/)).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    (useOffline as jest.Mock).mockReturnValue({
      isOnline: false,
      isSyncing: false,
      pendingActions: 0,
      syncNow: mockSync,
      lastSyncTime: null,
    });

    const { container } = render(<OfflineIndicator className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
