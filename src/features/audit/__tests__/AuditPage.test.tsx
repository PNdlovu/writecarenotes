/**
 * @fileoverview Tests for audit page component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuditPage } from '../components/AuditPage';
import { AuditService } from '../services/auditService';
import { AuditLogEntry, AuditLogStats } from '../types/audit.types';

// Mock the services
jest.mock('../services/auditService');
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('AuditPage', () => {
  const mockLogs: AuditLogEntry[] = [
    {
      id: '1',
      entityType: 'CareHome',
      entityId: 'ch123',
      action: 'CREATE',
      actorId: 'user123',
      actorType: 'USER',
      status: 'SUCCESS',
      organizationId: 'org123',
      timestamp: new Date('2024-01-01'),
    },
  ];

  const mockStats: AuditLogStats = {
    totalLogs: 100,
    successCount: 90,
    failureCount: 10,
    actionCounts: { CREATE: 50, UPDATE: 30, DELETE: 20 },
    entityTypeCounts: { CareHome: 60, Resident: 40 },
  };

  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuditService = {
      getInstance: jest.fn().mockReturnThis(),
      searchLogs: jest.fn().mockResolvedValue(mockLogs),
      getAuditStats: jest.fn().mockResolvedValue(mockStats),
      exportLogs: jest.fn().mockResolvedValue(Buffer.from('test')),
      archiveOldLogs: jest.fn().mockResolvedValue(5),
    } as unknown as jest.Mocked<AuditService>;

    (AuditService.getInstance as jest.Mock).mockReturnValue(mockAuditService);
  });

  it('renders initial state correctly', async () => {
    render(<AuditPage />);

    // Check for main components
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    expect(screen.getByText('View and manage system audit logs')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
      expect(mockAuditService.getAuditStats).toHaveBeenCalled();
    });
  });

  it('handles filtering correctly', async () => {
    render(<AuditPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
    });

    // Find and click filter button (assuming it exists in your UI)
    const filterButton = screen.getByText('Apply Filters');
    fireEvent.click(filterButton);

    // Verify that searchLogs was called with updated filters
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('handles pagination correctly', async () => {
    render(<AuditPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
    });

    // Find and click next page button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Verify that searchLogs was called with updated page
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 20, // PAGE_SIZE
        })
      );
    });
  });

  it('handles sorting correctly', async () => {
    render(<AuditPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
    });

    // Find and click a sortable column header
    const timestampHeader = screen.getByText('Timestamp');
    fireEvent.click(timestampHeader);

    // Verify that searchLogs was called with updated sort params
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'timestamp',
          sortDirection: 'desc',
        })
      );
    });
  });

  it('handles export correctly', async () => {
    render(<AuditPage />);

    // Find and click export button
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Click JSON export option
    const jsonOption = screen.getByText('JSON');
    fireEvent.click(jsonOption);

    // Verify export was called
    await waitFor(() => {
      expect(mockAuditService.exportLogs).toHaveBeenCalledWith(
        expect.objectContaining({
          format: 'JSON',
        })
      );
    });
  });

  it('handles errors correctly', async () => {
    // Mock an error response
    mockAuditService.searchLogs.mockRejectedValueOnce(new Error('Test error'));

    render(<AuditPage />);

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load audit logs/i)).toBeInTheDocument();
    });
  });

  it('handles log selection and details view', async () => {
    render(<AuditPage />);

    // Wait for logs to load
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
    });

    // Find and click a log row
    const logRow = screen.getByText('CareHome');
    fireEvent.click(logRow);

    // Verify details modal is shown
    expect(screen.getByText('Audit Log Details')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    // Verify modal is closed
    expect(screen.queryByText('Audit Log Details')).not.toBeInTheDocument();
  });

  it('handles archive functionality', async () => {
    render(<AuditPage />);

    // Wait for logs to load and click a log
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
    });
    fireEvent.click(screen.getByText('CareHome'));

    // Find and click archive button
    const archiveButton = screen.getByText('Archive');
    fireEvent.click(archiveButton);

    // Verify archive was called
    await waitFor(() => {
      expect(mockAuditService.archiveOldLogs).toHaveBeenCalledWith(90);
    });
  });

  it('refreshes data correctly', async () => {
    render(<AuditPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalled();
    });

    // Find and click refresh button
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    // Verify data was reloaded
    await waitFor(() => {
      expect(mockAuditService.searchLogs).toHaveBeenCalledTimes(2);
      expect(mockAuditService.getAuditStats).toHaveBeenCalledTimes(2);
    });
  });
}); 


