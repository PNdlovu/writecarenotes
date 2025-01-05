import { z } from 'zod';

// Activity Categories
export enum ActivityCategory {
  CARE = 'CARE',
  MEDICATION = 'MEDICATION',
  STAFF = 'STAFF',
  RESIDENT = 'RESIDENT',
  SYSTEM = 'SYSTEM',
  PHYSICAL = 'PHYSICAL',
  SOCIAL = 'SOCIAL',
  MENTAL = 'MENTAL',
  CREATIVE = 'CREATIVE',
  EDUCATIONAL = 'EDUCATIONAL',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SPIRITUAL = 'SPIRITUAL',
  THERAPEUTIC = 'THERAPEUTIC'
}

// Activity Difficulty Levels
export enum ActivityDifficulty {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  CHALLENGING = 'CHALLENGING',
  ADAPTIVE = 'ADAPTIVE'
}

// Activity Status
export enum ActivityStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED'
}

// Participation Level
export enum ParticipationLevel {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  OBSERVED = 'OBSERVED',
  DECLINED = 'DECLINED',
  ABSENT = 'ABSENT'
}

// Mood During Activity
export enum ActivityMood {
  VERY_HAPPY = 'VERY_HAPPY',
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  UNHAPPY = 'UNHAPPY',
  VERY_UNHAPPY = 'VERY_UNHAPPY',
  ANXIOUS = 'ANXIOUS',
  AGITATED = 'AGITATED'
}

// Base Activity Type
export interface Activity {
  id: string;
  careHomeId: string;
  organizationId: string;
  type: 'update' | 'create' | 'delete' | 'login' | 'compliance';
  category: ActivityCategory;
  description: string;
  timestamp: Date;
  userId: string;
  metadata?: Record<string, any>;
  name: string;
  duration: number; // in minutes
  maxParticipants?: number;
  minStaffRequired: number;
  materials?: string[];
  objectives: string[];
  adaptations?: string[];
  riskAssessment?: string;
  status: ActivityStatus;
  recurrence?: ActivityRecurrence;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

// Activity Session
export interface ActivitySession {
  id: string;
  activityId: string;
  startTime: Date;
  endTime: Date;
  status: ActivityStatus;
  notes?: string;
  staffMembers: string[]; // staff IDs
  participants: ActivityParticipant[];
  feedback?: ActivityFeedback[];
  weather?: string; // for outdoor activities
  location: string;
  materials?: string[];
  adaptationsMade?: string[];
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Participant
export interface ActivityParticipant {
  id: string;
  sessionId: string;
  residentId: string;
  participationLevel: ParticipationLevel;
  mood?: ActivityMood;
  notes?: string;
  adaptationsUsed?: string[];
  supportProvided?: string;
  achievedObjectives?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Activity Feedback
export interface ActivityFeedback {
  id: string;
  sessionId: string;
  submittedBy: string;
  submittedByType: 'STAFF' | 'RESIDENT' | 'FAMILY';
  rating: number; // 1-5
  comments?: string;
  improvements?: string;
  wouldRepeat: boolean;
  createdAt: Date;
}

// Activity Recurrence
export interface ActivityRecurrence {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  days?: number[]; // days of week (0-6) or days of month (1-31)
  endDate?: Date;
  exceptions?: Date[]; // dates to skip
}

// Activity Preference
export interface ActivityPreference {
  id: string;
  residentId: string;
  categories: ActivityCategory[];
  preferredDifficulty: ActivityDifficulty;
  interests: string[];
  dislikes: string[];
  adaptationsNeeded?: string[];
  preferredTimes?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  groupPreference: 'INDIVIDUAL' | 'SMALL_GROUP' | 'LARGE_GROUP';
  notes?: string;
  updatedAt: Date;
}

// Activity Achievement
export interface ActivityAchievement {
  id: string;
  residentId: string;
  activityId: string;
  sessionId: string;
  type: 'MILESTONE' | 'GOAL' | 'IMPROVEMENT';
  description: string;
  date: Date;
  notes?: string;
  evidenceType?: 'OBSERVATION' | 'MEASUREMENT' | 'FEEDBACK';
  evidenceDetails?: string;
  createdBy: string;
  createdAt: Date;
}

// Zod Schemas for Validation
export const activitySchema = z.object({
  careHomeId: z.string(),
  organizationId: z.string(),
  type: z.enum(['update', 'create', 'delete', 'login', 'compliance']),
  category: z.nativeEnum(ActivityCategory),
  description: z.string(),
  timestamp: z.date(),
  userId: z.string(),
  metadata: z.record(z.any()).optional(),
  name: z.string().min(1).max(100),
  duration: z.number().min(5).max(480), // 5 mins to 8 hours
  maxParticipants: z.number().optional(),
  minStaffRequired: z.number().min(1),
  materials: z.array(z.string()).optional(),
  objectives: z.array(z.string()).min(1),
  adaptations: z.array(z.string()).optional(),
  riskAssessment: z.string().optional(),
  location: z.string(),
  recurrence: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    days: z.array(z.number()).optional(),
    endDate: z.date().optional(),
    exceptions: z.array(z.date()).optional()
  }).optional()
});

export const activitySessionSchema = z.object({
  activityId: z.string().uuid(),
  startTime: z.date(),
  endTime: z.date(),
  status: z.nativeEnum(ActivityStatus),
  notes: z.string().optional(),
  staffMembers: z.array(z.string().uuid()),
  location: z.string(),
  materials: z.array(z.string()).optional(),
  adaptationsMade: z.array(z.string()).optional(),
  weather: z.string().optional()
}).refine(data => data.endTime > data.startTime, {
  message: "End time must be after start time"
});

export const activityParticipantSchema = z.object({
  sessionId: z.string().uuid(),
  residentId: z.string().uuid(),
  participationLevel: z.nativeEnum(ParticipationLevel),
  mood: z.nativeEnum(ActivityMood).optional(),
  notes: z.string().optional(),
  adaptationsUsed: z.array(z.string()).optional(),
  supportProvided: z.string().optional(),
  achievedObjectives: z.array(z.string()).optional()
});

export const activityFeedbackSchema = z.object({
  sessionId: z.string().uuid(),
  submittedBy: z.string().uuid(),
  submittedByType: z.enum(['STAFF', 'RESIDENT', 'FAMILY']),
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
  improvements: z.string().optional(),
  wouldRepeat: z.boolean()
});

export const activityPreferenceSchema = z.object({
  residentId: z.string().uuid(),
  categories: z.array(z.nativeEnum(ActivityCategory)),
  preferredDifficulty: z.nativeEnum(ActivityDifficulty),
  interests: z.array(z.string()),
  dislikes: z.array(z.string()),
  adaptationsNeeded: z.array(z.string()).optional(),
  preferredTimes: z.object({
    morning: z.boolean(),
    afternoon: z.boolean(),
    evening: z.boolean()
  }),
  groupPreference: z.enum(['INDIVIDUAL', 'SMALL_GROUP', 'LARGE_GROUP']),
  notes: z.string().optional()
});

export const activityAchievementSchema = z.object({
  residentId: z.string().uuid(),
  activityId: z.string().uuid(),
  sessionId: z.string().uuid(),
  type: z.enum(['MILESTONE', 'GOAL', 'IMPROVEMENT']),
  description: z.string(),
  date: z.date(),
  notes: z.string().optional(),
  evidenceType: z.enum(['OBSERVATION', 'MEASUREMENT', 'FEEDBACK']).optional(),
  evidenceDetails: z.string().optional()
});


