/**
 * @writecarenotes.com
 * @fileoverview Button component
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Reusable button component with multiple variants, sizes, and states.
 * Optimized for mobile devices with touch-friendly sizing and
 * accessibility features.
 *
 * Features:
 * - Multiple variants
 * - Size options
 * - Loading state
 * - Icon support
 * - Full width option
 *
 * Mobile-First Considerations:
 * - Touch-friendly sizing
 * - Clear feedback states
 * - Loading indicators
 * - Reduced motion
 *
 * Enterprise Features:
 * - Accessibility support
 * - Theme integration
 * - Error handling
 * - Analytics tracking
 */

'use client';

import { memo, forwardRef } from 'react';
import { Icon, IconName } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '@/hooks/useTheme';
import { useAnalytics } from '@/hooks/useAnalytics';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  href?: string;
  analyticsEvent?: string;
}

const variantStyles = {
  primary: {
    base: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    disabled: 'bg-primary-300 text-white cursor-not-allowed',
  },
  secondary: {
    base: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    disabled: 'bg-gray-300 text-white cursor-not-allowed',
  },
  success: {
    base: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500',
    disabled: 'bg-green-300 text-white cursor-not-allowed',
  },
  warning: {
    base: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500',
    disabled: 'bg-yellow-300 text-white cursor-not-allowed',
  },
  error: {
    base: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    disabled: 'bg-red-300 text-white cursor-not-allowed',
  },
  ghost: {
    base: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 focus:ring-gray-500',
    disabled: 'bg-transparent text-gray-400 cursor-not-allowed',
  },
  link: {
    base: 'bg-transparent text-primary-500 hover:text-primary-600 hover:underline focus:ring-primary-500',
    disabled: 'text-gray-400 cursor-not-allowed',
  },
};

const sizeStyles = {
  sm: {
    padding: 'px-3 py-1.5',
    text: 'text-sm',
    icon: 'sm',
    height: 'h-8',
  },
  md: {
    padding: 'px-4 py-2',
    text: 'text-base',
    icon: 'md',
    height: 'h-10',
  },
  lg: {
    padding: 'px-6 py-3',
    text: 'text-lg',
    icon: 'lg',
    height: 'h-12',
  },
};

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    href,
    analyticsEvent,
    disabled,
    className = '',
    onClick,
    ...props
  },
  ref
) {
  const { theme } = useTheme();
  const { trackEvent } = useAnalytics();
  const isDisabled = disabled || loading;

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    if (analyticsEvent) {
      trackEvent(analyticsEvent, {
        variant,
        size,
        disabled: isDisabled,
      });
    }

    if (href) {
      window.location.href = href;
    }

    onClick?.(e);
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium
    rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2
    transition-all duration-200
    ${sizeStyle.padding}
    ${sizeStyle.text}
    ${sizeStyle.height}
    ${fullWidth ? 'w-full' : ''}
    ${isDisabled ? variantStyle.disabled : variantStyle.base}
    ${className}
  `.trim();

  const iconSize = sizeStyle.icon;
  const iconSpacing = size === 'sm' ? 'mx-1' : 'mx-2';

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={isDisabled}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size={iconSize}
          className={children ? iconSpacing : ''}
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <Icon
          name={icon}
          size={iconSize}
          className={children ? 'mr-2' : ''}
        />
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <Icon
          name={icon}
          size={iconSize}
          className={children ? 'ml-2' : ''}
        />
      )}

      <style jsx>{`
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          button {
            transition: none !important;
          }
        }

        /* Touch feedback */
        @media (hover: none) {
          button:active:not(:disabled) {
            transform: scale(0.98);
          }
        }
      `}</style>
    </button>
  );
}));

Button.displayName = 'Button';

export default Button; 