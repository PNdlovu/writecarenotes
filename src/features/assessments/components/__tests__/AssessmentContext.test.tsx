import { renderHook, act } from '@testing-library/react';
import { AssessmentProvider, useAssessment } from '../../context/AssessmentContext';
import { Assessment } from '../../context/AssessmentContext';

describe('AssessmentContext', () => {
  const mockAssessment: Assessment = {
    id: '1',
    residentId: 'R123',
    assessorId: 'A456',
    dateCreated: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
    status: 'draft',
    communication: {
      primaryMethod: 'verbal',
      alternativeMethods: [],
      assistiveTechnology: [],
      communicationPreferences: [],
    },
    mobility: {
      mobilityAids: [],
      transferAssistance: 'minimal',
      environmentalModifications: [],
      safetyConsiderations: [],
    },
    sensory: {
      visual: { impairments: [], aids: [], accommodations: [] },
      auditory: { impairments: [], aids: [], accommodations: [] },
      tactile: { sensitivities: [], preferences: [], accommodations: [] },
    },
    cognitive: {
      comprehensionLevel: 'high',
      memorySupports: [],
      learningStyle: 'visual',
      adaptations: [],
    },
    behavioral: {
      triggers: [],
      calmingStrategies: [],
      routines: [],
      reinforcements: [],
    },
    specializedCare: {
      medicalProcedures: [],
      equipmentNeeds: [],
      dietaryRequirements: [],
      emergencyProtocols: [],
    },
    progress: {
      goals: [],
      observations: [],
      adaptationEffectiveness: [],
    },
  };

  it('provides initial state', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    expect(result.current.state).toEqual({
      assessments: [],
      loading: false,
      error: null,
      selectedAssessment: null,
    });
  });

  it('sets assessments', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    act(() => {
      result.current.dispatch({
        type: 'SET_ASSESSMENTS',
        payload: [mockAssessment],
      });
    });

    expect(result.current.state.assessments).toEqual([mockAssessment]);
  });

  it('adds an assessment', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    act(() => {
      result.current.dispatch({
        type: 'ADD_ASSESSMENT',
        payload: mockAssessment,
      });
    });

    expect(result.current.state.assessments).toEqual([mockAssessment]);
  });

  it('updates an assessment', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    // First add an assessment
    act(() => {
      result.current.dispatch({
        type: 'ADD_ASSESSMENT',
        payload: mockAssessment,
      });
    });

    // Then update it
    const updatedAssessment = {
      ...mockAssessment,
      status: 'completed' as const,
    };

    act(() => {
      result.current.dispatch({
        type: 'UPDATE_ASSESSMENT',
        payload: updatedAssessment,
      });
    });

    expect(result.current.state.assessments[0].status).toBe('completed');
  });

  it('deletes an assessment', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    // First add an assessment
    act(() => {
      result.current.dispatch({
        type: 'ADD_ASSESSMENT',
        payload: mockAssessment,
      });
    });

    // Then delete it
    act(() => {
      result.current.dispatch({
        type: 'DELETE_ASSESSMENT',
        payload: mockAssessment.id,
      });
    });

    expect(result.current.state.assessments).toEqual([]);
  });

  it('sets selected assessment', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    act(() => {
      result.current.dispatch({
        type: 'SET_SELECTED_ASSESSMENT',
        payload: mockAssessment,
      });
    });

    expect(result.current.state.selectedAssessment).toEqual(mockAssessment);
  });

  it('sets loading state', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    act(() => {
      result.current.dispatch({
        type: 'SET_LOADING',
        payload: true,
      });
    });

    expect(result.current.state.loading).toBe(true);
  });

  it('sets error state', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    act(() => {
      result.current.dispatch({
        type: 'SET_ERROR',
        payload: 'Test error message',
      });
    });

    expect(result.current.state.error).toBe('Test error message');
    expect(result.current.state.loading).toBe(false);
  });

  it('handles multiple state updates correctly', () => {
    const { result } = renderHook(() => useAssessment(), {
      wrapper: AssessmentProvider,
    });

    act(() => {
      result.current.dispatch({ type: 'SET_LOADING', payload: true });
      result.current.dispatch({
        type: 'SET_ASSESSMENTS',
        payload: [mockAssessment],
      });
      result.current.dispatch({
        type: 'SET_SELECTED_ASSESSMENT',
        payload: mockAssessment,
      });
    });

    expect(result.current.state).toEqual({
      assessments: [mockAssessment],
      loading: false,
      error: null,
      selectedAssessment: mockAssessment,
    });
  });
});
