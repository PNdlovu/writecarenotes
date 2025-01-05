/**
 * @writecarenotes.com
 * @fileoverview Custom hooks for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom React hooks for the domiciliary care module, providing
 * reusable logic for visit management, staff coordination, and
 * offline capabilities.
 *
 * Features:
 * - Visit management hooks
 * - Staff coordination hooks
 * - Location tracking hooks
 * - Offline sync hooks
 * - Performance monitoring
 *
 * Mobile-First Considerations:
 * - Battery-efficient updates
 * - Network state handling
 * - Location services
 * - Device capabilities
 * - Touch interactions
 *
 * Enterprise Features:
 * - Error handling
 * - Performance monitoring
 * - Audit logging
 * - Security validation
 * - Regional compliance
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { type Visit, type VisitTask, type AssignedStaff, type GeoLocation } from '../types';
import { 
  VisitService,
  StaffService,
  ComplianceService,
  TaskService 
} from '../services';
import { 
  isLocationAccurate,
  measureResponseTime,
  isPerformanceCritical,
  generateAuditTrail
} from '../utils';
import { MOBILE_CONFIG, PERFORMANCE } from '../constants';

// Visit Management Hooks
export function useVisit(visitId: string) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const visitService = VisitService.getInstance();

  const fetchVisit = useCallback(async () => {
    try {
      setLoading(true);
      const data = await visitService.getVisit(visitId);
      setVisit(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    fetchVisit();
  }, [fetchVisit]);

  const updateVisit = useCallback(async (updates: Partial<Visit>) => {
    try {
      const updatedVisit = await visitService.updateVisit(visitId, updates);
      setVisit(updatedVisit);
      return updatedVisit;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [visitId]);

  return { visit, loading, error, updateVisit, refetch: fetchVisit };
}

export function useVisitList(filters: {
  startDate?: string;
  endDate?: string;
  status?: string[];
  staffId?: string;
  clientId?: string;
}) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const visitService = VisitService.getInstance();

  const fetchVisits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await visitService.listVisits(filters);
      setVisits(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  return { visits, loading, error, refetch: fetchVisits };
}

// Staff Management Hooks
export function useStaffAssignment(visitId: string) {
  const [staff, setStaff] = useState<AssignedStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const staffService = StaffService.getInstance();

  const assignStaff = useCallback(async (
    newStaff: Omit<AssignedStaff, 'checkedIn' | 'checkedOut'>
  ) => {
    try {
      setLoading(true);
      const assigned = await staffService.assignStaff(visitId, newStaff);
      setStaff(prev => [...prev, assigned]);
      return assigned;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  const updateStatus = useCallback(async (
    staffId: string,
    status: AssignedStaff['status']
  ) => {
    try {
      setLoading(true);
      const updated = await staffService.updateStaffStatus(visitId, staffId, status);
      setStaff(prev => 
        prev.map(s => s.id === staffId ? updated : s)
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  return { staff, loading, error, assignStaff, updateStatus };
}

// Location Tracking Hooks
export function useLocationTracking(options = { 
  highAccuracy: true,
  interval: 30000 // 30 seconds
}) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const watchId = useRef<number | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError(new Error('Geolocation is not supported'));
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: GeoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };

        if (isLocationAccurate(newLocation)) {
          setLocation(newLocation);
          generateAuditTrail('LOCATION_UPDATE', newLocation);
        }
      },
      (err) => {
        setError(new Error(err.message));
      },
      {
        enableHighAccuracy: options.highAccuracy,
        timeout: INTEGRATION_TIMEOUTS.DEFAULT,
        maximumAge: options.interval
      }
    );
  }, [options]);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  return { location, error, isTracking: watchId.current !== null };
}

// Task Management Hooks
export function useTaskManagement(visitId: string) {
  const [tasks, setTasks] = useState<VisitTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const taskService = TaskService.getInstance();

  const updateTask = useCallback(async (
    taskId: string,
    updates: Partial<VisitTask>
  ) => {
    try {
      setLoading(true);
      const updated = await taskService.updateTask(visitId, taskId, updates);
      setTasks(prev => 
        prev.map(t => t.id === taskId ? updated : t)
      );
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  const completeTask = useCallback(async (
    taskId: string,
    notes?: string
  ) => {
    try {
      setLoading(true);
      const completed = await taskService.completeTask(visitId, taskId, notes);
      setTasks(prev => 
        prev.map(t => t.id === taskId ? completed : t)
      );
      return completed;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  return { tasks, loading, error, updateTask, completeTask };
}

// Performance Monitoring Hooks
export function usePerformanceMonitoring(operationName: string) {
  const [metrics, setMetrics] = useState<{
    duration: number;
    timestamp: string;
  }[]>([]);

  const addMetric = useCallback((duration: number) => {
    setMetrics(prev => [
      ...prev,
      { duration, timestamp: new Date().toISOString() }
    ]);

    if (isPerformanceCritical(duration)) {
      console.warn(`Performance critical for ${operationName}:`, duration);
      generateAuditTrail('PERFORMANCE_CRITICAL', {
        operation: operationName,
        duration
      });
    }
  }, [operationName]);

  const measureOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    const { result, duration } = await measureResponseTime(operation);
    addMetric(duration);
    return result;
  }, [addMetric]);

  return { metrics, measureOperation };
}

// Offline Sync Hooks
export function useOfflineSync<T>(
  key: string,
  syncOperation: (data: T) => Promise<void>
) {
  const [pendingSync, setPendingSync] = useState<T[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const addToPendingSync = useCallback((data: T) => {
    setPendingSync(prev => [...prev, data]);
    localStorage.setItem(key, JSON.stringify(pendingSync));
  }, [key, pendingSync]);

  const sync = useCallback(async () => {
    if (syncing || pendingSync.length === 0) return;

    try {
      setSyncing(true);
      for (const data of pendingSync) {
        await syncOperation(data);
      }
      setPendingSync([]);
      localStorage.removeItem(key);
    } catch (err) {
      setError(err as Error);
    } finally {
      setSyncing(false);
    }
  }, [key, pendingSync, syncOperation, syncing]);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      setPendingSync(JSON.parse(stored));
    }
  }, [key]);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (navigator.onLine) {
        sync();
      }
    }, MOBILE_CONFIG.OFFLINE_SYNC.RETRY_INTERVAL);

    return () => clearInterval(syncInterval);
  }, [sync]);

  return { pendingSync, syncing, error, addToPendingSync, sync };
} 