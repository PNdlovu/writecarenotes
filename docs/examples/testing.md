# Testing Examples

## Component Testing

### Basic Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { DepartmentManager } from '../components/department/DepartmentManager';
import { useDepartmentData } from '../hooks/useDepartmentData';

jest.mock('../hooks/useDepartmentData');

describe('DepartmentManager', () => {
  const mockDepartments = [
    { id: '1', name: 'Emergency' },
    { id: '2', name: 'Surgery' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders departments list', async () => {
    (useDepartmentData as jest.Mock).mockReturnValue({
      data: mockDepartments,
      isLoading: false,
      error: null
    });

    render(<DepartmentManager facilityId="123" />);
    
    expect(screen.getByText('Emergency')).toBeInTheDocument();
    expect(screen.getByText('Surgery')).toBeInTheDocument();
  });

  it('handles add department', async () => {
    const mockAddDepartment = jest.fn();
    (useDepartmentData as jest.Mock).mockReturnValue({
      data: mockDepartments,
      isLoading: false,
      error: null,
      addDepartment: mockAddDepartment
    });

    render(<DepartmentManager facilityId="123" />);
    
    fireEvent.click(screen.getByText('Add Department'));
    fireEvent.change(screen.getByLabelText('Department Name'), {
      target: { value: 'Pediatrics' }
    });
    fireEvent.click(screen.getByText('Save'));

    expect(mockAddDepartment).toHaveBeenCalledWith('Pediatrics');
  });
});
```

### Testing Loading States

```typescript
import { render, screen } from '@testing-library/react';
import { LoadingState } from '../components/shared/LoadingState';

describe('LoadingState', () => {
  it('displays custom loading message', () => {
    render(<LoadingState message="Loading departments..." />);
    expect(screen.getByText('Loading departments...')).toBeInTheDocument();
  });

  it('shows spinner', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```

### Testing Error Boundaries

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';

describe('ErrorBoundary', () => {
  const error = new Error('Test error');
  const reset = jest.fn();

  it('displays error message', () => {
    render(<ErrorBoundary error={error} reset={reset} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('calls reset on retry', () => {
    render(<ErrorBoundary error={error} reset={reset} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(reset).toHaveBeenCalled();
  });
});
```

## Integration Testing

### API Integration Test

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useFacilityData } from '../hooks/useFacilityData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

describe('useFacilityData', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('fetches facility data', async () => {
    const { result } = renderHook(() => useFacilityData('123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });

  it('handles error state', async () => {
    // Mock fetch to throw error
    global.fetch = jest.fn(() => 
      Promise.reject(new Error('API Error'))
    );

    const { result } = renderHook(() => useFacilityData('123'), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

## E2E Testing Example

```typescript
import { test, expect } from '@playwright/test';

test('facility dashboard workflow', async ({ page }) => {
  await page.goto('/facility/123');

  // Check dashboard loads
  await expect(page.getByTestId('facility-dashboard')).toBeVisible();

  // Add new department
  await page.click('text=Add Department');
  await page.fill('[aria-label="Department Name"]', 'Neurology');
  await page.click('text=Save');

  // Verify department added
  await expect(page.getByText('Neurology')).toBeVisible();

  // Check alerts tab
  await page.click('text=Alerts');
  await expect(page.getByTestId('alerts-panel')).toBeVisible();

  // Verify charts loaded
  await expect(page.getByTestId('occupancy-chart')).toBeVisible();
  await expect(page.getByTestId('resource-usage-chart')).toBeVisible();
});
```

## Performance Testing

```typescript
import { render } from '@testing-library/react';
import { FacilityDashboard } from '../components/FacilityDashboard';

describe('FacilityDashboard Performance', () => {
  it('renders within performance budget', () => {
    const startTime = performance.now();
    
    render(<FacilityDashboard facilityId="123" />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(100); // 100ms budget
  });

  it('maintains smooth updates', async () => {
    const { rerender } = render(<FacilityDashboard facilityId="123" />);
    
    const updateTimes = [];
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      rerender(<FacilityDashboard facilityId="123" />);
      updateTimes.push(performance.now() - startTime);
    }
    
    const avgUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
    expect(avgUpdateTime).toBeLessThan(16); // 60fps threshold
  });
});
```
