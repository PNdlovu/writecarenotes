/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAssessment } from '../hooks/useAssessment';
import * as assessmentApi from '../api/assessments';
import { AssessmentStatus, AssessmentType } from '../types/assessment.types';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock the API
jest.mock('../api/assessments');

const mockSession = {
  data: {
    user: {
      id: 'test-user',
      tenantId: 'test-tenant',
    },
    expires: '2024-12-14',
  },
  status: 'authenticated',
};

const mockRouter = {
  push: jest.fn(),
};

const mockAssessment = {
  id: 'test-assessment',
  residentId: 'test-resident',
  type: AssessmentType.DAILY,
  status: AssessmentStatus.IN_PROGRESS,
  sections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('useAssessment', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('should initialize with initial assessment', () => {
    const { result } = renderHook(() => 
      useAssessment({ 
        residentId: 'test-resident',
        initialAssessment: mockAssessment,
      })
    );

    expect(result.current.assessment).toEqual(mockAssessment);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should fetch assessment successfully', async () => {
    (assessmentApi.getAssessmentById as jest.Mock).mockResolvedValueOnce(mockAssessment);

    const { result } = renderHook(() => 
      useAssessment({ residentId: 'test-resident' })
    );

    await act(async () => {
      await result.current.fetchAssessment('test-assessment');
    });

    expect(result.current.assessment).toEqual(mockAssessment);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(assessmentApi.getAssessmentById).toHaveBeenCalledWith(
      'test-resident',
      'test-assessment',
      expect.any(Object)
    );
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch');
    (assessmentApi.getAssessmentById as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => 
      useAssessment({ residentId: 'test-resident' })
    );

    await act(async () => {
      await result.current.fetchAssessment('test-assessment');
    });

    expect(result.current.assessment).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(error);
  });

  it('should update section successfully', async () => {
    const updatedAssessment = {
      ...mockAssessment,
      sections: [{ id: 'section-1', completed: true }],
    };
    (assessmentApi.updateAssessment as jest.Mock).mockResolvedValueOnce(updatedAssessment);

    const { result } = renderHook(() => 
      useAssessment({ 
        residentId: 'test-resident',
        initialAssessment: mockAssessment,
      })
    );

    await act(async () => {
      await result.current.updateSection('test-assessment', 'section-1', { completed: true });
    });

    expect(result.current.assessment).toEqual(updatedAssessment);
    expect(result.current.error).toBeNull();
    expect(assessmentApi.updateAssessment).toHaveBeenCalledWith(
      'test-resident',
      'test-assessment',
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should update status successfully', async () => {
    const updatedAssessment = {
      ...mockAssessment,
      status: AssessmentStatus.COMPLETED,
      completedAt: expect.any(String),
      completedBy: 'test-user',
    };
    (assessmentApi.updateAssessment as jest.Mock).mockResolvedValueOnce(updatedAssessment);

    const { result } = renderHook(() => 
      useAssessment({ 
        residentId: 'test-resident',
        initialAssessment: mockAssessment,
      })
    );

    await act(async () => {
      await result.current.updateStatus('test-assessment', AssessmentStatus.COMPLETED);
    });

    expect(result.current.assessment).toEqual(updatedAssessment);
    expect(result.current.error).toBeNull();
    expect(assessmentApi.updateAssessment).toHaveBeenCalledWith(
      'test-resident',
      'test-assessment',
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('should export assessment successfully', async () => {
    const mockBlob = new Blob(['test'], { type: 'application/pdf' });
    (assessmentApi.exportAssessment as jest.Mock).mockResolvedValueOnce(mockBlob);
    
    // Mock URL.createObjectURL and revokeObjectURL
    const createObjectURL = jest.fn().mockReturnValue('blob:test');
    const revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;

    // Mock document.createElement and related methods
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    document.createElement = jest.fn().mockReturnValue(mockAnchor);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();

    const { result } = renderHook(() => 
      useAssessment({ residentId: 'test-resident' })
    );

    await act(async () => {
      await result.current.exportAssessment('test-assessment', 'PDF');
    });

    expect(assessmentApi.exportAssessment).toHaveBeenCalledWith(
      'test-resident',
      'test-assessment',
      'PDF',
      expect.any(Object)
    );
    expect(createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });

  it('should handle export error', async () => {
    const error = new Error('Failed to export');
    (assessmentApi.exportAssessment as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => 
      useAssessment({ residentId: 'test-resident' })
    );

    await act(async () => {
      await result.current.exportAssessment('test-assessment', 'PDF');
    });

    expect(result.current.error).toEqual(error);
  });
});


