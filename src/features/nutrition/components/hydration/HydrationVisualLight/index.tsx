import React, { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { type HydrationVisualProps } from './types'

export const HydrationVisualLight: React.FC<HydrationVisualProps> = ({
  container,
  currentAmount,
  interactive = true,
  onAmountChange,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveControls = useAnimation()
  const [isDragging, setIsDragging] = React.useState(false)
  const [fillLevel, setFillLevel] = React.useState(0)

  // Calculate fill percentage
  useEffect(() => {
    const percentage = Math.min(Math.max((currentAmount / container.capacity) * 100, 0), 100)
    setFillLevel(percentage)
  }, [currentAmount, container.capacity])

  // Animate wave effect
  useEffect(() => {
    waveControls.start({
      x: [-20, 20, -20],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  }, [waveControls])

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
    onAmountChange?.((percentage / 100) * container.capacity)
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
      {/* Container */}
      <div 
        className="absolute inset-0 rounded-lg border-2 transition-colors duration-200"
        style={{
          backgroundColor: container.emptyColor,
          borderColor: `${container.fillColor}33`,
        }}
      >
        {/* Liquid Fill */}
        <div
          className="absolute bottom-0 w-full transition-all duration-300 ease-out overflow-hidden"
          style={{
            height: `${fillLevel}%`,
            backgroundColor: container.fillColor,
            borderTopLeftRadius: '100%',
            borderTopRightRadius: '100%',
          }}
        >
          {/* Wave Effect */}
          <motion.div
            animate={waveControls}
            className="absolute -top-2 left-0 w-[120%] -ml-[10%]"
          >
            <svg
              className="w-full"
              viewBox="0 0 120 8"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="wave-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={`${container.fillColor}66`} />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M 0 4 Q 15 0, 30 4 T 60 4 T 90 4 T 120 4 V 8 H 0 Z"
                fill="url(#wave-gradient)"
              />
            </svg>
          </motion.div>

          {/* Shine Effect */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              background: `linear-gradient(
                180deg,
                ${container.fillColor}55 0%,
                transparent 50%,
                ${container.fillColor}33 100%
              )`
            }}
          />
        </div>

        {/* Measurement Lines */}
        <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
          {[4, 3, 2, 1].map((line) => (
            <div
              key={line}
              className="flex items-center gap-1"
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
      <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <span className="text-sm font-medium">
          {Math.round(currentAmount)}
          {container.unit}
        </span>
      </div>

      {/* Interactive Instructions */}
      {interactive && (
        <div className="absolute -left-24 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
          Drag to adjust
        </div>
      )}

      {/* Container Label */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 pointer-events-none">
        {container.type}
      </div>
    </div>
  )
}

export default HydrationVisualLight
