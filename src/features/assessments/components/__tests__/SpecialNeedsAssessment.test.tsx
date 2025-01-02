import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SpecialNeedsAssessment } from '../SpecialNeedsAssessment';
import { AssessmentProvider } from '../../context/AssessmentContext';
import { OfflineAnalytics } from '../../services/offline/analytics';
import {
  AlertService,
  SettingsService,
  AggregationService,
  ExportService
} from '../../services/analytics';
import { SpecialNeedsAssessmentForm } from '../special-needs/SpecialNeedsAssessmentForm';
import { AssessmentDashboard } from '../dashboard/AssessmentDashboard';
import * as assessmentApi from '../../api/assessmentApi';

// Mock the API calls
jest.mock('../../api/assessmentApi');
const mockedAssessmentApi = assessmentApi as jest.Mocked<typeof assessmentApi>;

// Mock services
jest.mock('../../services/offline/analytics');
jest.mock('../../services/analytics/AlertService');
jest.mock('../../services/analytics/SettingsService');
jest.mock('../../services/analytics/AggregationService');
jest.mock('../../services/analytics/ExportService');

describe('Special Needs Assessment Components', () => {
  const mockAssessment = {
    id: '1',
    residentId: 'R123',
    assessorId: 'A456',
    dateCreated: new Date('2025-01-01'),
    lastModified: new Date('2025-01-01'),
    status: 'draft',
    communication: {
      primaryMethod: 'verbal',
      alternativeMethods: ['sign language'],
      assistiveTechnology: ['hearing aid'],
      communicationPreferences: ['face-to-face'],
    },
    mobility: {
      mobilityAids: ['wheelchair'],
      transferAssistance: 'maximum',
      environmentalModifications: ['ramps'],
      safetyConsiderations: ['fall risk'],
    },
    sensory: {
      visual: {
        impairments: ['low vision'],
        aids: ['glasses'],
        accommodations: ['large print'],
      },
      auditory: {
        impairments: ['partial hearing loss'],
        aids: ['hearing aid'],
        accommodations: ['clear speech'],
      },
      tactile: {
        sensitivities: ['temperature'],
        preferences: ['soft textures'],
        accommodations: ['temperature control'],
      },
    },
    cognitive: {
      comprehensionLevel: 'moderate',
      memorySupports: ['written instructions'],
      learningStyle: 'visual',
      adaptations: ['step-by-step guides'],
    },
    behavioral: {
      triggers: ['loud noises'],
      calmingStrategies: ['quiet space'],
      routines: ['morning walk'],
      reinforcements: ['positive feedback'],
    },
    specializedCare: {
      medicalProcedures: ['medication management'],
      equipmentNeeds: ['oxygen tank'],
      dietaryRequirements: ['soft diet'],
      emergencyProtocols: ['emergency contact list'],
    },
    progress: {
      goals: [
        {
          description: 'Improve mobility',
          strategies: ['daily exercises'],
          progress: 'showing improvement',
        },
      ],
      observations: ['good progress with exercises'],
      adaptationEffectiveness: ['mobility aids working well'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock implementations
    (OfflineAnalytics.getInstance as jest.Mock).mockReturnValue({
      getAssessments: jest.fn().mockResolvedValue([mockAssessment]),
      createAssessment: jest.fn().mockResolvedValue(mockAssessment),
      updateAssessment: jest.fn().mockResolvedValue(mockAssessment),
      deleteAssessment: jest.fn().mockResolvedValue(undefined),
      trackEvent: jest.fn(),
      syncAssessments: jest.fn().mockResolvedValue(undefined)
    });

    (AlertService.getInstance as jest.Mock).mockReturnValue({
      addAlert: jest.fn(),
      getAlerts: jest.fn().mockReturnValue([]),
      clearAlerts: jest.fn(),
      subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
    });

    (SettingsService.getInstance as jest.Mock).mockReturnValue({
      getSettings: jest.fn().mockReturnValue({
        refreshInterval: 5000,
        darkMode: false,
        metrics: {},
        charts: {}
      }),
      saveSettings: jest.fn(),
      resetToDefaults: jest.fn()
    });

    (AggregationService.getInstance as jest.Mock).mockReturnValue({
      aggregateEvents: jest.fn().mockReturnValue({
        daily: {},
        hourly: {},
        byType: {},
        byStatus: {},
        trends: {
          dailyGrowth: 0,
          weeklyGrowth: 0,
          monthlyGrowth: 0,
          successRate: 1
        }
      })
    });

    (ExportService.getInstance as jest.Mock).mockReturnValue({
      exportData: jest.fn().mockResolvedValue(undefined),
      exportChart: jest.fn().mockResolvedValue(undefined)
    });
  });

  describe('AssessmentDashboard', () => {
    const mockOnCreateAssessment = jest.fn();

    beforeEach(() => {
      mockedAssessmentApi.fetchAssessments.mockResolvedValue([mockAssessment]);
    });

    it('renders the dashboard with assessments', async () => {
      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={mockOnCreateAssessment} />
        </AssessmentProvider>
      );

      // Check if the title is rendered
      expect(screen.getByText('Assessments Dashboard')).toBeInTheDocument();

      // Wait for the assessments to be loaded
      await waitFor(() => {
        expect(screen.getByText(mockAssessment.residentId)).toBeInTheDocument();
      });
    });

    it('handles search functionality', async () => {
      mockedAssessmentApi.searchAssessments.mockResolvedValue([mockAssessment]);

      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={mockOnCreateAssessment} />
        </AssessmentProvider>
      );

      const searchInput = screen.getByPlaceholderText('Search assessments...');
      await userEvent.type(searchInput, 'test search');
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 13, charCode: 13 });

      await waitFor(() => {
        expect(mockedAssessmentApi.searchAssessments).toHaveBeenCalledWith('test search');
      });
    });

    it('handles assessment export', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockedAssessmentApi.exportAssessmentPDF.mockResolvedValue(mockBlob);

      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={mockOnCreateAssessment} />
        </AssessmentProvider>
      );

      // Wait for the assessments to be loaded
      await waitFor(() => {
        expect(screen.getByText(mockAssessment.residentId)).toBeInTheDocument();
      });

      // Click the actions button
      const actionsButton = screen.getByText('Actions');
      fireEvent.click(actionsButton);

      // Click the export option
      const exportButton = screen.getByText('Export PDF');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockedAssessmentApi.exportAssessmentPDF).toHaveBeenCalledWith(mockAssessment.id);
      });
    });
  });

  describe('SpecialNeedsAssessmentForm', () => {
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    it('renders the form with initial data', () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockAssessment}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </AssessmentProvider>
      );

      // Check if the main sections are rendered
      expect(screen.getByText('Communication')).toBeInTheDocument();
      expect(screen.getByText('Mobility')).toBeInTheDocument();
      expect(screen.getByText('Sensory')).toBeInTheDocument();
      expect(screen.getByText('Cognitive')).toBeInTheDocument();
      expect(screen.getByText('Behavioral')).toBeInTheDocument();
      expect(screen.getByText('Specialized Care')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockAssessment}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </AssessmentProvider>
      );

      // Find and click the save button
      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
          communication: expect.any(Object),
          mobility: expect.any(Object),
          sensory: expect.any(Object),
          cognitive: expect.any(Object),
          behavioral: expect.any(Object),
          specializedCare: expect.any(Object),
        }));
      });
    });

    it('handles form cancellation', () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockAssessment}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </AssessmentProvider>
      );

      // Find and click the cancel button
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('SpecialNeedsAssessment', () => {
    it('renders without crashing', () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm />
        </AssessmentProvider>
      );
      expect(screen.getByText(/Special Needs Assessment/i)).toBeInTheDocument();
    });

    it('loads assessment data correctly', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm assessmentId="1" />
        </AssessmentProvider>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10')).toBeInTheDocument();
        expect(screen.getByDisplayValue('5th')).toBeInTheDocument();
      });
    });

    it('handles form submission correctly', async () => {
      const { getByRole } = render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm />
        </AssessmentProvider>
      );

      // Fill out form
      fireEvent.change(screen.getByLabelText(/Student Name/i), {
        target: { value: 'Jane Doe' }
      });
      fireEvent.change(screen.getByLabelText(/Age/i), {
        target: { value: '12' }
      });
      fireEvent.change(screen.getByLabelText(/Grade/i), {
        target: { value: '7th' }
      });

      // Submit form
      fireEvent.click(getByRole('button', { name: /Save/i }));

      // Verify analytics tracking
      await waitFor(() => {
        expect(OfflineAnalytics.getInstance().trackEvent).toHaveBeenCalledWith(
          'assessment_updated',
          expect.any(Object)
        );
      });
    });

    it('handles errors correctly', async () => {
      // Mock error scenario
      (OfflineAnalytics.getInstance as jest.Mock).mockReturnValue({
        getAssessments: jest.fn().mockRejectedValue(new Error('Failed to load')),
        trackEvent: jest.fn()
      });

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm assessmentId="1" />
        </AssessmentProvider>
      );

      await waitFor(() => {
        expect(AlertService.getInstance().addAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            message: expect.any(String)
          })
        );
      });
    });

    it('exports assessment data correctly', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm assessmentId="1" />
        </AssessmentProvider>
      );

      const exportButton = screen.getByRole('button', { name: /Export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(ExportService.getInstance().exportData).toHaveBeenCalled();
        expect(OfflineAnalytics.getInstance().trackEvent).toHaveBeenCalledWith(
          'assessment_exported',
          expect.any(Object)
        );
      });
    });

    it('updates analytics settings correctly', async () => {
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm assessmentId="1" />
        </AssessmentProvider>
      );

      const settingsButton = screen.getByRole('button', { name: /Settings/i });
      fireEvent.click(settingsButton);

      // Update refresh interval
      const refreshInput = screen.getByLabelText(/Refresh Interval/i);
      fireEvent.change(refreshInput, { target: { value: '10000' } });

      await waitFor(() => {
        expect(SettingsService.getInstance().saveSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            refreshInterval: 10000
          })
        );
      });
    });
  });
});
