/**
 * @fileoverview Welsh translations for activities module
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export const activityTranslations = {
  activities: {
    title: 'Gweithgareddau',
    create: 'Creu Gweithgaredd',
    edit: 'Golygu Gweithgaredd',
    details: 'Manylion Gweithgaredd',
    
    // Status messages
    created: 'Gweithgaredd wedi\'i greu\'n llwyddiannus',
    updated: 'Gweithgaredd wedi\'i ddiweddaru\'n llwyddiannus',
    cancelled: 'Gweithgaredd wedi\'i ganslo\'n llwyddiannus',
    deleted: 'Gweithgaredd wedi\'i ddileu\'n llwyddiannus',

    // Form labels
    fields: {
      name: 'Enw Gweithgaredd',
      description: 'Disgrifiad',
      category: 'Categori',
      startTime: 'Amser Dechrau',
      endTime: 'Amser Gorffen',
      location: 'Lleoliad',
      capacity: 'Capasiti',
      status: 'Statws',
      recurrence: 'Ailadrodd',
      participants: 'Cyfranogwyr',
      resources: 'Adnoddau',
      notes: 'Nodiadau',
    },

    // Categories
    categories: {
      PHYSICAL: 'Gweithgaredd Corfforol',
      SOCIAL: 'Gweithgaredd Cymdeithasol',
      COGNITIVE: 'Gweithgaredd Gwybyddol',
      CREATIVE: 'Gweithgaredd Creadigol',
      THERAPEUTIC: 'Gweithgaredd Therapiwtig',
      ENTERTAINMENT: 'Adloniant',
    },

    // Status labels
    status: {
      SCHEDULED: 'Wedi\'i Drefnu',
      IN_PROGRESS: 'Ar Waith',
      COMPLETED: 'Wedi\'i Gwblhau',
      CANCELLED: 'Wedi\'i Ganslo',
      RESCHEDULED: 'Wedi\'i Aildrefnu',
      PENDING_SYNC: 'Yn Aros i Gydweddu',
      SYNC_FAILED: 'Methwyd â Chydweddu',
    },

    // Recurrence patterns
    recurrence: {
      NONE: 'Unwaith',
      DAILY: 'Dyddiol',
      WEEKLY: 'Wythnosol',
      MONTHLY: 'Misol',
    },

    // Participant roles
    roles: {
      ORGANIZER: 'Trefnydd',
      PARTICIPANT: 'Cyfranogwr',
      OBSERVER: 'Arsylwr',
    },

    // Participant status
    participantStatus: {
      INVITED: 'Wedi\'i Wahodd',
      CONFIRMED: 'Wedi Cadarnhau',
      DECLINED: 'Wedi Gwrthod',
      ATTENDED: 'Wedi Mynychu',
    },

    // Resource status
    resourceStatus: {
      AVAILABLE: 'Ar Gael',
      UNAVAILABLE: 'Ddim ar Gael',
      PENDING: 'Yn Aros',
    },

    // Engagement levels
    engagement: {
      HIGH: 'Ymgysylltiad Uchel',
      MEDIUM: 'Ymgysylltiad Canolig',
      LOW: 'Ymgysylltiad Isel',
    },

    // Error messages
    errors: {
      notFound: 'Ni ddaethpwyd o hyd i\'r gweithgaredd',
      endTimeBeforeStart: 'Rhaid i\'r amser gorffen fod ar ôl yr amser dechrau',
      participantNotFound: 'Ni ddaethpwyd o hyd i\'r cyfranogwr',
      invalidCategory: 'Categori gweithgaredd annilys',
      capacityExceeded: 'Wedi cyrraedd y capasiti mwyaf',
      resourceUnavailable: 'Nid yw\'r adnoddau gofynnol ar gael',
      updateFailed: 'Methwyd â diweddaru\'r gweithgaredd',
      deleteFailed: 'Methwyd â dileu\'r gweithgaredd',
      syncFailed: 'Methwyd â chydweddu gweithgareddau',
    },

    // Offline messages
    offline: {
      syncUnavailable: 'Ni ellir cydweddu pan all-lein',
      syncComplete: 'Gweithgareddau wedi\'u cydweddu\'n llwyddiannus',
      pendingChanges: 'Mae gennych newidiadau\'n aros i gydweddu pan ar-lein',
      conflictDetected: 'Gwrthdaro wedi\'i ganfod gyda newidiadau\'r gweinydd',
    },

    // Notifications
    notifications: {
      title: 'Diweddariad Gweithgaredd',
      create: 'Mae {{activityName}} wedi\'i drefnu ar gyfer {{startTime}} yn {{location}}',
      update: 'Mae manylion {{activityName}} wedi\'u diweddaru',
      cancellation: 'Mae {{activityName}} wedi\'i ganslo',
    },

    // Tooltips
    tooltips: {
      sync: 'Cydweddu gweithgareddau â\'r gweinydd',
      addParticipant: 'Ychwanegu cyfranogwr',
      removeParticipant: 'Tynnu cyfranogwr',
      cancel: 'Canslo gweithgaredd',
      edit: 'Golygu gweithgaredd',
      delete: 'Dileu gweithgaredd',
      viewDetails: 'Gweld manylion',
    },

    // Confirmations
    confirmations: {
      cancel: 'Ydych chi\'n siŵr eich bod am ganslo\'r gweithgaredd hwn?',
      delete: 'Ydych chi\'n siŵr eich bod am ddileu\'r gweithgaredd hwn?',
    },
  },
};


