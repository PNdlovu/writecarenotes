/**
 * @fileoverview Tests for useCalendar hook
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { renderHook, act } from '@testing-library/react';
import { useCalendar } from '../hooks/use-calendar';
import { apiClient } from '@/lib/api-client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock data
const mockEvent = {
  id: '1',
  title: 'Test Event',
  start: new Date('2024-03-21T10:00:00Z'),
  end: new Date('2024-03-21T11:00:00Z'),
  allDay: false,
  description: 'Test Description',
  location: 'Test Location',
  attendees: ['test@example.com'],
};

const mockEvents = [mockEvent];

describe('useCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful API responses
    (apiClient.get as any).mockResolvedValue({ data: mockEvents, meta: { total: 1 } });
    (apiClient.post as any).mockResolvedValue({ data: mockEvent });
    (apiClient.patch as any).mockResolvedValue({ data: mockEvent });
    (apiClient.delete as any).mockResolvedValue({ data: { success: true } });
  });

  it('should fetch events successfully', async () => {
    const { result } = renderHook(() => useCalendar());

    // Initial state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.events).toEqual([]);

    // Wait for fetch to complete
    await act(async () => {
      await result.current.fetchEvents();
    });

    // Check final state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.events).toEqual(mockEvents);
    expect(result.current.error).toBe(null);
  });

  it('should create event successfully', async () => {
    const { result } = renderHook(() => useCalendar());

    const newEvent = {
      title: 'New Event',
      start: new Date('2024-03-21T10:00:00Z'),
      end: new Date('2024-03-21T11:00:00Z'),
      allDay: false,
      description: 'New Description',
      location: 'New Location',
      attendees: ['new@example.com'],
    };

    await act(async () => {
      await result.current.createEvent(newEvent);
    });

    expect(apiClient.post).toHaveBeenCalledWith('/calendar', newEvent);
    expect(result.current.events).toContainEqual(mockEvent);
  });

  it('should update event successfully', async () => {
    const { result } = renderHook(() => useCalendar());

    const updatedData = {
      title: 'Updated Event',
    };

    await act(async () => {
      await result.current.updateEvent('1', updatedData);
    });

    expect(apiClient.patch).toHaveBeenCalledWith('/calendar/1', updatedData);
  });

  it('should delete event successfully', async () => {
    const { result } = renderHook(() => useCalendar());

    await act(async () => {
      await result.current.deleteEvent('1');
    });

    expect(apiClient.delete).toHaveBeenCalledWith('/calendar/1');
  });

  it('should handle offline mode for create', async () => {
    // Mock offline state
    vi.mock('@/hooks/use-network', () => ({
      useNetwork: () => ({
        isOnline: false,
      }),
    }));

    const { result } = renderHook(() => useCalendar());

    const newEvent = {
      title: 'Offline Event',
      start: new Date('2024-03-21T10:00:00Z'),
      end: new Date('2024-03-21T11:00:00Z'),
      allDay: false,
      description: 'Offline Description',
      location: 'Offline Location',
      attendees: ['offline@example.com'],
    };

    await act(async () => {
      await result.current.createEvent(newEvent);
    });

    // Should not call API in offline mode
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('should handle pagination', async () => {
    const { result } = renderHook(() => useCalendar({ pageSize: 10 }));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(apiClient.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
  });

  it('should handle errors gracefully', async () => {
    // Mock API error
    (apiClient.get as any).mockRejectedValue(new Error('API Error'));

    const { result } = renderHook(() => useCalendar());

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  it('should auto-sync when coming online', async () => {
    let isOnline = false;
    
    // Mock network status with ability to change
    vi.mock('@/hooks/use-network', () => ({
      useNetwork: () => ({
        isOnline,
      }),
    }));

    const { result, rerender } = renderHook(() => useCalendar({ autoSync: true }));

    // Change to online
    isOnline = true;
    rerender();

    // Wait for sync
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(apiClient.get).toHaveBeenCalled();
  });
}); 