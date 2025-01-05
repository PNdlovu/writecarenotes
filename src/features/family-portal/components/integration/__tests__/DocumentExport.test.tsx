import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentExport } from '../DocumentExport';
import { useDocumentExport } from '../../../hooks/useDocumentExport';
import { vi } from 'vitest';

// Mock the custom hook
vi.mock('../../../hooks/useDocumentExport');

describe('DocumentExport', () => {
  const mockProps = {
    residentId: '123',
    familyMemberId: '456',
  };

  const mockDocuments = [
    {
      id: '1',
      title: 'Care Plan Report',
      type: 'report',
      dateCreated: new Date(),
      size: 1024,
      format: 'pdf',
      exportFormats: ['pdf', 'docx'],
    },
  ];

  const mockExportJobs = [
    {
      id: '1',
      documentId: '1',
      status: 'completed',
      targetFormat: 'pdf',
      startTime: new Date(),
      endTime: new Date(),
    },
  ];

  const mockHookReturn = {
    documents: mockDocuments,
    exportJobs: mockExportJobs,
    isLoading: false,
    isExporting: false,
    exportDocument: vi.fn(),
    getExportStatus: vi.fn(),
    downloadExport: vi.fn(),
    filterDocuments: vi.fn(),
  };

  beforeEach(() => {
    (useDocumentExport as jest.Mock).mockReturnValue(mockHookReturn);
  });

  it('renders without crashing', () => {
    render(<DocumentExport {...mockProps} />);
    expect(screen.getByText('Document Export')).toBeInTheDocument();
  });

  it('displays document list', () => {
    render(<DocumentExport {...mockProps} />);
    expect(screen.getByText('Care Plan Report')).toBeInTheDocument();
  });

  it('handles document selection', () => {
    render(<DocumentExport {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeChecked();
  });

  it('handles document export', async () => {
    render(<DocumentExport {...mockProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    const exportButton = screen.getByText('Export Selected');
    fireEvent.click(exportButton);
    
    const formatSelect = screen.getByRole('combobox');
    fireEvent.change(formatSelect, { target: { value: 'pdf' } });
    
    const confirmButton = screen.getByText('Export');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(mockHookReturn.exportDocument).toHaveBeenCalledWith('1', 'pdf');
    });
  });

  it('displays export job status', () => {
    render(<DocumentExport {...mockProps} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('handles document download', async () => {
    render(<DocumentExport {...mockProps} />);
    
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(mockHookReturn.downloadExport).toHaveBeenCalledWith('1');
    });
  });

  it('displays loading state', () => {
    (useDocumentExport as jest.Mock).mockReturnValue({
      ...mockHookReturn,
      isLoading: true,
    });
    
    render(<DocumentExport {...mockProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles document filtering', async () => {
    render(<DocumentExport {...mockProps} />);
    
    const typeSelect = screen.getByLabelText('Document Type');
    fireEvent.change(typeSelect, { target: { value: 'report' } });
    
    await waitFor(() => {
      expect(mockHookReturn.filterDocuments).toHaveBeenCalledWith('report');
    });
  });

  it('displays file size in readable format', () => {
    render(<DocumentExport {...mockProps} />);
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
  });
});


