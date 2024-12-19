import { renderHook, act } from '@testing-library/react-hooks';
import { useDepartmentManagement } from '../useDepartmentManagement';
import { useToast } from '@/hooks/useToast';

// Mock the useToast hook
jest.mock('@/hooks/useToast', () => ({
  useToast: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn();

describe('useDepartmentManagement', () => {
  const mockToast = {
    showToast: jest.fn()
  };

  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue(mockToast);
    (global.fetch as jest.Mock).mockClear();
    mockToast.showToast.mockClear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDepartmentManagement());

    expect(result.current.departments).toEqual([]);
    expect(result.current.staffAssignments).toEqual({});
    expect(result.current.resourceAllocations).toEqual([]);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should fetch department data successfully', async () => {
    const mockData = {
      departments: [{ id: '1', name: 'Department 1' }],
      staffAssignments: { '1': [{ id: '1', name: 'Staff 1' }] },
      resources: [{ id: '1', resourceId: '1', quantity: 5 }]
    };

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve(mockData.departments) }))
      .mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve(mockData.staffAssignments) }))
      .mockImplementationOnce(() => 
        Promise.resolve({ json: () => Promise.resolve(mockData.resources) }));

    const { result } = renderHook(() => useDepartmentManagement('care-home-1'));

    await act(async () => {
      await result.current.fetchDepartments('care-home-1');
    });

    expect(result.current.departments).toEqual(mockData.departments);
    expect(result.current.staffAssignments).toEqual(mockData.staffAssignments);
    expect(result.current.resourceAllocations).toEqual(mockData.resources);
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should create department successfully', async () => {
    const mockDepartment = { name: 'New Department', type: 'Clinical' };
    const mockResponse = { id: '1', ...mockDepartment };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockResponse) })
    );

    const { result } = renderHook(() => useDepartmentManagement('care-home-1'));

    await act(async () => {
      await result.current.createDepartment(mockDepartment);
    });

    expect(result.current.departments).toContainEqual(mockResponse);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Department created successfully',
      type: 'success'
    });
  });

  it('should update department successfully', async () => {
    const mockUpdate = { name: 'Updated Department' };
    const mockResponse = { id: '1', ...mockUpdate };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockResponse) })
    );

    const { result } = renderHook(() => useDepartmentManagement('care-home-1'));

    await act(async () => {
      await result.current.updateDepartment('1', mockUpdate);
    });

    expect(result.current.departments).toContainEqual(mockResponse);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Department updated successfully',
      type: 'success'
    });
  });

  it('should delete department successfully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: true })
    );

    const { result } = renderHook(() => useDepartmentManagement('care-home-1'));
    
    // Set initial state
    act(() => {
      result.current.departments.push({ id: '1', name: 'Department 1' });
    });

    await act(async () => {
      await result.current.deleteDepartment('1');
    });

    expect(result.current.departments).not.toContainEqual(
      expect.objectContaining({ id: '1' })
    );
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Department deleted successfully',
      type: 'success'
    });
  });

  it('should assign staff successfully', async () => {
    const mockResponse = [{ id: '1', name: 'Staff 1' }];

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ json: () => Promise.resolve(mockResponse) })
    );

    const { result } = renderHook(() => useDepartmentManagement('care-home-1'));

    await act(async () => {
      await result.current.assignStaff('dept-1', 'staff-1');
    });

    expect(result.current.staffAssignments['dept-1']).toEqual(mockResponse);
    expect(mockToast.showToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Staff assigned successfully',
      type: 'success'
    });
  });

  // Add more tests for other methods...
});


