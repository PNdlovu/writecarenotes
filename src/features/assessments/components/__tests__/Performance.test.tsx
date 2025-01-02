import { render, screen, fireEvent } from '@testing-library/react';
import { AssessmentProvider } from '../../context/AssessmentContext';
import { SpecialNeedsAssessmentForm } from '../special-needs/SpecialNeedsAssessmentForm';
import { AssessmentDashboard } from '../dashboard/AssessmentDashboard';
import * as assessmentApi from '../../api/assessmentApi';

jest.mock('../../api/assessmentApi');
const mockedAssessmentApi = assessmentApi as jest.Mocked<typeof assessmentApi>;

describe('Special Needs Assessment Performance', () => {
  // Create a large dataset
  const createLargeDataset = (size: number) => {
    return Array(size).fill(null).map((_, index) => ({
      id: `test-${index}`,
      residentId: `R${index}`,
      assessorId: `A${index}`,
      dateCreated: new Date('2025-01-01'),
      lastModified: new Date('2025-01-01'),
      status: 'draft',
      communication: {
        primaryMethod: `method-${index}`,
        alternativeMethods: Array(10).fill(`alt-${index}`),
        assistiveTechnology: Array(10).fill(`tech-${index}`),
        communicationPreferences: Array(10).fill(`pref-${index}`),
      },
      mobility: {
        mobilityAids: Array(10).fill(`aid-${index}`),
        transferAssistance: 'maximum',
        environmentalModifications: Array(10).fill(`mod-${index}`),
        safetyConsiderations: Array(10).fill(`safety-${index}`),
      },
      sensory: {
        visual: {
          impairments: Array(10).fill(`imp-${index}`),
          aids: Array(10).fill(`aid-${index}`),
          accommodations: Array(10).fill(`acc-${index}`),
        },
        auditory: {
          impairments: Array(10).fill(`imp-${index}`),
          aids: Array(10).fill(`aid-${index}`),
          accommodations: Array(10).fill(`acc-${index}`),
        },
        tactile: {
          sensitivities: Array(10).fill(`sens-${index}`),
          preferences: Array(10).fill(`pref-${index}`),
          accommodations: Array(10).fill(`acc-${index}`),
        },
      },
      cognitive: {
        comprehensionLevel: `level-${index}`,
        memorySupports: Array(10).fill(`support-${index}`),
        learningStyle: `style-${index}`,
        adaptations: Array(10).fill(`adaptation-${index}`),
      },
      progress: {
        goals: Array(10).fill({
          description: `goal-${index}`,
          strategies: Array(10).fill(`strategy-${index}`),
          progress: `progress-${index}`,
        }),
        observations: Array(10).fill(`obs-${index}`),
        adaptationEffectiveness: Array(10).fill(`effectiveness-${index}`),
      },
    }));
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear performance marks
    performance.clearMarks();
    performance.clearMeasures();
  });

  describe('Dashboard Performance', () => {
    it('renders large dataset within performance budget', async () => {
      const largeDataset = createLargeDataset(1000);
      mockedAssessmentApi.fetchAssessments.mockResolvedValue(largeDataset);

      performance.mark('start-render');
      
      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      performance.mark('end-render');
      performance.measure('render-time', 'start-render', 'end-render');

      const renderTime = performance.getEntriesByName('render-time')[0];
      expect(renderTime.duration).toBeLessThan(1000); // 1 second budget
    });

    it('maintains scroll performance with large dataset', async () => {
      const largeDataset = createLargeDataset(1000);
      mockedAssessmentApi.fetchAssessments.mockResolvedValue(largeDataset);

      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      const container = screen.getByTestId('assessment-table');
      
      performance.mark('start-scroll');
      
      // Simulate rapid scrolling
      for (let i = 0; i < 100; i++) {
        fireEvent.scroll(container, { target: { scrollTop: i * 100 } });
      }

      performance.mark('end-scroll');
      performance.measure('scroll-time', 'start-scroll', 'end-scroll');

      const scrollTime = performance.getEntriesByName('scroll-time')[0];
      expect(scrollTime.duration).toBeLessThan(500); // 500ms budget
    });

    it('handles rapid filtering and sorting', async () => {
      const largeDataset = createLargeDataset(1000);
      mockedAssessmentApi.fetchAssessments.mockResolvedValue(largeDataset);

      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      performance.mark('start-operations');

      // Rapid status filter changes
      const statusFilter = screen.getByLabelText('Status Filter');
      ['draft', 'in_progress', 'completed', 'archived'].forEach((status) => {
        fireEvent.change(statusFilter, { target: { value: status } });
      });

      // Rapid column sorting
      const columns = ['Date Created', 'Status', 'Resident ID'];
      columns.forEach((column) => {
        const header = screen.getByText(column);
        fireEvent.click(header); // Sort ascending
        fireEvent.click(header); // Sort descending
      });

      performance.mark('end-operations');
      performance.measure('operation-time', 'start-operations', 'end-operations');

      const operationTime = performance.getEntriesByName('operation-time')[0];
      expect(operationTime.duration).toBeLessThan(300); // 300ms budget
    });
  });

  describe('Form Performance', () => {
    it('maintains input responsiveness with many fields', async () => {
      const assessment = createLargeDataset(1)[0];

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={assessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const input = screen.getByLabelText('Primary Method');
      
      performance.mark('start-input');
      
      // Simulate rapid typing
      for (let i = 0; i < 100; i++) {
        fireEvent.change(input, { target: { value: `test-${i}` } });
      }

      performance.mark('end-input');
      performance.measure('input-time', 'start-input', 'end-input');

      const inputTime = performance.getEntriesByName('input-time')[0];
      expect(inputTime.duration).toBeLessThan(200); // 200ms budget
    });

    it('handles rapid tab switching efficiently', async () => {
      const assessment = createLargeDataset(1)[0];

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={assessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const tabs = [
        'Communication',
        'Mobility',
        'Sensory',
        'Cognitive',
        'Behavioral',
        'Progress',
      ];

      performance.mark('start-tabs');

      // Rapid tab switching
      for (let i = 0; i < 50; i++) {
        tabs.forEach((tab) => {
          const tabElement = screen.getByText(tab);
          fireEvent.click(tabElement);
        });
      }

      performance.mark('end-tabs');
      performance.measure('tab-time', 'start-tabs', 'end-tabs');

      const tabTime = performance.getEntriesByName('tab-time')[0];
      expect(tabTime.duration).toBeLessThan(1000); // 1 second budget
    });

    it('maintains performance during form validation', async () => {
      const assessment = createLargeDataset(1)[0];

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={assessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      const saveButton = screen.getByText('Save Assessment');

      performance.mark('start-validation');
      
      // Trigger multiple validations
      for (let i = 0; i < 50; i++) {
        fireEvent.click(saveButton);
      }

      performance.mark('end-validation');
      performance.measure('validation-time', 'start-validation', 'end-validation');

      const validationTime = performance.getEntriesByName('validation-time')[0];
      expect(validationTime.duration).toBeLessThan(500); // 500ms budget
    });
  });

  describe('Memory Usage', () => {
    it('maintains stable memory usage with large datasets', async () => {
      const largeDataset = createLargeDataset(1000);
      mockedAssessmentApi.fetchAssessments.mockResolvedValue(largeDataset);

      // Initial memory
      const initialMemory = (performance as any).memory?.usedJSHeapSize;

      render(
        <AssessmentProvider>
          <AssessmentDashboard onCreateAssessment={() => {}} />
        </AssessmentProvider>
      );

      // Final memory
      const finalMemory = (performance as any).memory?.usedJSHeapSize;

      // Check memory increase is within acceptable range (50MB)
      if (initialMemory && finalMemory) {
        const memoryIncrease = finalMemory - initialMemory;
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });

  describe('Network Performance', () => {
    it('optimizes API request batching', async () => {
      const assessment = createLargeDataset(1)[0];
      let requestCount = 0;

      mockedAssessmentApi.updateAssessment.mockImplementation(async () => {
        requestCount++;
        return assessment;
      });

      render(
        <AssessmentProvider>
          <SpecialNeedsAssessmentForm
            initialData={assessment}
            onSave={jest.fn()}
            onCancel={jest.fn()}
          />
        </AssessmentProvider>
      );

      // Simulate rapid changes
      const input = screen.getByLabelText('Primary Method');
      for (let i = 0; i < 100; i++) {
        fireEvent.change(input, { target: { value: `test-${i}` } });
      }

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check that requests were batched
      expect(requestCount).toBeLessThan(5);
    });
  });
});
