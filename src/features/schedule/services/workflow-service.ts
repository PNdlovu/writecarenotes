import { HandoverSession, HandoverTask, Staff } from '../types/handover';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'APPROVAL' | 'NOTIFICATION' | 'TASK' | 'QUALITY_CHECK' | 'CUSTOM';
  config: Record<string, any>;
  conditions?: WorkflowCondition[];
  actions: WorkflowAction[];
  nextSteps: string[];
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface WorkflowAction {
  type: 'CREATE_TASK' | 'UPDATE_TASK' | 'SEND_NOTIFICATION' | 'TRIGGER_INTEGRATION' | 'CUSTOM';
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  triggerEvent: 'SESSION_START' | 'SESSION_END' | 'TASK_CREATED' | 'QUALITY_CHECK_FAILED';
  steps: WorkflowStep[];
  enabled: boolean;
  tenantId: string;
  department?: string;
}

export class WorkflowService {
  private static instance: WorkflowService;

  private constructor() {}

  static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  async createWorkflow(workflow: Omit<Workflow, 'id'>): Promise<Workflow> {
    const newWorkflow: Workflow = {
      ...workflow,
      id: crypto.randomUUID(),
    };
    // Implementation would save to database
    return newWorkflow;
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    // Implementation would update in database
    return {} as Workflow;
  }

  async deleteWorkflow(id: string): Promise<void> {
    // Implementation would delete from database
  }

  async getWorkflow(id: string): Promise<Workflow> {
    // Implementation would fetch from database
    return {} as Workflow;
  }

  async listWorkflows(params: {
    tenantId: string;
    department?: string;
    enabled?: boolean;
  }): Promise<Workflow[]> {
    // Implementation would list workflows from database
    return [];
  }

  async executeWorkflow(
    workflow: Workflow,
    context: {
      session?: HandoverSession;
      task?: HandoverTask;
      actor: Staff;
      data: Record<string, any>;
    }
  ): Promise<void> {
    for (const step of workflow.steps) {
      if (await this.evaluateConditions(step.conditions || [], context)) {
        await this.executeActions(step.actions, context);
        
        // Execute next steps recursively
        for (const nextStepId of step.nextSteps) {
          const nextStep = workflow.steps.find(s => s.id === nextStepId);
          if (nextStep) {
            await this.executeWorkflow(
              { ...workflow, steps: [nextStep] },
              context
            );
          }
        }
      }
    }
  }

  async validateWorkflow(workflow: Workflow): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check for circular dependencies
    if (this.hasCircularDependencies(workflow.steps)) {
      errors.push('Workflow contains circular dependencies');
    }

    // Validate step configurations
    for (const step of workflow.steps) {
      if (!this.isValidStepConfig(step)) {
        errors.push(`Invalid configuration for step: ${step.name}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private async evaluateConditions(
    conditions: WorkflowCondition[],
    context: Record<string, any>
  ): Promise<boolean> {
    for (const condition of conditions) {
      const fieldValue = this.getFieldValue(condition.field, context);
      
      switch (condition.operator) {
        case 'equals':
          if (fieldValue !== condition.value) return false;
          break;
        case 'notEquals':
          if (fieldValue === condition.value) return false;
          break;
        case 'contains':
          if (!String(fieldValue).includes(String(condition.value))) return false;
          break;
        case 'greaterThan':
          if (fieldValue <= condition.value) return false;
          break;
        case 'lessThan':
          if (fieldValue >= condition.value) return false;
          break;
      }
    }
    return true;
  }

  private async executeActions(
    actions: WorkflowAction[],
    context: Record<string, any>
  ): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'CREATE_TASK':
          await this.createTask(action.config, context);
          break;
        case 'UPDATE_TASK':
          await this.updateTask(action.config, context);
          break;
        case 'SEND_NOTIFICATION':
          await this.sendNotification(action.config, context);
          break;
        case 'TRIGGER_INTEGRATION':
          await this.triggerIntegration(action.config, context);
          break;
        case 'CUSTOM':
          await this.executeCustomAction(action.config, context);
          break;
      }
    }
  }

  private hasCircularDependencies(steps: WorkflowStep[]): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) return true;
      if (visited.has(stepId)) return false;

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find(s => s.id === stepId);
      if (step) {
        for (const nextStepId of step.nextSteps) {
          if (hasCycle(nextStepId)) return true;
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    return steps.some(step => hasCycle(step.id));
  }

  private isValidStepConfig(step: WorkflowStep): boolean {
    // Implementation would validate step configuration
    return true;
  }

  private getFieldValue(field: string, context: Record<string, any>): any {
    // Implementation would get field value from context
    return null;
  }

  private async createTask(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<void> {
    // Implementation would create task
  }

  private async updateTask(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<void> {
    // Implementation would update task
  }

  private async sendNotification(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<void> {
    // Implementation would send notification
  }

  private async triggerIntegration(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<void> {
    // Implementation would trigger integration
  }

  private async executeCustomAction(
    config: Record<string, any>,
    context: Record<string, any>
  ): Promise<void> {
    // Implementation would execute custom action
  }
}
