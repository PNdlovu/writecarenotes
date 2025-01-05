/**
 * @writecarenotes.com
 * @fileoverview Incident API types and enums
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions and enums for the incident management API.
 * These types are used for API request/response validation and
 * type safety across the incident management system.
 */

/**
 * Incident type enum
 */
export enum IncidentType {
  MEDICATION_ERROR = 'MEDICATION_ERROR',
  FALL = 'FALL',
  INJURY = 'INJURY',
  BEHAVIOR = 'BEHAVIOR',
  ABUSE_ALLEGATION = 'ABUSE_ALLEGATION',
  SERIOUS_INJURY = 'SERIOUS_INJURY',
  ABSCONDING = 'ABSCONDING',
  SAFEGUARDING = 'SAFEGUARDING',
  COMPLAINT = 'COMPLAINT',
  NEAR_MISS = 'NEAR_MISS',
  OTHER = 'OTHER'
}

/**
 * Incident status enum
 */
export enum IncidentStatus {
  DRAFT = 'DRAFT',
  REPORTED = 'REPORTED',
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
  COMPLETED = 'COMPLETED',
  CLOSED = 'CLOSED'
}

/**
 * Incident severity enum
 */
export enum IncidentSeverity {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL'
} 
