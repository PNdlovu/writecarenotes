import React, { useState, useEffect } from 'react';
import { Workflow, WorkflowStep, WorkflowService } from '../../services/workflow-service';
import {
  Button,
  Card,
  Dialog,
  Dropdown,
  Icon,
  Input,
  Select,
  Switch,
  Tabs,
} from '@/components/ui';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface WorkflowEditorProps {
  workflowId?: string;
  tenantId: string;
  department?: string;
  onSave: (workflow: Workflow) => void;
  onCancel: () => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  workflowId,
  tenantId,
  department,
  onSave,
  onCancel,
}) => {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: workflowId || '',
    name: '',
    description: '',
    triggerEvent: 'SESSION_START',
    steps: [],
    enabled: true,
    tenantId,
    department,
  });

  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const workflowService = WorkflowService.getInstance();

  useEffect(() => {
    if (workflowId) {
      loadWorkflow();
    }
  }, [workflowId]);

  const loadWorkflow = async () => {
    if (workflowId) {
      const loadedWorkflow = await workflowService.getWorkflow(workflowId);
      setWorkflow(loadedWorkflow);
    }
  };

  const handleSave = async () => {
    const validation = await workflowService.validateWorkflow(workflow);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(workflow);
  };

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: 'New Step',
      type: 'TASK',
      config: {},
      actions: [],
      nextSteps: [],
    };

    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
    });
    setActiveStep(newStep.id);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const deleteStep = (stepId: string) => {
    setWorkflow({
      ...workflow,
      steps: workflow.steps.filter(step => step.id !== stepId),
    });
    setActiveStep(null);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const steps = Array.from(workflow.steps);
    const [reorderedStep] = steps.splice(result.source.index, 1);
    steps.splice(result.destination.index, 0, reorderedStep);

    setWorkflow({
      ...workflow,
      steps,
    });
  };

  return (
    <div className="flex h-full">
      {/* Left Panel - Steps List */}
      <div className="w-1/3 border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Workflow Steps</h2>
          <Button onClick={addStep} variant="primary" size="sm">
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {workflow.steps.map((step, index) => (
                  <Draggable key={step.id} draggableId={step.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card
                          className={`cursor-pointer ${
                            activeStep === step.id ? 'border-blue-500' : ''
                          }`}
                          onClick={() => setActiveStep(step.id)}
                        >
                          <div className="flex items-center justify-between p-3">
                            <div>
                              <h3 className="font-medium">{step.name}</h3>
                              <p className="text-sm text-gray-500">
                                {step.type}
                              </p>
                            </div>
                            <Icon
                              name="grip-vertical"
                              className="w-4 h-4 text-gray-400"
                            />
                          </div>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Right Panel - Step Editor */}
      <div className="flex-1 p-4">
        {activeStep ? (
          <StepEditor
            step={workflow.steps.find(s => s.id === activeStep)!}
            onUpdate={(updates) => updateStep(activeStep, updates)}
            onDelete={() => deleteStep(activeStep)}
            availableSteps={workflow.steps.filter(s => s.id !== activeStep)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Icon name="workflow" className="w-16 h-16 mb-4" />
            <p>Select a step to edit its details</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div>
            {errors.length > 0 && (
              <div className="text-red-500 text-sm">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Workflow
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StepEditorProps {
  step: WorkflowStep;
  onUpdate: (updates: Partial<WorkflowStep>) => void;
  onDelete: () => void;
  availableSteps: WorkflowStep[];
}

const StepEditor: React.FC<StepEditorProps> = ({
  step,
  onUpdate,
  onDelete,
  availableSteps,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Edit Step</h2>
        <Button variant="danger" size="sm" onClick={onDelete}>
          <Icon name="trash" className="w-4 h-4 mr-2" />
          Delete Step
        </Button>
      </div>

      <Tabs>
        <Tabs.Tab label="Basic">
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                value={step.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Enter step name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <Select
                value={step.type}
                onChange={(e) => onUpdate({ type: e.target.value as any })}
              >
                <option value="APPROVAL">Approval</option>
                <option value="NOTIFICATION">Notification</option>
                <option value="TASK">Task</option>
                <option value="QUALITY_CHECK">Quality Check</option>
                <option value="CUSTOM">Custom</option>
              </Select>
            </div>
          </div>
        </Tabs.Tab>

        <Tabs.Tab label="Conditions">
          <div className="p-4">
            <ConditionEditor
              conditions={step.conditions || []}
              onChange={(conditions) => onUpdate({ conditions })}
            />
          </div>
        </Tabs.Tab>

        <Tabs.Tab label="Actions">
          <div className="p-4">
            <ActionEditor
              actions={step.actions}
              onChange={(actions) => onUpdate({ actions })}
            />
          </div>
        </Tabs.Tab>

        <Tabs.Tab label="Next Steps">
          <div className="p-4">
            <NextStepEditor
              nextSteps={step.nextSteps}
              availableSteps={availableSteps}
              onChange={(nextSteps) => onUpdate({ nextSteps })}
            />
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

// Implement other sub-components (ConditionEditor, ActionEditor, NextStepEditor)
// as needed for the workflow editor functionality
