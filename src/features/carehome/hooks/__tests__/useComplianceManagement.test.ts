import { renderHook, act } from '@testing-library/react-hooks';
import { useComplianceManagement } from '../useComplianceManagement';
import { useToast } from '@/hooks/useToast';

// Mock the useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('useComplianceManagement', () => {
  const mockToast = {
    showToast: jest.fn()
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (global.fetch as jest.Mock).mockClear();
    mockToast.showToast.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useComplianceManagement());

    expect(result.current.complianceStatus).toBeNull();
    expect(result.current.inspectionReports).toEqual([]);
    expect(result.current.requirements).toEqual([]);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should fetch compliance data successfully', async () => {
    const mockData = {
      status: { id: '1', rating: 'good' },
      reports: [{ id: '1', date: new Date() }],
      requirements: [{ id: '1', title: 'Requirement 1' }]
    };

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve(mockData.status) }))
      .mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve(mockData.reports) }))
      .mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve(mockData.requirements) }));

    const { result } = renderHook(() => useComplianceManagement('care-home-1'));

    await act(async () => {
      await result.current.fetchComplianceStatus('care-home-1');
    });

    expect(result.current.complianceStatus).toEqual(mockData.status);
    expect(result.current.inspectionReports).toEqual(mockData.reports);
    expect(result.current.requirements).toEqual(mockData.requirements);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors gracefully', async () => {
    const error = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useComplianceManagement('care-home-1'));

    await act(async () => {
      await result.current.fetchComplianceStatus('care-home-1');
    });

    expect(result.current.error).toBe(error);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to fetch compliance data',
      type: 'error'
    });
  });

  it('should update compliance status successfully', async () => {
    const mockUpdate = { rating: 'excellent' };
    const mockResponse = { id: '1', rating: 'excellent' };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockResponse) })
    );

    const { result } = renderHook(() => useComplianceManagement('care-home-1'));

    await act(async () => {
      await result.current.updateComplianceStatus(mockUpdate);
    });

    expect(result.current.complianceStatus).toEqual(mockResponse);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Compliance status updated successfully',
      type: 'success'
    });
  });

  it('should submit inspection report successfully', async () => {
    const mockReport = { date: new Date(), findings: [] };
    const mockResponse = { id: '1', ...mockReport };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockResponse) })
    );

    const { result } = renderHook(() => useComplianceManagement('care-home-1'));

    await act(async () => {
      await result.current.submitInspectionReport(mockReport);
    });

    expect(result.current.inspectionReports).toContainEqual(mockResponse);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Inspection report submitted successfully',
      type: 'success'
    });
  });

  // Add more tests for other methods...
});


