import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssessmentProvider } from '../../context/AssessmentContext';
import { SpecialNeedsAssessmentForm } from '../special-needs/SpecialNeedsAssessmentForm';
import { AssessmentDashboard } from '../dashboard/AssessmentDashboard';
import * as assessmentApi from '../../api/assessmentApi';

jest.mock('../../api/assessmentApi');
const mockedAssessmentApi = assessmentApi as jest.Mocked<typeof assessmentApi>;

describe('Special Needs Assessment Integration', () => {
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
  });

  describe('Complete Assessment Workflow', () => {
    it('completes full assessment lifecycle', async () => {
      // Mock API responses
      mockedAssessmentApi.fetchAssessments.mockResolvedValue([mockAssessment]);
      mockedAssessmentApi.createAssessment.mockResolvedValue(mockAssessment);
      mockedAssessmentApi.updateAssessment.mockResolvedValue({
        ...mockAssessment,
        status: 'completed',
      });

      // Step 1: Render dashboard and create new assessment
      const { rerender } = render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(mockAssessment.residentId)).toBeInTheDocument();
      });

      // Step 2: Navigate to create form
      const newButton = screen.getByText('New Assessment');
      fireEvent.click(newButton);

      // Step 3: Fill out assessment form
      rerender(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      // Fill Communication Section
      const primaryMethodInput = screen.getByLabelText('Primary Method');
      await userEvent.type(primaryMethodInput, 'verbal');

      // Add Alternative Method
      const addMethodButton = screen.getByText('Add Alternative Method');
      fireEvent.click(addMethodButton);
      const methodInput = screen.getByPlaceholderText('Enter method');
      await userEvent.type(methodInput, 'sign language');

      // Fill Mobility Section
      const mobilityTab = screen.getByText('Mobility');
      fireEvent.click(mobilityTab);
      
      const transferSelect = screen.getByLabelText('Transfer Assistance Level');
      await userEvent.selectOptions(transferSelect, 'maximum');

      // Fill Cognitive Section
      const cognitiveTab = screen.getByText('Cognitive');
      fireEvent.click(cognitiveTab);

      const comprehensionSelect = screen.getByLabelText('Comprehension Level');
      await userEvent.selectOptions(comprehensionSelect, 'moderate');

      // Add Progress Goal
      const progressTab = screen.getByText('Progress');
      fireEvent.click(progressTab);

      const addGoalButton = screen.getByText('Add Goal');
      fireEvent.click(addGoalButton);
      
      const goalDescription = screen.getByLabelText('Goal Description');
      await userEvent.type(goalDescription, 'Improve mobility');

      // Save Assessment
      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedAssessmentApi.createAssessment).toHaveBeenCalled();
      });

      // Step 4: Verify saved assessment appears in dashboard
      rerender(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(mockAssessment.residentId)).toBeInTheDocument();
      });
    });

    it('handles assessment modifications and updates', async () => {
      // Mock API responses
      mockedAssessmentApi.fetchAssessments.mockResolvedValue([mockAssessment]);
      mockedAssessmentApi.fetchAssessmentById.mockResolvedValue(mockAssessment);
      mockedAssessmentApi.updateAssessment.mockResolvedValue({
        ...mockAssessment,
        communication: {
          ...mockAssessment.communication,
          primaryMethod: 'updated method',
        },
      });

      // Step 1: Load existing assessment
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      // Step 2: Modify assessment
      const primaryMethodInput = screen.getByLabelText('Primary Method');
      await userEvent.clear(primaryMethodInput);
      await userEvent.type(primaryMethodInput, 'updated method');

      // Step 3: Save modifications
      const saveButton = screen.getByText('Save Assessment');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockedAssessmentApi.updateAssessment).toHaveBeenCalledWith(
          expect.objectContaining({
            communication: expect.objectContaining({
              primaryMethod: 'updated method',
            }),
          })
        );
      });
    });

    it('handles assessment review and approval workflow', async () => {
      // Mock API responses
      mockedAssessmentApi.fetchAssessments.mockResolvedValue([mockAssessment]);
      mockedAssessmentApi.updateAssessment
        .mockResolvedValueOnce({
          ...mockAssessment,
          status: 'under_review',
        })
        .mockResolvedValueOnce({
          ...mockAssessment,
          status: 'completed',
        });

      // Step 1: Submit for review
      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={mockAssessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const submitButton = screen.getByText('Submit for Review');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedAssessmentApi.updateAssessment).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'under_review',
          })
        );
      });

      // Step 2: Approve assessment
      const approveButton = screen.getByText('Approve');
      fireEvent.click(approveButton);

      await waitFor(() => {
        expect(mockedAssessmentApi.updateAssessment).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'completed',
          })
        );
      });
    });
  });

  describe('Assessment Data Persistence', () => {
    it('maintains form state during navigation', async () => {
      // Mock API responses
      mockedAssessmentApi.fetchAssessments.mockResolvedValue([mockAssessment]);

      // Step 1: Start filling form
      const { rerender } = render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      // Fill some data
      const primaryMethodInput = screen.getByLabelText('Primary Method');
      await userEvent.type(primaryMethodInput, 'test method');

      // Step 2: Navigate away
      rerender(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      // Step 3: Navigate back
      rerender(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      // Verify data persists
      expect(screen.getByLabelText('Primary Method')).toHaveValue('test method');
    });
  });

  describe('Assessment Export and Reporting', () => {
    it('generates PDF report with all sections', async () => {
      // Mock PDF generation
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      mockedAssessmentApi.exportAssessmentPDF.mockResolvedValue(mockBlob);

      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      // Find and click export button
      const actionsButton = screen.getByText('Actions');
      fireEvent.click(actionsButton);

      const exportButton = screen.getByText('Export PDF');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockedAssessmentApi.exportAssessmentPDF).toHaveBeenCalled();
      });
    });
  });
});
