/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { AssessmentForm } from '../../components/templates/AssessmentForm';
import { useAssessment } from '../../hooks/useAssessment';
import { AssessmentStatus, AssessmentType } from '../../types/assessment.types';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the assessment hook
jest.mock('../../hooks/useAssessment');

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

const mockAssessment = {
  id: 'test-assessment',
  residentId: 'test-resident',
  type: AssessmentType.DAILY,
  status: AssessmentStatus.IN_PROGRESS,
  sections: [
    {
      id: 'section-1',
      title: 'General Health',
      completed: false,
      questions: [
        {
          id: 'q1',
          text: 'How is the resident feeling today?',
          type: 'text',
          answer: '',
        },
      ],
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('AssessmentForm', () => {
  const mockUpdateSection = jest.fn();
  const mockUpdateStatus = jest.fn();

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useAssessment as jest.Mock).mockReturnValue({
      assessment: mockAssessment,
      loading: false,
      error: null,
      updateSection: mockUpdateSection,
      updateStatus: mockUpdateStatus,
    });
    jest.clearAllMocks();
  });

  it('renders assessment form with sections', () => {
    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    expect(screen.getByText('General Health')).toBeInTheDocument();
    expect(screen.getByText('How is the resident feeling today?')).toBeInTheDocument();
  });

  it('handles section completion', async () => {
    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    // Fill in the question
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Feeling good' } });

    // Mark section as complete
    const completeButton = screen.getByRole('button', { name: /complete section/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockUpdateSection).toHaveBeenCalledWith(
        'test-assessment',
        'section-1',
        expect.objectContaining({
          completed: true,
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: 'q1',
              answer: 'Feeling good',
            }),
          ]),
        })
      );
    });
  });

  it('validates required fields before section completion', async () => {
    const assessmentWithRequired = {
      ...mockAssessment,
      sections: [{
        ...mockAssessment.sections[0],
        questions: [{
          ...mockAssessment.sections[0].questions[0],
          required: true,
        }],
      }],
    };

    (useAssessment as jest.Mock).mockReturnValue({
      assessment: assessmentWithRequired,
      loading: false,
      error: null,
      updateSection: mockUpdateSection,
      updateStatus: mockUpdateStatus,
    });

    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    // Try to complete section without filling required field
    const completeButton = screen.getByRole('button', { name: /complete section/i });
    fireEvent.click(completeButton);

    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    expect(mockUpdateSection).not.toHaveBeenCalled();
  });

  it('handles assessment completion', async () => {
    const completedAssessment = {
      ...mockAssessment,
      sections: [{
        ...mockAssessment.sections[0],
        completed: true,
      }],
    };

    (useAssessment as jest.Mock).mockReturnValue({
      assessment: completedAssessment,
      loading: false,
      error: null,
      updateSection: mockUpdateSection,
      updateStatus: mockUpdateStatus,
    });

    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    // Complete assessment
    const completeButton = screen.getByRole('button', { name: /complete assessment/i });
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith(
        'test-assessment',
        AssessmentStatus.COMPLETED
      );
    });
  });

  it('prevents assessment completion when sections are incomplete', () => {
    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    const completeButton = screen.getByRole('button', { name: /complete assessment/i });
    expect(completeButton).toBeDisabled();
  });

  it('displays loading state', () => {
    (useAssessment as jest.Mock).mockReturnValue({
      assessment: null,
      loading: true,
      error: null,
      updateSection: mockUpdateSection,
      updateStatus: mockUpdateStatus,
    });

    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error state', () => {
    (useAssessment as jest.Mock).mockReturnValue({
      assessment: null,
      loading: false,
      error: new Error('Failed to load assessment'),
      updateSection: mockUpdateSection,
      updateStatus: mockUpdateStatus,
    });

    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    expect(screen.getByText(/failed to load assessment/i)).toBeInTheDocument();
  });

  it('autosaves form changes', async () => {
    jest.useFakeTimers();

    render(
      <AssessmentForm
        residentId="test-resident"
        assessmentId="test-assessment"
      />
    );

    // Make changes to form
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New answer' } });

    // Fast-forward timers
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(mockUpdateSection).toHaveBeenCalledWith(
        'test-assessment',
        'section-1',
        expect.objectContaining({
          questions: expect.arrayContaining([
            expect.objectContaining({
              id: 'q1',
              answer: 'New answer',
            }),
          ]),
        })
      );
    });

    jest.useRealTimers();
  });
});


