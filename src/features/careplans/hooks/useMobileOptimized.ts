import { useEffect, useState, useCallback } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface TouchGesture {
  startX: number
  startY: number
  moveX: number
  moveY: number
}

interface MobileOptimizedOptions {
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
  }
  enableSwipe?: boolean
  swipeThreshold?: number
}

const defaultBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
}

export function useMobileOptimized(options: MobileOptimizedOptions = {}) {
  const {
    breakpoints = defaultBreakpoints,
    enableSwipe = true,
    swipeThreshold = 50,
  } = options

  const [gesture, setGesture] = useState<TouchGesture>({
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0,
  })

  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm}px)`)
  const isTablet = useMediaQuery(
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md}px)`
  )
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.lg}px)`)

  // Optimize layout based on screen size
  const getOptimizedLayout = useCallback(() => {
    if (isMobile) {
      return {
        gridColumns: 1,
        spacing: 2,
        padding: 2,
        fontSize: 'sm',
        buttonSize: 'lg', // Larger touch targets on mobile
        showLabels: false, // Hide labels on mobile to save space
      }
    }
    if (isTablet) {
      return {
        gridColumns: 2,
        spacing: 3,
        padding: 3,
        fontSize: 'base',
        buttonSize: 'md',
        showLabels: true,
      }
    }
    return {
      gridColumns: 3,
      spacing: 4,
      padding: 4,
      fontSize: 'base',
      buttonSize: 'md',
      showLabels: true,
    }
  }, [isMobile, isTablet])

  // Touch gesture handlers
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enableSwipe) return
      const touch = e.touches[0]
      setGesture({
        startX: touch.clientX,
        startY: touch.clientY,
        moveX: 0,
        moveY: 0,
      })
    },
    [enableSwipe]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enableSwipe) return
      const touch = e.touches[0]
      setGesture((prev) => ({
        ...prev,
        moveX: touch.clientX - prev.startX,
        moveY: touch.clientY - prev.startY,
      }))
    },
    [enableSwipe]
  )

  const handleTouchEnd = useCallback(() => {
    if (!enableSwipe) return
    const isHorizontalSwipe = Math.abs(gesture.moveX) > Math.abs(gesture.moveY)
    if (isHorizontalSwipe && Math.abs(gesture.moveX) > swipeThreshold) {
      // Emit swipe event
      const event = new CustomEvent('swipe', {
        detail: {
          direction: gesture.moveX > 0 ? 'right' : 'left',
          distance: Math.abs(gesture.moveX),
        },
      })
      window.dispatchEvent(event)
    }
    setGesture({ startX: 0, startY: 0, moveX: 0, moveY: 0 })
  }, [enableSwipe, gesture, swipeThreshold])

  // Performance optimizations for mobile
  const optimizeForMobile = useCallback(() => {
    if (isMobile) {
      // Disable hover effects on mobile
      document.body.classList.add('mobile-device')
      
      // Use passive event listeners for better scroll performance
      document.addEventListener('touchstart', handleTouchStart, { passive: true })
      document.addEventListener('touchmove', handleTouchMove, { passive: true })
      document.addEventListener('touchend', handleTouchEnd, { passive: true })

      // Optimize images for mobile
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        if (!img.loading) img.loading = 'lazy'
        if (!img.decoding) img.decoding = 'async'
      })

      return () => {
        document.body.classList.remove('mobile-device')
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd])

  useEffect(() => {
    return optimizeForMobile()
  }, [optimizeForMobile])

  return {
    isMobile,
    isTablet,
    isDesktop,
    layout: getOptimizedLayout(),
    gesture: enableSwipe ? gesture : null,
  }
}


