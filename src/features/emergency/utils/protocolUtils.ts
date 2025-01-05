import { EmergencyProtocol, EmergencyType, EmergencyIncident, EmergencyAction } from '../types';
import { protocolTemplates } from '../data/protocolTemplates';

export const getProtocolTemplate = (type: EmergencyType): EmergencyProtocol => {
  return protocolTemplates[type];
};

export const validateProtocolCompletion = (
  protocol: EmergencyProtocol,
  actions: EmergencyAction[]
): { 
  isComplete: boolean;
  completedSteps: string[];
  pendingSteps: string[];
  progress: number;
} => {
  const completedSteps: string[] = [];
  const pendingSteps: string[] = [];

  protocol.steps.forEach(step => {
    const stepActions = actions.filter(action => 
      action.protocolStepId === step.id
    );

    const isStepComplete = step.completionCriteria.every(criteria =>
      stepActions.some(action => 
        action.details.toLowerCase().includes(criteria.toLowerCase())
      )
    );

    if (isStepComplete) {
      completedSteps.push(step.id);
    } else {
      pendingSteps.push(step.id);
    }
  });

  const progress = (completedSteps.length / protocol.steps.length) * 100;

  return {
    isComplete: pendingSteps.length === 0,
    completedSteps,
    pendingSteps,
    progress
  };
};

export const getNextRequiredAction = (
  protocol: EmergencyProtocol,
  actions: EmergencyAction[]
): {
  stepId: string;
  stepTitle: string;
  description: string;
  timeLimit: number;
  completionCriteria: string[];
} | null => {
  const validation = validateProtocolCompletion(protocol, actions);
  
  if (validation.isComplete) {
    return null;
  }

  const nextStep = protocol.steps.find(step => 
    validation.pendingSteps.includes(step.id)
  );

  if (!nextStep) {
    return null;
  }

  return {
    stepId: nextStep.id,
    stepTitle: nextStep.title,
    description: nextStep.description,
    timeLimit: nextStep.timeLimit,
    completionCriteria: nextStep.completionCriteria
  };
};

export const checkProtocolEscalation = (
  incident: EmergencyIncident,
  actions: EmergencyAction[]
): {
  shouldEscalate: boolean;
  reason: string;
  nextEscalationLevel: string;
} => {
  const protocol = incident.protocol;
  const validation = validateProtocolCompletion(protocol, actions);
  const currentTime = new Date();
  const incidentDuration = (currentTime.getTime() - incident.startTime.getTime()) / (1000 * 60); // in minutes

  // Check if any steps are overdue
  const overdueSteps = protocol.steps.filter(step => {
    const stepActions = actions.filter(action => action.protocolStepId === step.id);
    if (stepActions.length === 0 && step.isRequired) {
      const stepDeadline = step.timeLimit;
      return incidentDuration > stepDeadline;
    }
    return false;
  });

  if (overdueSteps.length > 0) {
    const currentEscalationIndex = protocol.escalationPath.indexOf(incident.currentEscalationLevel);
    const nextEscalationLevel = protocol.escalationPath[currentEscalationIndex + 1];

    return {
      shouldEscalate: true,
      reason: `Steps overdue: ${overdueSteps.map(step => step.title).join(', ')}`,
      nextEscalationLevel: nextEscalationLevel || incident.currentEscalationLevel
    };
  }

  // Check if progress is too slow
  const expectedProgress = (incidentDuration / protocol.steps.reduce((acc, step) => acc + step.timeLimit, 0)) * 100;
  if (validation.progress < expectedProgress * 0.7) { // If progress is less than 70% of expected
    const currentEscalationIndex = protocol.escalationPath.indexOf(incident.currentEscalationLevel);
    const nextEscalationLevel = protocol.escalationPath[currentEscalationIndex + 1];

    return {
      shouldEscalate: true,
      reason: 'Progress slower than expected',
      nextEscalationLevel: nextEscalationLevel || incident.currentEscalationLevel
    };
  }

  return {
    shouldEscalate: false,
    reason: '',
    nextEscalationLevel: incident.currentEscalationLevel
  };
};

export const generateProtocolSummary = (
  incident: EmergencyIncident,
  actions: EmergencyAction[]
): string => {
  const validation = validateProtocolCompletion(incident.protocol, actions);
  const escalation = checkProtocolEscalation(incident, actions);
  
  const summary = [
    `Emergency Type: ${incident.type}`,
    `Status: ${incident.status}`,
    `Progress: ${Math.round(validation.progress)}%`,
    `Completed Steps: ${validation.completedSteps.length}/${incident.protocol.steps.length}`,
    escalation.shouldEscalate ? `Escalation Required: ${escalation.reason}` : 'No Escalation Required',
    `Current Escalation Level: ${incident.currentEscalationLevel}`,
    incident.resolution ? `Resolution: ${incident.resolution}` : 'Ongoing'
  ].join('\n');

  return summary;
};
