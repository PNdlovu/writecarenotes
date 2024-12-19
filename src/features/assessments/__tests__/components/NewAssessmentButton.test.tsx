/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { NewAssessmentButton } from '../../components/modals/NewAssessmentButton';
import * as assessmentApi from '../../api/assessments';
import { AssessmentType } from '../../types/assessment.types';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock the API
jest.mock('../../api/assessments');

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

describe('NewAssessmentButton', () => {
  const mockResidentId = 'test-resident';
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    jest.clearAllMocks();
  });

  it('renders the button', () => {
    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByRole('button', { name: /new assessment/i })).toBeInTheDocument();
  });

  it('opens modal on button click', () => {
    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /new assessment/i }));
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/create new assessment/i)).toBeInTheDocument();
  });

  it('displays assessment type options', () => {
    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /new assessment/i }));
    
    Object.values(AssessmentType).forEach(type => {
      expect(screen.getByText(new RegExp(type, 'i'))).toBeInTheDocument();
    });
  });

  it('creates new assessment successfully', async () => {
    const mockAssessment = {
      id: 'new-assessment',
      residentId: mockResidentId,
      type: AssessmentType.DAILY,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (assessmentApi.createAssessment as jest.Mock).mockResolvedValueOnce(mockAssessment);

    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /new assessment/i }));
    
    // Select assessment type
    fireEvent.click(screen.getByText(new RegExp(AssessmentType.DAILY, 'i')));
    
    // Set due date (if the component has a date picker)
    const dueDateInput = screen.getByLabelText(/due date/i);
    fireEvent.change(dueDateInput, { target: { value: '2024-12-20' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(assessmentApi.createAssessment).toHaveBeenCalledWith(
        mockResidentId,
        expect.objectContaining({
          type: AssessmentType.DAILY,
          dueDate: expect.any(String),
        }),
        expect.any(Object)
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockAssessment);
    });

    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays error message on creation failure', async () => {
    const error = new Error('Failed to create assessment');
    (assessmentApi.createAssessment as jest.Mock).mockRejectedValueOnce(error);

    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /new assessment/i }));
    
    // Select assessment type
    fireEvent.click(screen.getByText(new RegExp(AssessmentType.DAILY, 'i')));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to create assessment/i)).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    // Modal should still be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /new assessment/i }));
    
    // Try to submit without selecting type
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(screen.getByText(/assessment type is required/i)).toBeInTheDocument();
      expect(assessmentApi.createAssessment).not.toHaveBeenCalled();
    });
  });

  it('closes modal on cancel', () => {
    render(
      <NewAssessmentButton
        residentId={mockResidentId}
        onSuccess={mockOnSuccess}
      />
    );

    // Open modal
    fireEvent.click(screen.getByRole('button', { name: /new assessment/i }));
    
    // Click cancel
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    // Modal should be closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});


