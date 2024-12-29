import { WorkflowService } from '../../services/workflow-service';
import { mockTask, mockSession, createMockTask } from '../utils/test-helpers';

describe('WorkflowService', () => {
  let workflowService: WorkflowService;

  beforeEach(() => {
    workflowService = new WorkflowService();
  });

  describe('createWorkflow', () => {
    it('creates a new workflow with valid configuration', async () => {
      const workflow = await workflowService.createWorkflow({
        name: 'Test Workflow',
        steps: [
          {
            type: 'TASK',
            name: 'Create Task',
            config: {
              template: mockTask,
            },
          },
        ],
      });

      expect(workflow).toMatchObject({
        name: 'Test Workflow',
        steps: expect.arrayContaining([
          expect.objectContaining({
            type: 'TASK',
            name: 'Create Task',
          }),
        ]),
      });
    });

    it('validates workflow configuration before creation', async () => {
      await expect(
        workflowService.createWorkflow({
          name: '',
          steps: [],
        })
      ).rejects.toThrow('Workflow name is required');
    });
  });

  describe('executeWorkflow', () => {
    it('executes workflow steps in order', async () => {
      const workflow = await workflowService.createWorkflow({
        name: 'Test Workflow',
        steps: [
          {
            type: 'TASK',
            name: 'Create Task',
            config: {
              template: mockTask,
            },
          },
          {
            type: 'QUALITY_CHECK',
            name: 'Verify Task',
            config: {
              checks: ['COMPLETENESS', 'ACCURACY'],
            },
          },
        ],
      });

      const result = await workflowService.executeWorkflow(workflow.id, {
        session: mockSession,
      });

      expect(result.status).toBe('COMPLETED');
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].status).toBe('COMPLETED');
      expect(result.steps[1].status).toBe('COMPLETED');
    });

    it('handles step failures appropriately', async () => {
      const workflow = await workflowService.createWorkflow({
        name: 'Test Workflow',
        steps: [
          {
            type: 'TASK',
            name: 'Create Task',
            config: {
              template: createMockTask({ status: 'FAILED' }),
            },
          },
        ],
      });

      const result = await workflowService.executeWorkflow(workflow.id, {
        session: mockSession,
      });

      expect(result.status).toBe('FAILED');
      expect(result.steps[0].status).toBe('FAILED');
      expect(result.error).toBeDefined();
    });

    it('supports conditional branching in workflows', async () => {
      const workflow = await workflowService.createWorkflow({
        name: 'Conditional Workflow',
        steps: [
          {
            type: 'CONDITION',
            name: 'Check Priority',
            config: {
              condition: 'task.priority === "HIGH"',
              onTrue: ['step-2'],
              onFalse: ['step-3'],
            },
          },
          {
            id: 'step-2',
            type: 'NOTIFICATION',
            name: 'High Priority Notice',
            config: {
              template: 'HIGH_PRIORITY_TASK',
            },
          },
          {
            id: 'step-3',
            type: 'NOTIFICATION',
            name: 'Normal Priority Notice',
            config: {
              template: 'NORMAL_PRIORITY_TASK',
            },
          },
        ],
      });

      const result = await workflowService.executeWorkflow(workflow.id, {
        session: mockSession,
        task: createMockTask({ priority: 'HIGH' }),
      });

      expect(result.steps).toHaveLength(2);
      expect(result.steps[1].name).toBe('High Priority Notice');
    });
  });

  describe('validateWorkflow', () => {
    it('validates workflow configuration', () => {
      const result = workflowService.validateWorkflow({
        name: 'Test Workflow',
        steps: [
          {
            type: 'TASK',
            name: 'Create Task',
            config: {
              template: mockTask,
            },
          },
        ],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects invalid workflow configurations', () => {
      const result = workflowService.validateWorkflow({
        name: '',
        steps: [
          {
            type: 'INVALID_TYPE',
            name: '',
            config: {},
          },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Workflow name is required');
      expect(result.errors).toContain('Invalid step type: INVALID_TYPE');
    });

    it('validates step connections', () => {
      const result = workflowService.validateWorkflow({
        name: 'Test Workflow',
        steps: [
          {
            type: 'CONDITION',
            name: 'Check Priority',
            config: {
              condition: 'task.priority === "HIGH"',
              onTrue: ['non-existent-step'],
              onFalse: ['step-2'],
            },
          },
          {
            id: 'step-2',
            type: 'NOTIFICATION',
            name: 'Normal Priority Notice',
            config: {
              template: 'NORMAL_PRIORITY_TASK',
            },
          },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid step reference: non-existent-step');
    });
  });
});
