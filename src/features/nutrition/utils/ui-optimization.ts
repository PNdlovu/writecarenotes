import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { debounce, throttle } from 'lodash'

// Window size observer with resize optimization
export function useWindowSize() {
  const [size, setSize] = useState({
    width: 0,
    height: 0
  })

  const updateSize = useCallback(
    throttle(() => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }, 100),
    []
  )

  useLayoutEffect(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  return size
}

// Optimized scroll position tracker
export function useScrollPosition(
  element?: React.RefObject<HTMLElement>
) {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0
  })

  const updatePosition = useCallback(
    throttle(() => {
      const target = element?.current || window
      const x = 'scrollX' in target ? target.scrollX : target.scrollLeft
      const y = 'scrollY' in target ? target.scrollY : target.scrollTop

      setScrollPosition({ x, y })
    }, 100),
    [element]
  )

  useEffect(() => {
    const target = element?.current || window
    target.addEventListener('scroll', updatePosition)
    return () => target.removeEventListener('scroll', updatePosition)
  }, [element, updatePosition])

  return scrollPosition
}

// Optimized form input handler
export function useFormInput(initialValue: string) {
  const [value, setValue] = useState(initialValue)
  const [isDirty, setIsDirty] = useState(false)

  const debouncedSetValue = useMemo(
    () =>
      debounce((value: string) => {
        setValue(value)
        setIsDirty(true)
      }, 300),
    []
  )

  useEffect(() => {
    return () => {
      debouncedSetValue.cancel()
    }
  }, [debouncedSetValue])

  return {
    value,
    isDirty,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetValue(e.target.value)
    },
    reset: () => {
      setValue(initialValue)
      setIsDirty(false)
    }
  }
}

// Intersection observer for lazy loading
export function useLazyLoad(
  options: IntersectionObserverInit = {}
) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting)
    }, options)

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return { elementRef, isVisible }
}

// Virtual list renderer
export function useVirtualList<T>({
  items,
  rowHeight,
  containerHeight,
  overscan = 3
}: {
  items: T[]
  rowHeight: number
  containerHeight: number
  overscan?: number
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / rowHeight)
  const totalHeight = items.length * rowHeight
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / rowHeight) - overscan
  )
  const endIndex = Math.min(
    items.length,
    startIndex + visibleCount + 2 * overscan
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * rowHeight

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    },
    []
  )

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll
  }
}

// RAF-based animation frame scheduler
export function useAnimationFrame(callback: () => void) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  const animate = useCallback(
    (time: number) => {
      if (previousTimeRef.current !== undefined) {
        callback()
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    },
    [callback]
  )

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])
}

// Optimized context value memoization
export function useMemoizedContext<T extends object>(value: T): T {
  return useMemo(
    () => value,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    Object.values(value)
  )
}

// Optimized event listener with cleanup
export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element: HTMLElement | Window = window,
  options?: AddEventListenerOptions
) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const isSupported = element && element.addEventListener
    if (!isSupported) return

    const eventListener = (event: Event) =>
      savedHandler.current(event)
    element.addEventListener(eventName, eventListener, options)

    return () => {
      element.removeEventListener(
        eventName,
        eventListener,
        options
      )
    }
  }, [eventName, element, options])
}

// Optimized media query hook
export function useMedia(queries: string[], values: any[], defaultValue: any) {
  const mediaQueryLists = useMemo(
    () => queries.map(q => window.matchMedia(q)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const getValue = useCallback(() => {
    const index = mediaQueryLists.findIndex(mql => mql.matches)
    return values[index] || defaultValue
  }, [mediaQueryLists, values, defaultValue])

  const [value, setValue] = useState(getValue)

  useEffect(() => {
    const handler = () => setValue(getValue)
    mediaQueryLists.forEach(mql => {
      mql.addListener(handler)
    })
    return () =>
      mediaQueryLists.forEach(mql => {
        mql.removeListener(handler)
      })
  }, [getValue, mediaQueryLists])

  return value
}

// Optimized resize observer
export function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const resizeObserver = new ResizeObserver(
      throttle(entries => {
        if (!entries.length) return

        const { width, height } = entries[0].contentRect
        setDimensions({ width, height })
      }, 100)
    )

    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [ref])

  return dimensions
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function execution
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    return debounce(func, wait) as T
  },

  // Throttle function execution
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T => {
    return throttle(func, wait) as T
  },

  // Measure component render time
  measureRenderTime: (Component: React.ComponentType<any>) => {
    return function WrappedComponent(props: any) {
      const startTime = performance.now()

      useEffect(() => {
        const endTime = performance.now()
        console.log(
          `Render time for ${
            Component.name
          }: ${endTime - startTime}ms`
        )
      })

      return <Component {...props} />
    }
  }
}

// Image optimization utilities
export const imageOptimization = {
  // Calculate optimal image dimensions
  calculateDimensions: (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ) => {
    const ratio = Math.min(
      maxWidth / originalWidth,
      maxHeight / originalHeight
    )
    return {
      width: Math.round(originalWidth * ratio),
      height: Math.round(originalHeight * ratio)
    }
  },

  // Generate srcset attribute
  generateSrcSet: (src: string, sizes: number[]) => {
    return sizes
      .map(size => `${src}?w=${size} ${size}w`)
      .join(', ')
  }
}
