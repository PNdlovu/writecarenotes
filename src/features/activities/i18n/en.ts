/**
 * @fileoverview English translations for activities module
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export const activityTranslations = {
  activities: {
    title: 'Activities',
    create: 'Create Activity',
    edit: 'Edit Activity',
    details: 'Activity Details',
    
    // Status messages
    created: 'Activity created successfully',
    updated: 'Activity updated successfully',
    cancelled: 'Activity cancelled successfully',
    deleted: 'Activity deleted successfully',

    // Form labels
    fields: {
      name: 'Activity Name',
      description: 'Description',
      category: 'Category',
      startTime: 'Start Time',
      endTime: 'End Time',
      location: 'Location',
      capacity: 'Capacity',
      status: 'Status',
      recurrence: 'Recurrence',
      participants: 'Participants',
      resources: 'Resources',
      notes: 'Notes',
    },

    // Categories
    categories: {
      PHYSICAL: 'Physical Activity',
      SOCIAL: 'Social Activity',
      COGNITIVE: 'Cognitive Activity',
      CREATIVE: 'Creative Activity',
      THERAPEUTIC: 'Therapeutic Activity',
      ENTERTAINMENT: 'Entertainment',
    },

    // Status labels
    status: {
      SCHEDULED: 'Scheduled',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      RESCHEDULED: 'Rescheduled',
      PENDING_SYNC: 'Pending Sync',
      SYNC_FAILED: 'Sync Failed',
    },

    // Recurrence patterns
    recurrence: {
      NONE: 'One-time',
      DAILY: 'Daily',
      WEEKLY: 'Weekly',
      MONTHLY: 'Monthly',
    },

    // Participant roles
    roles: {
      ORGANIZER: 'Organizer',
      PARTICIPANT: 'Participant',
      OBSERVER: 'Observer',
    },

    // Participant status
    participantStatus: {
      INVITED: 'Invited',
      CONFIRMED: 'Confirmed',
      DECLINED: 'Declined',
      ATTENDED: 'Attended',
    },

    // Resource status
    resourceStatus: {
      AVAILABLE: 'Available',
      UNAVAILABLE: 'Unavailable',
      PENDING: 'Pending',
    },

    // Engagement levels
    engagement: {
      HIGH: 'High Engagement',
      MEDIUM: 'Medium Engagement',
      LOW: 'Low Engagement',
    },

    // Error messages
    errors: {
      notFound: 'Activity not found',
      endTimeBeforeStart: 'End time must be after start time',
      participantNotFound: 'Participant not found',
      invalidCategory: 'Invalid activity category',
      capacityExceeded: 'Maximum capacity exceeded',
      resourceUnavailable: 'Required resources are unavailable',
      updateFailed: 'Failed to update activity',
      deleteFailed: 'Failed to delete activity',
      syncFailed: 'Failed to sync activities',
    },

    // Offline messages
    offline: {
      syncUnavailable: 'Cannot sync while offline',
      syncComplete: 'Activities synced successfully',
      pendingChanges: 'You have pending changes that will sync when online',
      conflictDetected: 'Conflict detected with server changes',
    },

    // Notifications
    notifications: {
      title: 'Activity Update',
      create: '{{activityName}} has been scheduled for {{startTime}} at {{location}}',
      update: '{{activityName}} details have been updated',
      cancellation: '{{activityName}} has been cancelled',
    },

    // Tooltips
    tooltips: {
      sync: 'Sync activities with server',
      addParticipant: 'Add participant',
      removeParticipant: 'Remove participant',
      cancel: 'Cancel activity',
      edit: 'Edit activity',
      delete: 'Delete activity',
      viewDetails: 'View details',
    },

    // Confirmations
    confirmations: {
      cancel: 'Are you sure you want to cancel this activity?',
      delete: 'Are you sure you want to delete this activity?',
    },
  },
};


