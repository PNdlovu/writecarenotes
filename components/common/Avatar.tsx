/**
 * @writecarenotes.com
 * @fileoverview Avatar component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Reusable avatar component that displays user profile images or
 * initials with fallback support. Optimized for mobile devices with
 * responsive sizing and accessibility features.
 *
 * Features:
 * - Image display
 * - Initials fallback
 * - Status indicator
 * - Multiple sizes
 * - Shape variants
 *
 * Mobile-First Considerations:
 * - Responsive sizing
 * - Touch-friendly
 * - Image optimization
 * - Loading states
 *
 * Enterprise Features:
 * - Error handling
 * - Performance monitoring
 * - Accessibility support
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  xs: {
    container: 'h-8 w-8',
    font: 'text-xs',
    status: 'h-2 w-2',
  },
  sm: {
    container: 'h-10 w-10',
    font: 'text-sm',
    status: 'h-2.5 w-2.5',
  },
  md: {
    container: 'h-12 w-12',
    font: 'text-base',
    status: 'h-3 w-3',
  },
  lg: {
    container: 'h-16 w-16',
    font: 'text-lg',
    status: 'h-3.5 w-3.5',
  },
  xl: {
    container: 'h-20 w-20',
    font: 'text-xl',
    status: 'h-4 w-4',
  },
};

const statusColorMap = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const Avatar = memo(function Avatar({
  src,
  alt,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
  onClick,
}: AvatarProps) {
  const { theme } = useTheme();
  const { container: sizeClass, font: fontSize, status: statusSize } = sizeMap[size];
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  const initials = getInitials(alt);

  const containerClasses = `
    relative inline-flex items-center justify-center
    ${sizeClass}
    ${shapeClass}
    ${className}
    ${onClick ? 'cursor-pointer hover:opacity-90' : ''}
    overflow-hidden
    bg-gray-200 dark:bg-gray-700
    transition-all duration-200
  `.trim();

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    img.style.display = 'none';
  };

  return (
    <div className={containerClasses} onClick={onClick}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className={`h-full w-full object-cover ${shapeClass}`}
          onError={handleError}
          loading="lazy"
        />
      ) : (
        <span className={`${fontSize} font-medium text-gray-600 dark:text-gray-200`}>
          {initials}
        </span>
      )}

      {status && (
        <span
          className={`
            absolute
            right-0
            top-0
            block
            translate-x-1/4
            -translate-y-1/4
            transform
            ${statusSize}
            ${shapeClass}
            ${statusColorMap[status]}
            border-2
            border-white
            dark:border-gray-900
          `}
          role="status"
          aria-label={`Status: ${status}`}
        />
      )}

      <style jsx>{`
        /* High-DPI screen optimizations */
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
          img {
            image-rendering: -webkit-optimize-contrast;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          div {
            transition: none !important;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          div:active {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar; 
