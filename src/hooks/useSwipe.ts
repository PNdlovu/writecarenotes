/**
 * @writecarenotes.com
 * @fileoverview Swipe Gesture Hook
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom hook for handling swipe gestures on mobile devices.
 * Provides touch event handlers and gesture detection for mobile interactions.
 */

import { useState, useCallback } from 'react';

interface SwipeConfig {
  minSwipeDistance?: number;
  maxSwipeTime?: number;
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface SwipeResult {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  duration: number;
}

interface UseSwipeReturn {
  swipeHandlers: SwipeHandlers;
  swipeResult: SwipeResult | null;
  resetSwipe: () => void;
}

const defaultConfig: Required<SwipeConfig> = {
  minSwipeDistance: 50, // minimum distance for a swipe
  maxSwipeTime: 300, // maximum time for a swipe in ms
};

export function useSwipe(config: SwipeConfig = {}): UseSwipeReturn {
  const { minSwipeDistance, maxSwipeTime } = { ...defaultConfig, ...config };

  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const [swipeResult, setSwipeResult] = useState<SwipeResult | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setSwipeResult(null);
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;

      // Prevent vertical scrolling if horizontal swipe is detected
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance / 2) {
        e.preventDefault();
      }
    },
    [touchStart, minSwipeDistance]
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const duration = Date.now() - touchStart.time;

      // Check if swipe is valid
      if (duration <= maxSwipeTime) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (Math.max(absX, absY) >= minSwipeDistance) {
          let direction: SwipeResult['direction'] = null;

          // Determine swipe direction
          if (absX > absY) {
            direction = deltaX > 0 ? 'right' : 'left';
          } else {
            direction = deltaY > 0 ? 'down' : 'up';
          }

          setSwipeResult({
            direction,
            distance: Math.max(absX, absY),
            duration,
          });
        }
      }

      setTouchStart(null);
    },
    [touchStart, minSwipeDistance, maxSwipeTime]
  );

  const resetSwipe = useCallback(() => {
    setSwipeResult(null);
    setTouchStart(null);
  }, []);

  return {
    swipeHandlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    swipeResult,
    resetSwipe,
  };
} 