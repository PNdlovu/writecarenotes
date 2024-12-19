# Shared Component Patterns

## Component Structure

### Base Component Template

```typescript
'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BaseProps {
  children: ReactNode;
  className?: string;
  testId?: string;
}

/**
 * Base component with common props and styling
 * @component
 */
export function Base({ children, className, testId }: BaseProps) {
  return (
    <div 
      className={cn('relative', className)}
      data-testid={testId}
    >
      {children}
    </div>
  );
}
```

### Loading Component Pattern

```typescript
interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Consistent loading indicator
 * @component
 */
export function Loading({ message = 'Loading...', size = 'md' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Spinner size={size} />
      <p className="text-muted-foreground mt-2">{message}</p>
    </div>
  );
}
```

### Error Component Pattern

```typescript
interface ErrorProps {
  error: Error;
  reset?: () => void;
  variant?: 'inline' | 'full';
}

/**
 * Error display with optional retry
 * @component
 */
export function Error({ error, reset, variant = 'inline' }: ErrorProps) {
  return (
    <div className={cn(
      'rounded-md border border-destructive/20 p-4',
      variant === 'full' && 'min-h-[200px] flex items-center justify-center'
    )}>
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h3 className="mt-2 font-medium text-destructive">
          {error.message}
        </h3>
        {reset && (
          <Button
            variant="outline"
            onClick={reset}
            className="mt-4"
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
```

## Form Components

### Input Field Pattern

```typescript
interface InputFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
}

/**
 * Input field with label and error handling
 * @component
 */
export function InputField({
  label,
  name,
  error,
  required
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        aria-describedby={error ? `${name}-error` : undefined}
        className={cn(error && 'border-destructive')}
      />
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
```

### Select Field Pattern

```typescript
interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: Option[];
  error?: string;
}

/**
 * Select field with label and error handling
 * @component
 */
export function SelectField({
  label,
  name,
  options,
  error
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Select
        id={name}
        name={name}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
```

## Data Display Components

### Card Pattern

```typescript
interface CardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Card component for consistent data display
 * @component
 */
export function Card({
  title,
  description,
  children,
  footer
}: CardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">
            {description}
          </p>
        )}
        <div className="mt-4">{children}</div>
      </div>
      {footer && (
        <div className="border-t bg-muted/50 p-4">
          {footer}
        </div>
      )}
    </div>
  );
}
```

### Data Table Pattern

```typescript
interface Column<T> {
  header: string;
  accessorKey: keyof T;
  cell?: (value: T[keyof T]) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: Error;
}

/**
 * Reusable data table component
 * @component
 */
export function DataTable<T>({
  columns,
  data,
  loading,
  error
}: DataTableProps<T>) {
  if (loading) {
    return <Loading message="Loading data..." />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted">
            {columns.map(column => (
              <th
                key={column.header}
                className="px-4 py-2 text-left font-medium"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b hover:bg-muted/50"
            >
              {columns.map(column => (
                <td
                  key={column.header}
                  className="px-4 py-2"
                >
                  {column.cell
                    ? column.cell(row[column.accessorKey])
                    : row[column.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
