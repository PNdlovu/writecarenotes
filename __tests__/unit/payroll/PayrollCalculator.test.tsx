import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayrollCalculator from '@/features/payroll/components/PayrollCalculator';

// Mock the tenant context
jest.mock('../../../src/lib/tenant/TenantContext', () => ({
  useTenant: () => ({
    tenant: {
      id: 'test-tenant',
      name: 'Test Tenant',
      settings: {
        branding: {
          colors: {
            primary: '#000000',
            secondary: '#ffffff'
          }
        },
        features: {
          payroll: true
        }
      }
    },
    loading: false,
    error: null
  })
}));

// Mock IndexedDBStorage
jest.mock('../../../lib/storage/indexed-db', () => ({
  IndexedDBStorage: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

// Mock the PayrollService
const mockCalculatePayroll = jest.fn();
jest.mock('@/features/payroll/services/payroll-service', () => ({
  PayrollService: jest.fn().mockImplementation(() => ({
    calculatePayroll: mockCalculatePayroll
  }))
}));

describe('PayrollCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the calculator form', () => {
    render(<PayrollCalculator />);
    
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gross Pay/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tax Code/i)).toBeInTheDocument();
  });

  it('should calculate payroll when form is submitted', async () => {
    mockCalculatePayroll.mockResolvedValue({
      grossPay: 30000,
      netPay: 24000,
      deductions: [
        { type: 'TAX', amount: 4000 },
        { type: 'NI', amount: 2000 }
      ]
    });

    render(<PayrollCalculator />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Employee ID/i), {
      target: { value: 'EMP123' },
    });
    fireEvent.change(screen.getByLabelText(/Gross Pay/i), {
      target: { value: '30000' },
    });
    fireEvent.change(screen.getByLabelText(/Tax Code/i), {
      target: { value: '1257L' },
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText('£24,000.00')).toBeInTheDocument(); // Net Pay
      expect(screen.getByText('£4,000.00')).toBeInTheDocument(); // Tax
      expect(screen.getByText('£2,000.00')).toBeInTheDocument(); // NI
    });
  });

  it('should show validation errors for invalid input', async () => {
    render(<PayrollCalculator />);
    
    // Submit without filling required fields
    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    await waitFor(() => {
      expect(screen.getByText(/Employee ID is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Gross Pay is required/i)).toBeInTheDocument();
    });
  });

  it('should handle emergency tax codes correctly', async () => {
    mockCalculatePayroll.mockResolvedValue({
      grossPay: 35000,
      netPay: 27000,
      deductions: [
        { type: 'TAX', amount: 6000 },
        { type: 'NI', amount: 2000 }
      ]
    });

    render(<PayrollCalculator />);
    
    fireEvent.change(screen.getByLabelText(/Employee ID/i), {
      target: { value: 'EMP126' },
    });
    fireEvent.change(screen.getByLabelText(/Gross Pay/i), {
      target: { value: '35000' },
    });
    fireEvent.change(screen.getByLabelText(/Tax Code/i), {
      target: { value: '1257L X' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    await waitFor(() => {
      expect(screen.getByText('£27,000.00')).toBeInTheDocument();
      expect(screen.getByText('£6,000.00')).toBeInTheDocument();
    });
  });
});
