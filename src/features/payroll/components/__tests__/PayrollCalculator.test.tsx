import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayrollCalculator from '../PayrollCalculator';
import { Region, TaxYear, NICategory } from '../../lib/types';

// Mock the tenant context
jest.mock('@/lib/multi-tenant/hooks', () => ({
  useTenantContext: () => ({
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

// Mock LocalStorageRepository
jest.mock('@/lib/storage/localStorageRepository', () => ({
  LocalStorageRepository: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn()
  }))
}));

// Mock the PayrollService
const mockCalculatePayroll = jest.fn();
jest.mock('../../services/payroll-service', () => ({
  PayrollService: jest.fn().mockImplementation(() => ({
    calculatePayroll: mockCalculatePayroll
  }))
}));

describe('PayrollCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the calculator form with all required fields', () => {
    render(<PayrollCalculator />);
    
    // Check for all form fields
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Gross Pay/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Region/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tax Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/NI Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tax Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pension Contribution/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate/i })).toBeInTheDocument();
  });

  it('should initialize with default values', () => {
    render(<PayrollCalculator />);
    
    expect(screen.getByLabelText(/Employee ID/i)).toHaveValue('');
    expect(screen.getByLabelText(/Gross Pay/i)).toHaveValue(0);
    expect(screen.getByLabelText(/Region/i)).toHaveValue(Region.ENGLAND);
    expect(screen.getByLabelText(/Tax Year/i)).toHaveValue(TaxYear.Y2024_2025);
    expect(screen.getByLabelText(/NI Category/i)).toHaveValue(NICategory.A);
    expect(screen.getByLabelText(/Tax Code/i)).toHaveValue('');
    expect(screen.getByLabelText(/Pension Contribution/i)).toHaveValue(0);
  });

  it('should handle form input changes', () => {
    render(<PayrollCalculator />);
    
    const employeeIdInput = screen.getByLabelText(/Employee ID/i);
    const grossPayInput = screen.getByLabelText(/Gross Pay/i);
    const regionSelect = screen.getByLabelText(/Region/i);
    
    fireEvent.change(employeeIdInput, { target: { value: 'EMP123' } });
    fireEvent.change(grossPayInput, { target: { value: '30000' } });
    fireEvent.change(regionSelect, { target: { value: Region.WALES } });
    
    expect(employeeIdInput).toHaveValue('EMP123');
    expect(grossPayInput).toHaveValue(30000);
    expect(regionSelect).toHaveValue(Region.WALES);
  });

  it('should calculate payroll and display results', async () => {
    const mockResult = {
      grossPay: 30000,
      formattedGrossPay: '£30,000.00',
      netPay: 24000,
      formattedNetPay: '£24,000.00',
      deductions: [
        { type: 'Income Tax', amount: 4000, formattedAmount: '£4,000.00' },
        { type: 'National Insurance', amount: 2000, formattedAmount: '£2,000.00' }
      ],
      aria: 'Payroll calculation complete'
    };
    
    mockCalculatePayroll.mockResolvedValue(mockResult);

    render(<PayrollCalculator />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Employee ID/i), {
      target: { value: 'EMP123' }
    });
    fireEvent.change(screen.getByLabelText(/Gross Pay/i), {
      target: { value: '30000' }
    });
    fireEvent.change(screen.getByLabelText(/Tax Code/i), {
      target: { value: '1257L' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    // Verify loading state
    expect(screen.getByText('Calculating...')).toBeInTheDocument();

    // Wait for and verify results
    await waitFor(() => {
      expect(screen.getByText('£30,000.00')).toBeInTheDocument(); // Gross Pay
      expect(screen.getByText('£24,000.00')).toBeInTheDocument(); // Net Pay
      expect(screen.getByText('£4,000.00')).toBeInTheDocument(); // Tax
      expect(screen.getByText('£2,000.00')).toBeInTheDocument(); // NI
    });
  });

  it('should handle calculation errors', async () => {
    const errorMessage = 'Failed to calculate payroll';
    mockCalculatePayroll.mockRejectedValue(new Error(errorMessage));

    render(<PayrollCalculator />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/Employee ID/i), {
      target: { value: 'EMP123' }
    });
    fireEvent.change(screen.getByLabelText(/Gross Pay/i), {
      target: { value: '30000' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    // Wait for and verify error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should validate pension contribution percentage', () => {
    render(<PayrollCalculator />);
    
    const pensionInput = screen.getByLabelText(/Pension Contribution/i);
    
    // Test min value
    fireEvent.change(pensionInput, { target: { value: '-1' } });
    expect(pensionInput).toHaveValue(0);
    
    // Test max value
    fireEvent.change(pensionInput, { target: { value: '101' } });
    expect(pensionInput).toHaveValue(0);
    
    // Test valid value
    fireEvent.change(pensionInput, { target: { value: '5.5' } });
    expect(pensionInput).toHaveValue(5.5);
  });

  it('should handle emergency tax codes', async () => {
    const mockResult = {
      grossPay: 35000,
      formattedGrossPay: '£35,000.00',
      netPay: 27000,
      formattedNetPay: '£27,000.00',
      deductions: [
        { type: 'Emergency Tax', amount: 6000, formattedAmount: '£6,000.00' },
        { type: 'National Insurance', amount: 2000, formattedAmount: '£2,000.00' }
      ],
      aria: 'Emergency tax calculation complete'
    };
    
    mockCalculatePayroll.mockResolvedValue(mockResult);

    render(<PayrollCalculator />);
    
    fireEvent.change(screen.getByLabelText(/Employee ID/i), {
      target: { value: 'EMP123' }
    });
    fireEvent.change(screen.getByLabelText(/Gross Pay/i), {
      target: { value: '35000' }
    });
    fireEvent.change(screen.getByLabelText(/Tax Code/i), {
      target: { value: '1257L X' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Calculate/i }));

    await waitFor(() => {
      expect(screen.getByText('Emergency Tax')).toBeInTheDocument();
      expect(screen.getByText('£6,000.00')).toBeInTheDocument();
    });
  });
}); 