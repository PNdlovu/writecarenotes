import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComplianceDashboard } from '../ComplianceDashboard';
import { useComplianceManagement } from '../../hooks/useComplianceManagement';

// Mock the hook
jest.mock('../../hooks/useComplianceManagement');

const mockUseComplianceManagement = useComplianceManagement as jest.MockedFunction<typeof useComplianceManagement>;

describe('ComplianceDashboard', () => {
  const defaultProps = {
    organizationId: 'org1',
    careHomeId: 'care1',
    region: 'UK' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseComplianceManagement.mockReturnValue({
      frameworks: [],
      audits: [],
      schedule: [],
      isLoading: true,
      error: null,
      validateCompliance: jest.fn(),
      addEvidence: jest.fn(),
      updateSchedule: jest.fn()
    });

    render(<ComplianceDashboard {...defaultProps} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseComplianceManagement.mockReturnValue({
      frameworks: [],
      audits: [],
      schedule: [],
      isLoading: false,
      error: new Error('Test error'),
      validateCompliance: jest.fn(),
      addEvidence: jest.fn(),
      updateSchedule: jest.fn()
    });

    render(<ComplianceDashboard {...defaultProps} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('should render compliance data correctly', () => {
    const mockData = {
      frameworks: [
        {
          id: '1',
          name: 'Test Framework',
          version: '1.0',
          region: 'UK',
          requirements: [],
          lastUpdated: new Date()
        }
      ],
      audits: [
        {
          id: '1',
          frameworkId: 'f1',
          organizationId: 'org1',
          careHomeId: 'care1',
          auditedBy: 'user1',
          auditDate: new Date(),
          findings: [],
          score: 85,
          nextAuditDue: new Date(),
          status: 'APPROVED'
        }
      ],
      schedule: [
        {
          id: '1',
          organizationId: 'org1',
          careHomeId: 'care1',
          frameworkId: 'f1',
          frequency: 'MONTHLY',
          nextAuditDue: new Date(),
          assignedTo: ['user1'],
          status: 'ACTIVE'
        }
      ],
      isLoading: false,
      error: null,
      validateCompliance: jest.fn(),
      addEvidence: jest.fn(),
      updateSchedule: jest.fn()
    };

    mockUseComplianceManagement.mockReturnValue(mockData);

    render(<ComplianceDashboard {...defaultProps} />);

    // Check if main sections are rendered
    expect(screen.getByText('Overall Compliance')).toBeInTheDocument();
    expect(screen.getByText('Next Audit')).toBeInTheDocument();
    expect(screen.getByText('Active Frameworks')).toBeInTheDocument();
    expect(screen.getByText('Recent Audits')).toBeInTheDocument();

    // Check if data is displayed correctly
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Number of frameworks
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
  });

  it('should handle start audit button click', () => {
    const validateCompliance = jest.fn();
    mockUseComplianceManagement.mockReturnValue({
      frameworks: [{ id: '1' }],
      audits: [],
      schedule: [],
      isLoading: false,
      error: null,
      validateCompliance,
      addEvidence: jest.fn(),
      updateSchedule: jest.fn()
    });

    render(<ComplianceDashboard {...defaultProps} />);
    
    const startButton = screen.getByText('Start Audit');
    fireEvent.click(startButton);

    expect(validateCompliance).toHaveBeenCalledWith('1');
  });
});


