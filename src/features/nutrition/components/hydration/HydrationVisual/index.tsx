import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type HydrationVisualProps } from './types'
import { LiquidUnit, type VisualContainer } from '../../../types/hydration'

export const HydrationVisual: React.FC<HydrationVisualProps> = ({
  container,
  currentAmount,
  animate = true,
  interactive = true,
  onAmountChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [fillLevel, setFillLevel] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)

  // Convert amount to percentage
  const calculateFillPercentage = (amount: number): number => {
    return Math.min(Math.max((amount / container.capacity) * 100, 0), 100)
  }

  // Convert percentage to amount
  const calculateAmount = (percentage: number): number => {
    return (percentage / 100) * container.capacity
  }

  // Update fill level when amount changes
  useEffect(() => {
    setFillLevel(calculateFillPercentage(currentAmount))
  }, [currentAmount, container.capacity])

  // Handle interactive filling
  const handleInteraction = (event: React.MouseEvent | React.TouchEvent) => {
    if (!interactive || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    
    // Calculate percentage from bottom
    const percentage = Math.min(Math.max(
      ((containerRect.bottom - clientY) / containerRect.height) * 100,
      0
    ), 100)

    setFillLevel(percentage)
    onAmountChange?.(calculateAmount(percentage))
  }

  // Liquid wave animation
  const waveVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{
        height: container.dimensions.height,
        width: container.dimensions.width,
      }}
      onMouseDown={() => interactive && setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={(e) => isDragging && handleInteraction(e)}
      onTouchStart={() => interactive && setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={(e) => isDragging && handleInteraction(e)}
    >
      {/* Container Visualization */}
      <div 
        className="absolute inset-0 rounded-lg border-2 border-gray-300 overflow-hidden"
        style={{
          backgroundColor: container.emptyColor,
        }}
      >
        {/* Liquid Fill */}
        <AnimatePresence>
          <motion.div
            initial={animate ? { height: '0%' } : { height: `${fillLevel}%` }}
            animate={{ height: `${fillLevel}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute bottom-0 w-full"
            style={{
              backgroundColor: container.fillColor,
              borderTopLeftRadius: '100%',
              borderTopRightRadius: '100%',
              filter: 'brightness(1.1)',
            }}
          >
            {/* Liquid Wave Effect */}
            <motion.div
              variants={waveVariants}
              initial="initial"
              animate="animate"
              className="absolute -top-2 left-0 w-full h-4"
              style={{
                backgroundColor: container.fillColor,
                borderTopLeftRadius: '100%',
                borderTopRightRadius: '100%',
                filter: 'brightness(1.2)',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Measurement Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2">
          {[4, 3, 2, 1].map((line) => (
            <div
              key={line}
              className="w-full flex items-center gap-1"
            >
              <div className="w-2 h-px bg-gray-400" />
              <span className="text-xs text-gray-500">
                {Math.round((container.capacity / 4) * line)}
                {container.unit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Amount Label */}
      <div className="absolute -right-20 top-1/2 transform -translate-y-1/2">
        <span className="text-sm font-medium">
          {Math.round(currentAmount)}
          {container.unit}
        </span>
      </div>

      {/* Interactive Instructions */}
      {interactive && (
        <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
          Drag to adjust
        </div>
      )}
    </div>
  )
}

export default HydrationVisual
