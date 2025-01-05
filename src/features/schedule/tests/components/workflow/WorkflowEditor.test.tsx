import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkflowEditor } from '../../../components/workflow/WorkflowEditor';
import { mockTask } from '../../utils/test-helpers';

describe('WorkflowEditor', () => {
  const defaultProps = {
    initialWorkflow: {
      id: 'workflow-1',
      name: 'Test Workflow',
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workflow editor with initial workflow', () => {
    render(<WorkflowEditor {...defaultProps} />);
    
    expect(screen.getByText('Test Workflow')).toBeInTheDocument();
    expect(screen.getByText('Add Step')).toBeInTheDocument();
  });

  it('adds new step when "Add Step" is clicked', () => {
    render(<WorkflowEditor {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Add Step'));
    
    expect(screen.getByText('Configure Step')).toBeInTheDocument();
    expect(screen.getByLabelText('Step Type')).toBeInTheDocument();
  });

  it('saves workflow when save button is clicked', () => {
    render(<WorkflowEditor {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Save Workflow'));
    
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      id: 'workflow-1',
      name: 'Test Workflow',
    }));
  });

  it('validates workflow before saving', () => {
    render(<WorkflowEditor {...defaultProps} />);
    
    // Try to save without required fields
    fireEvent.change(screen.getByLabelText('Workflow Name'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Save Workflow'));
    
    expect(screen.getByText('Workflow name is required')).toBeInTheDocument();
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it('cancels editing when cancel button is clicked', () => {
    render(<WorkflowEditor {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('updates step configuration when step is edited', () => {
    const workflowWithStep = {
      ...defaultProps.initialWorkflow,
      steps: [{
        id: 'step-1',
        type: 'TASK',
        name: 'Create Task',
        config: {},
      }],
    };
    
    render(<WorkflowEditor {...defaultProps} initialWorkflow={workflowWithStep} />);
    
    fireEvent.click(screen.getByText('Create Task'));
    fireEvent.change(screen.getByLabelText('Step Name'), {
      target: { value: 'Updated Task' },
    });
    fireEvent.click(screen.getByText('Save Step'));
    
    expect(screen.getByText('Updated Task')).toBeInTheDocument();
  });

  it('deletes step when delete button is clicked', () => {
    const workflowWithStep = {
      ...defaultProps.initialWorkflow,
      steps: [{
        id: 'step-1',
        type: 'TASK',
        name: 'Create Task',
        config: {},
      }],
    };
    
    render(<WorkflowEditor {...defaultProps} initialWorkflow={workflowWithStep} />);
    
    fireEvent.click(screen.getByLabelText('Delete Step'));
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });

  it('reorders steps using drag and drop', () => {
    const workflowWithSteps = {
      ...defaultProps.initialWorkflow,
      steps: [
        {
          id: 'step-1',
          type: 'TASK',
          name: 'First Task',
          config: {},
        },
        {
          id: 'step-2',
          type: 'NOTIFICATION',
          name: 'Send Notification',
          config: {},
        },
      ],
    };
    
    render(<WorkflowEditor {...defaultProps} initialWorkflow={workflowWithSteps} />);
    
    const firstStep = screen.getByText('First Task').closest('[draggable="true"]');
    const secondStep = screen.getByText('Send Notification').closest('[draggable="true"]');
    
    fireEvent.dragStart(firstStep!);
    fireEvent.dragOver(secondStep!);
    fireEvent.drop(secondStep!);
    
    const steps = screen.getAllByRole('listitem');
    expect(steps[0]).toHaveTextContent('Send Notification');
    expect(steps[1]).toHaveTextContent('First Task');
  });
});
