'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { generatePlaceholderDataUrl } from '@/lib/utils'

interface PlaceholderImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export function PlaceholderImage({
  src,
  alt,
  width = 400,
  height = 400,
  className,
  style,
}: PlaceholderImageProps) {
  const [error, setError] = useState(false)
  const [placeholderUrl, setPlaceholderUrl] = useState<string>('')

  useEffect(() => {
    setPlaceholderUrl(generatePlaceholderDataUrl(width, height, 'No Image'))
  }, [width, height])

  if (error || !src) {
    return (
      <div
        className={className}
        style={{
          backgroundImage: `url("${placeholderUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: width,
          height: height,
          ...style,
        }}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={() => setError(true)}
    />
  )
}
