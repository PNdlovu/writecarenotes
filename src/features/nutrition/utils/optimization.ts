import { useCallback, useEffect, useMemo, useRef } from 'react'
import { debounce, throttle } from 'lodash'

// Debounce hook for input handling
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      debouncedFn.cancel()
    }
  }, [debouncedFn])

  return debouncedFn as T
}

// Throttle hook for frequent updates
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const throttledFn = useMemo(
    () => throttle(callback, limit),
    [callback, limit]
  )

  useEffect(() => {
    return () => {
      throttledFn.cancel()
    }
  }, [throttledFn])

  return throttledFn as T
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback()
      }
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [callback, options])

  return ref
}

// Memoized selector for complex data transformations
export function createSelector<State, Props, Result>(
  selectors: ((state: State, props: Props) => any)[],
  combiner: (...args: any[]) => Result
) {
  let lastArgs: any[] | null = null
  let lastResult: Result | null = null

  return (state: State, props: Props): Result => {
    const newArgs = selectors.map(selector => selector(state, props))

    if (
      lastArgs &&
      newArgs.length === lastArgs.length &&
      newArgs.every((arg, index) => arg === lastArgs![index])
    ) {
      return lastResult!
    }

    const newResult = combiner(...newArgs)
    lastArgs = newArgs
    lastResult = newResult

    return newResult
  }
}

// Virtual list renderer for large lists
export function useVirtualList<T>({
  items,
  rowHeight,
  visibleRows
}: {
  items: T[]
  rowHeight: number
  visibleRows: number
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const totalHeight = items.length * rowHeight
  const startIndex = Math.floor(scrollTop / rowHeight)
  const endIndex = Math.min(
    startIndex + visibleRows + 1,
    items.length
  )

  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * rowHeight

  const onScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(event.currentTarget.scrollTop)
    },
    []
  )

  return {
    containerRef,
    onScroll,
    visibleItems,
    totalHeight,
    offsetY
  }
}

// Batch update manager for optimizing state updates
export class BatchUpdateManager {
  private updates: Map<string, any>
  private timeoutId: NodeJS.Timeout | null

  constructor(private batchTime: number = 16) {
    this.updates = new Map()
    this.timeoutId = null
  }

  queueUpdate(key: string, value: any) {
    this.updates.set(key, value)

    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.processUpdates()
      }, this.batchTime)
    }
  }

  private processUpdates() {
    const updates = Array.from(this.updates.entries())
    this.updates.clear()
    this.timeoutId = null

    // Process all updates in a single batch
    if (updates.length > 0) {
      this.applyUpdates(updates)
    }
  }

  private applyUpdates(updates: [string, any][]) {
    // Override this method to handle updates
    console.log('Processing updates:', updates)
  }
}

// Memory cache for expensive computations
export class ComputationCache<K, V> {
  private cache: Map<K, { value: V; timestamp: number }>
  private maxSize: number
  private ttl: number

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  set(key: K, value: V): void {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0]
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

// Image optimization utilities
export const imageOptimization = {
  getOptimalSize(
    containerWidth: number,
    containerHeight: number,
    imageWidth: number,
    imageHeight: number
  ): { width: number; height: number } {
    const ratio = Math.min(
      containerWidth / imageWidth,
      containerHeight / imageHeight
    )

    return {
      width: Math.round(imageWidth * ratio),
      height: Math.round(imageHeight * ratio)
    }
  },

  generateSrcSet(
    src: string,
    sizes: number[]
  ): string {
    return sizes
      .map(size => `${src}?w=${size} ${size}w`)
      .join(', ')
  }
}

// Bundle size optimization utilities
export const bundleOptimization = {
  async loadComponent(
    importFn: () => Promise<any>
  ): Promise<any> {
    try {
      const module = await importFn()
      return module.default || module
    } catch (error) {
      console.error('Failed to load component:', error)
      throw error
    }
  },

  prefetchComponent(
    importFn: () => Promise<any>
  ): void {
    // Prefetch component in idle time
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        importFn()
      })
    } else {
      setTimeout(() => {
        importFn()
      }, 0)
    }
  }
}
