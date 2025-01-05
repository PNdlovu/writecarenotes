'use client';

import { useTheme } from '@/features/theme/ThemeProvider';
import { ButtonHTMLAttributes } from 'react';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export function AuthButton({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '',
  ...props 
}: AuthButtonProps) {
  const { colors } = useTheme();

  const baseStyles = "w-full flex justify-center py-3 px-4 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  const loadingStyles = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  
  const variantStyles = variant === 'primary' 
    ? `border-transparent text-white bg-${colors.england.primary} hover:bg-${colors.england.secondary} focus:ring-${colors.england.accent}`
    : `border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-${colors.england.primary}`;

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${loadingStyles} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : children}
    </button>
  );
}
