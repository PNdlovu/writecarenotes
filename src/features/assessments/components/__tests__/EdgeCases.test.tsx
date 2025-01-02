import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssessmentProvider } from '../../context/AssessmentContext';
import { SpecialNeedsAssessmentForm } from '../special-needs/SpecialNeedsAssessmentForm';
import * as assessmentApi from '../../api/assessmentApi';

jest.mock('../../api/assessmentApi');
const mockedAssessmentApi = assessmentApi as jest.Mocked<typeof assessmentApi>;

describe('Special Needs Assessment Edge Cases', () => {
  const mockLargeAssessment = {
    id: '1',
    residentId: 'R123',
    assessorId: 'A456',
    dateCreated: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
    status: 'draft',
    communication: {
      primaryMethod: 'verbal',
      alternativeMethods: Array(100).fill('method'),
      assistiveTechnology: Array(100).fill('tech'),
      communicationPreferences: Array(100).fill('pref'),
    },
    mobility: {
      mobilityAids: Array(100).fill('aid'),
      transferAssistance: 'maximum',
      environmentalModifications: Array(100).fill('mod'),
      safetyConsiderations: Array(100).fill('safety'),
    },
    sensory: {
      visual: {
        impairments: Array(100).fill('impairment'),
        aids: Array(100).fill('aid'),
        accommodations: Array(100).fill('accommodation'),
      },
      auditory: {
        impairments: Array(100).fill('impairment'),
        aids: Array(100).fill('aid'),
        accommodations: Array(100).fill('accommodation'),
      },
      tactile: {
        sensitivities: Array(100).fill('sensitivity'),
        preferences: Array(100).fill('preference'),
        accommodations: Array(100).fill('accommodation'),
      },
    },
    cognitive: {
      comprehensionLevel: 'x'.repeat(1000),
      memorySupports: Array(100).fill('support'),
      learningStyle: 'x'.repeat(1000),
      adaptations: Array(100).fill('adaptation'),
    },
    progress: {
      goals: Array(100).fill({
        description: 'x'.repeat(1000),
        strategies: Array(100).fill('strategy'),
        progress: 'x'.repeat(1000),
      }),
      observations: Array(100).fill('x'.repeat(1000)),
      adaptationEffectiveness: Array(100).fill('x'.repeat(1000)),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Performance with Large Data', () => {
    it('handles large datasets without crashing', async () => {
      const onSave = jest.fn();
      const onCancel = jest.fn();

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={onSave}
            onCancel={onCancel}
          />
        </AssessmentProvider>
      );

      // Verify form renders without crashing
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });

    it('maintains performance when rapidly switching tabs', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const tabs = ['Communication', 'Mobility', 'Sensory', 'Cognitive', 'Behavioral'];
      
      // Rapidly switch between tabs
      for (let i = 0; i < 50; i++) {
        for (const tab of tabs) {
          fireEvent.click(screen.getByText(tab));
        }
      }

      // Verify UI is still responsive
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });
  });

  describe('Concurrent Modifications', () => {
    it('handles concurrent modifications gracefully', async () => {
      const onSave = jest.fn();
      mockedAssessmentApi.updateAssessment.mockRejectedValueOnce(
        new Error('Concurrent modification detected')
      );

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={onSave}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/concurrent modification/i)).toBeInTheDocument();
      });
    });
  });

  describe('Network Issues', () => {
    it('handles network timeouts', async () => {
      mockedAssessmentApi.updateAssessment.mockImplementationOnce(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      );

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/timeout/i)).toBeInTheDocument();
      });
    });

    it('handles offline mode', async () => {
      // Simulate offline mode
      const originalOnline = window.navigator.onLine;
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true
      });

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/offline/i)).toBeInTheDocument();
      });

      // Restore online status
      Object.defineProperty(window.navigator, 'onLine', {
        value: originalOnline,
        writable: true
      });
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('handles empty required fields correctly', async () => {
      const invalidAssessment = { ...mockLargeAssessment };
      invalidAssessment.communication.primaryMethod = '';

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={invalidAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/primary method is required/i)).toBeInTheDocument();
      });
    });

    it('handles special characters in text fields', async () => {
      const specialCharsAssessment = {
        ...mockLargeAssessment,
        communication: {
          ...mockLargeAssessment.communication,
          primaryMethod: '!@#$%^&*()',
        },
      };

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={specialCharsAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      expect(screen.getByDisplayValue('!@#$%^&*()')).toBeInTheDocument();
    });

    it('handles extremely long text input', async () => {
      const longTextAssessment = {
        ...mockLargeAssessment,
        communication: {
          ...mockLargeAssessment.communication,
          primaryMethod: 'x'.repeat(10000),
        },
      };

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={longTextAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/text is too long/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('maintains keyboard navigation with many form fields', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const firstInput = screen.getAllByRole('textbox')[0];
      firstInput.focus();

      // Simulate tabbing through all fields
      for (let i = 0; i < 100; i++) {
        userEvent.tab();
      }

      // Verify focus management still works
      expect(document.activeElement).not.toBe(firstInput);
    });

    it('handles screen reader announcements for dynamic content', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockLargeAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      // Add a new goal
      const addButton = screen.getByText('Add Goal');
      fireEvent.click(addButton);

      // Verify aria-live region updates
      const liveRegion = screen.getByRole('alert');
      expect(liveRegion).toHaveTextContent(/goal added/i);
    });
  });
});
