import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { type HydrationVisualProps } from './HydrationVisualLight/types'

const HydrationVisualLight = dynamic(
  () => import('./HydrationVisualLight'),
  { ssr: false }
)

const HydrationVisual3D = dynamic(
  () => import('./HydrationVisual3D'),
  { 
    ssr: false,
    loading: () => <HydrationVisualLight {...defaultProps} />
  }
)

const defaultProps: HydrationVisualProps = {
  container: {
    type: 'Loading',
    capacity: 100,
    unit: 'ml',
    dimensions: { height: 200, width: 100 },
    fillColor: '#60A5FA',
    emptyColor: '#F3F4F6'
  },
  currentAmount: 0,
  interactive: false
}

interface DeviceCapabilities {
  supportsWebGL: boolean
  hasGoodPerformance: boolean
  preferReducedMotion: boolean
}

const checkDeviceCapabilities = (): DeviceCapabilities => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl')
  
  return {
    supportsWebGL: !!gl,
    hasGoodPerformance: !!(navigator.hardwareConcurrency && navigator.hardwareConcurrency >= 4),
    preferReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}

export const HydrationVisualDynamic: React.FC<HydrationVisualProps> = (props) => {
  const [use3D, setUse3D] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const capabilities = checkDeviceCapabilities()
    const should3D = capabilities.supportsWebGL && 
                    capabilities.hasGoodPerformance && 
                    !capabilities.preferReducedMotion

    setUse3D(should3D)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return <HydrationVisualLight {...defaultProps} />
  }

  return use3D ? (
    <HydrationVisual3D {...props} />
  ) : (
    <HydrationVisualLight {...props} />
  )
}

export default HydrationVisualDynamic
