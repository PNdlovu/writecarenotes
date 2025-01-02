/**
 * WriteCareNotes.com
 * @fileoverview Emergency Module Utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { 
  EmergencyIncident,
  EmergencyProtocol,
  EmergencyAction,
  EmergencyType,
  EmergencyStatus,
  EmergencySeverity
} from '../types';

/**
 * Validates an emergency incident for required fields and data integrity
 */
export function validateIncident(incident: EmergencyIncident): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields validation
  if (!incident.type) errors.push('Emergency type is required');
  if (!incident.status) errors.push('Status is required');
  if (!incident.severity) errors.push('Severity level is required');
  if (!incident.title) errors.push('Title is required');
  if (!incident.description) errors.push('Description is required');
  if (!incident.location) errors.push('Location is required');
  if (!incident.careHomeId) errors.push('Care home ID is required');
  if (!incident.startedAt) errors.push('Start time is required');
  if (!incident.responders || incident.responders.length === 0) {
    errors.push('At least one responder is required');
  }

  // Status-specific validation
  if (incident.status === 'RESOLVED' && !incident.resolvedAt) {
    errors.push('Resolution time is required for resolved incidents');
  }

  // Protocol validation if specified
  if (incident.protocolId && !incident.protocol) {
    errors.push('Protocol details are required when protocol ID is specified');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Calculates the response time for an emergency incident
 */
export function calculateResponseTime(incident: EmergencyIncident): number {
  if (!incident.timeline || incident.timeline.length === 0) return 0;

  const firstResponse = incident.timeline.find(action => 
    action.type === 'RESPONSE_INITIATED' || action.type === 'RESPONDER_ARRIVED'
  );

  if (!firstResponse) return 0;

  return Math.round(
    (firstResponse.performedAt.getTime() - incident.startedAt.getTime()) / 1000 / 60
  ); // Returns minutes
}

/**
 * Determines if an incident requires immediate escalation
 */
export function requiresEscalation(incident: EmergencyIncident): boolean {
  const criticalConditions = [
    incident.severity === 'CRITICAL',
    calculateResponseTime(incident) > getMaxResponseTime(incident.type),
    !incident.responders.some(r => isAvailable(r)),
    incident.affectedResidents.length > 3
  ];

  return criticalConditions.some(condition => condition);
}

/**
 * Gets the maximum response time based on emergency type
 */
function getMaxResponseTime(type: EmergencyType): number {
  const responseTimeLimits: Record<EmergencyType, number> = {
    MEDICAL: 5,
    MEDICATION: 10,
    FIRE: 3,
    SECURITY: 5,
    NATURAL_DISASTER: 15,
    INFRASTRUCTURE: 30,
    OTHER: 20
  };

  return responseTimeLimits[type];
}

/**
 * Formats an incident timeline for display
 */
export function formatTimeline(actions: EmergencyAction[]): string[] {
  return actions
    .sort((a, b) => a.performedAt.getTime() - b.performedAt.getTime())
    .map(action => {
      const time = action.performedAt.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${time} - ${action.description} (${action.performedBy})`;
    });
}

/**
 * Checks if a protocol is due for review
 */
export function isProtocolDueForReview(protocol: EmergencyProtocol): boolean {
  const nextReview = new Date(protocol.nextReview);
  const today = new Date();
  return nextReview <= today;
}

/**
 * Generates a summary of an emergency incident
 */
export function generateIncidentSummary(incident: EmergencyIncident): string {
  const duration = incident.resolvedAt
    ? Math.round((incident.resolvedAt.getTime() - incident.startedAt.getTime()) / 1000 / 60)
    : null;

  const summary = [
    `[${incident.severity}] ${incident.type} Emergency`,
    `Location: ${incident.location}`,
    `Started: ${formatDateTime(incident.startedAt)}`,
    `Status: ${incident.status}`,
    `Affected Residents: ${incident.affectedResidents.length}`,
    `Responders: ${incident.responders.length}`,
    duration ? `Duration: ${formatDuration(duration)}` : 'Ongoing',
    incident.protocol ? `Protocol: ${incident.protocol.title}` : 'No Protocol Applied'
  ];

  return summary.join('\n');
}

/**
 * Formats a date and time string
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a duration in minutes to a readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours} hours ${remainingMinutes} minutes`
    : `${hours} hours`;
}

/**
 * Determines the appropriate emergency type based on incident description
 */
export function determineEmergencyType(description: string): EmergencyType {
  const keywords: Record<EmergencyType, string[]> = {
    MEDICAL: ['injury', 'pain', 'unconscious', 'breathing', 'heart', 'fall', 'collapsed'],
    MEDICATION: ['medication', 'drug', 'overdose', 'missed dose', 'wrong medication'],
    FIRE: ['fire', 'smoke', 'burning', 'flames', 'evacuation'],
    SECURITY: ['intruder', 'suspicious', 'theft', 'missing', 'wandering'],
    NATURAL_DISASTER: ['flood', 'storm', 'earthquake', 'weather', 'power outage'],
    INFRASTRUCTURE: ['leak', 'power', 'water', 'heating', 'cooling', 'elevator'],
    OTHER: []
  };

  const lowerDesc = description.toLowerCase();
  for (const [type, words] of Object.entries(keywords)) {
    if (words.some(word => lowerDesc.includes(word))) {
      return type as EmergencyType;
    }
  }

  return 'OTHER';
}

/**
 * Determines the appropriate severity level based on incident details
 */
export function determineSeverity(incident: Partial<EmergencyIncident>): EmergencySeverity {
  if (!incident.type || !incident.description) return 'MEDIUM';

  const criticalConditions = [
    incident.type === 'MEDICAL' && /unconscious|breathing|heart|severe|critical/.test(incident.description.toLowerCase()),
    incident.type === 'FIRE' && /spreading|uncontrolled|multiple/.test(incident.description.toLowerCase()),
    incident.type === 'SECURITY' && /violence|weapon|immediate|threat/.test(incident.description.toLowerCase()),
    incident.affectedResidents && incident.affectedResidents.length > 3
  ];

  if (criticalConditions.some(condition => condition)) return 'CRITICAL';

  const highConditions = [
    incident.type === 'MEDICAL' && /injury|pain|fall/.test(incident.description.toLowerCase()),
    incident.type === 'MEDICATION' && /overdose|wrong|missed/.test(incident.description.toLowerCase()),
    incident.type === 'INFRASTRUCTURE' && /complete|total|all/.test(incident.description.toLowerCase()),
    incident.affectedResidents && incident.affectedResidents.length > 1
  ];

  if (highConditions.some(condition => condition)) return 'HIGH';

  const lowConditions = [
    incident.type === 'INFRASTRUCTURE' && /partial|minor|single/.test(incident.description.toLowerCase()),
    incident.type === 'OTHER' && !/urgent|immediate|serious/.test(incident.description.toLowerCase()),
    incident.affectedResidents && incident.affectedResidents.length === 0
  ];

  if (lowConditions.some(condition => condition)) return 'LOW';

  return 'MEDIUM';
}

/**
 * Checks if a staff member is available for emergency response
 */
function isAvailable(staffId: string): boolean {
  // This is a placeholder function that should be implemented
  // based on the staff scheduling and availability system
  return true;
}

/**
 * Determines if an incident can be marked as resolved
 */
export function canResolveIncident(incident: EmergencyIncident): { resolvable: boolean; reason?: string } {
  if (incident.status === 'RESOLVED') {
    return { resolvable: false, reason: 'Incident is already resolved' };
  }

  if (!incident.timeline || incident.timeline.length === 0) {
    return { resolvable: false, reason: 'No actions have been recorded' };
  }

  const requiredActions = incident.protocol?.steps.filter(step => step.isRequired) || [];
  const completedActions = new Set(
    incident.timeline
      .filter(action => action.status === 'COMPLETED')
      .map(action => action.type)
  );

  const missingActions = requiredActions.filter(
    step => !completedActions.has(step.id)
  );

  if (missingActions.length > 0) {
    return {
      resolvable: false,
      reason: `Required actions not completed: ${missingActions.map(a => a.title).join(', ')}`
    };
  }

  return { resolvable: true };
} 