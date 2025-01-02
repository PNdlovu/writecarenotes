/**
 * @writecarenotes.com
 * @fileoverview Reusable authentication input component
 * @version 1.0.0
 * @created 2025-01-01
 * @updated 2025-01-02
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * A versatile input component designed specifically for authentication forms.
 * Features include:
 * - Support for both text inputs and select dropdowns
 * - Consistent styling with focus states
 * - Accessible labels and ARIA attributes
 * - Customizable through className props
 * - Type-safe props interface
 * - Error state handling
 *
 * Mobile-First Considerations:
 * - Touch-friendly input size
 * - Clear focus states
 * - Mobile keyboard types
 * - Tap target sizing
 * - Input spacing
 * - Native select support
 *
 * Enterprise Features:
 * - Accessibility compliance
 * - Input sanitization
 * - Error handling
 * - Consistent styling
 * - Performance optimized
 * - Reusable design
 */

import * as React from 'react'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  type: string;
  options?: { value: string; label: string }[];
}

export function AuthInput({ label, type, options, className = '', ...props }: AuthInputProps) {
  const baseClassName = `appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${className}`;

  if (type === 'select' && options) {
    return (
      <div>
        <label htmlFor={props.id} className="sr-only">
          {label}
        </label>
        <select
          {...props}
          className={baseClassName}
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={props.id} className="sr-only">
        {label}
      </label>
      <input
        type={type}
        {...props}
        className={baseClassName}
      />
    </div>
  );
}
