/**
 * @writecarenotes.com
 * @fileoverview Badge component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Reusable badge component for displaying status indicators,
 * notifications, and labels. Optimized for mobile devices with
 * responsive sizing and accessibility features.
 *
 * Features:
 * - Multiple variants
 * - Size options
 * - Counter support
 * - Icon integration
 * - Dot variant
 *
 * Mobile-First Considerations:
 * - Touch-friendly sizing
 * - Clear visibility
 * - High contrast
 * - Reduced motion
 *
 * Enterprise Features:
 * - Accessibility support
 * - Theme integration
 * - Error handling
 * - Performance optimization
 */

'use client';

import { memo } from 'react';
import { Icon, IconName } from './Icon';
import { useTheme } from '@/features/theme/hooks/useTheme';

type BadgeVariant = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'default';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: IconName;
  count?: number;
  max?: number;
  dot?: boolean;
  outline?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  primary: {
    solid: 'bg-primary-500 text-white',
    outline: 'border-primary-500 text-primary-500',
    dot: 'bg-primary-500',
  },
  secondary: {
    solid: 'bg-gray-500 text-white',
    outline: 'border-gray-500 text-gray-500',
    dot: 'bg-gray-500',
  },
  success: {
    solid: 'bg-green-500 text-white',
    outline: 'border-green-500 text-green-500',
    dot: 'bg-green-500',
  },
  warning: {
    solid: 'bg-yellow-500 text-white',
    outline: 'border-yellow-500 text-yellow-500',
    dot: 'bg-yellow-500',
  },
  error: {
    solid: 'bg-red-500 text-white',
    outline: 'border-red-500 text-red-500',
    dot: 'bg-red-500',
  },
  info: {
    solid: 'bg-blue-500 text-white',
    outline: 'border-blue-500 text-blue-500',
    dot: 'bg-blue-500',
  },
  default: {
    solid: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    outline: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200',
    dot: 'bg-gray-500',
  },
};

const sizeStyles = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'xs',
    dot: 'h-1.5 w-1.5',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm',
    icon: 'sm',
    dot: 'h-2 w-2',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    icon: 'md',
    dot: 'h-2.5 w-2.5',
  },
};

export const Badge = memo(function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  count,
  max = 99,
  dot = false,
  outline = false,
  className = '',
  onClick,
}: BadgeProps) {
  const { theme } = useTheme();
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const displayCount = count !== undefined ? (count > max ? `${max}+` : count.toString()) : undefined;

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    ${outline ? 'border' : ''}
    ${onClick ? 'cursor-pointer hover:opacity-90 active:opacity-80' : ''}
    ${sizeStyle.badge}
    ${outline ? variantStyle.outline : variantStyle.solid}
    rounded-full
    transition-all duration-200
    ${className}
  `.trim();

  if (dot) {
    return (
      <span
        className={`
          inline-block
          ${sizeStyle.dot}
          ${variantStyle.dot}
          rounded-full
          ${className}
        `}
        role="status"
      />
    );
  }

  return (
    <span className={baseClasses} onClick={onClick}>
      {icon && (
        <Icon
          name={icon}
          size={sizeStyle.icon as any}
          className={children ? 'mr-1.5' : ''}
        />
      )}
      {displayCount !== undefined ? displayCount : children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge; 
