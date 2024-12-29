import { useEffect, useCallback, useState, useRef } from 'react';
import { PerformanceOptimizations } from '../services/performance-optimizations';
import { HandoverTask, HandoverSession } from '../types/handover';

export function usePerformanceOptimizations() {
  const optimizations = PerformanceOptimizations.getInstance();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const batchTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Optimized data fetching with caching
   */
  const fetchWithCache = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    try {
      // Check cache first
      const cached = await optimizations.getCached<T>(key);
      if (cached) return cached;

      // Fetch fresh data
      const data = await fetchFn();
      
      // Cache the result
      await optimizations.setCache(key, data);
      
      return data;
    } catch (error) {
      console.error('Error in fetchWithCache:', error);
      throw error;
    }
  }, []);

  /**
   * Batched updates
   */
  const batchUpdate = useCallback(<T>(
    batchKey: string,
    item: T,
    delay: number = 1000
  ): void => {
    // Clear existing timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    // Add item to batch
    optimizations.addToBatch(batchKey, item);

    // Set new timeout for processing
    batchTimeoutRef.current = setTimeout(() => {
      setIsOptimizing(true);
      // Batch processing is handled by the service
      setIsOptimizing(false);
    }, delay);
  }, []);

  /**
   * Optimize handover session data
   */
  const optimizeSession = useCallback(async (
    session: HandoverSession
  ): Promise<HandoverSession> => {
    setIsOptimizing(true);
    try {
      return await optimizations.optimizeHandoverSession(session);
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOptimizing,
    fetchWithCache,
    batchUpdate,
    optimizeSession,
  };
}
