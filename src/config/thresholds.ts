/**
 * @fileoverview Regulatory compliance thresholds for care facilities
 * These values are based on CQC, CIW, RQIA, Care Inspectorate, and HIQA guidelines
 */

export const thresholds = {
  staffing: {
    nurse_ratio: {
      day: 0.2, // 1 nurse per 5 residents during day
      night: 0.125 // 1 nurse per 8 residents during night
    },
    care_worker_ratio: {
      day: 0.33, // 1 care worker per 3 residents during day
      night: 0.25 // 1 care worker per 4 residents during night
    },
    training: {
      mandatory: 100, // 100% completion required for mandatory training
      specialized: 85 // 85% completion target for specialized training
    }
  },
  care_quality: {
    resident_satisfaction: {
      minimum: 75, // Minimum acceptable satisfaction score
      target: 85 // Target satisfaction score
    },
    care_plan_reviews: {
      maximum_interval: 28 // Maximum days between care plan reviews
    },
    health_metrics: {
      weight_change: {
        warning: 5, // 5% change triggers warning
        critical: 10 // 10% change triggers critical alert
      },
      pressure_sores: {
        warning: 2, // Number of new cases per month
        critical: 5
      }
    }
  },
  medication: {
    errors: {
      warning: 0.5, // 0.5% error rate triggers warning
      critical: 1.0 // 1% error rate triggers critical alert
    },
    stock_levels: {
      minimum: 14, // Minimum 14 days stock required
      warning: 21 // Warning when stock below 21 days
    }
  },
  documentation: {
    completion: {
      warning: 95, // 95% completion rate required
      critical: 90 // Critical alert below 90%
    },
    timeliness: {
      warning: 24, // Hours allowed for documentation completion
      critical: 48 // Critical alert after 48 hours
    }
  },
  environment: {
    temperature: {
      min: 18, // Minimum temperature in Celsius
      max: 26, // Maximum temperature in Celsius
      warning_range: 2 // Alert when within 2 degrees of min/max
    },
    cleaning: {
      high_risk: 24, // Maximum hours between high-risk area cleaning
      standard: 48 // Maximum hours between standard area cleaning
    },
    maintenance: {
      response_time: {
        critical: 4, // Hours to respond to critical issues
        standard: 48 // Hours to respond to standard issues
      }
    }
  }
}

// Regional adjustments based on specific regulatory requirements
export const regionalAdjustments = {
  CQC: { // England
    staffing: {
      nurse_ratio: { day: 0.2, night: 0.125 }
    }
  },
  CIW: { // Wales
    staffing: {
      nurse_ratio: { day: 0.22, night: 0.14 }
    }
  },
  RQIA: { // Northern Ireland
    staffing: {
      nurse_ratio: { day: 0.2, night: 0.125 }
    }
  },
  CI: { // Scotland
    staffing: {
      nurse_ratio: { day: 0.22, night: 0.14 }
    }
  },
  HIQA: { // Republic of Ireland
    staffing: {
      nurse_ratio: { day: 0.25, night: 0.15 }
    }
  }
}

// Specialized care adjustments
export const specializedCareAdjustments = {
  dementia: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.25 // 25% more staff required
      },
      training: {
        specialized: 95 // Higher specialized training requirement
      }
    },
    environment: {
      cleaning: {
        high_risk: 12 // More frequent cleaning required
      },
      safety: {
        checks_per_day: 24, // Hourly safety checks
        wander_prevention: true,
        secured_areas: true
      }
    },
    care_quality: {
      resident_monitoring: {
        checks_per_shift: 12,
        behavior_tracking: true
      }
    }
  },
  palliative: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.5 // 50% more staff required
      },
      specialized_roles: {
        pain_management: true,
        end_of_life_care: true
      }
    },
    documentation: {
      timeliness: {
        warning: 12,
        critical: 24
      },
      required_assessments: [
        'pain',
        'comfort',
        'symptom_management',
        'psychological_support'
      ]
    },
    medication: {
      stock_levels: {
        minimum: 21, // Extended minimum stock requirement
        controlled_drugs: {
          checks_per_shift: 3,
          dual_signoff: true
        }
      }
    }
  },
  mental_health: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.3 // 30% more staff required
      },
      required_specialists: {
        psychiatric_nurse: true,
        counselor: true
      }
    },
    environment: {
      maintenance: {
        response_time: {
          critical: 2 // Faster response required
        }
      },
      safety: {
        risk_assessment_frequency: 24, // Hours
        observation_areas: true
      }
    },
    documentation: {
      mental_state_monitoring: {
        frequency: 8, // Hours between assessments
        risk_assessment_update: 72 // Hours
      }
    }
  },
  learning_disabilities: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.4
      },
      support_worker_ratio: {
        multiplier: 1.5
      },
      required_training: [
        'communication_methods',
        'behavioral_support',
        'sensory_needs'
      ]
    },
    environment: {
      accessibility: {
        signage: true,
        adapted_facilities: true,
        sensory_rooms: true
      },
      activity_spaces: {
        minimum_area_per_resident: 15 // Square meters
      }
    },
    care_quality: {
      individual_plans: {
        review_frequency: 14, // Days
        communication_passport: true,
        activity_goals: true
      }
    }
  },
  physical_disabilities: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.35
      },
      physiotherapist: {
        required: true,
        sessions_per_week: 3
      }
    },
    environment: {
      accessibility: {
        wheelchair_access: true,
        hoists_per_unit: 2,
        adapted_bathrooms: true,
        emergency_call_systems: true
      },
      equipment: {
        maintenance_frequency: 7, // Days
        backup_power: true
      }
    },
    care_quality: {
      mobility_assessment: {
        frequency: 14, // Days
        equipment_review: 30 // Days
      },
      pressure_care: {
        risk_assessment_frequency: 7, // Days
        position_change_frequency: 4 // Hours
      }
    }
  },
  autism: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.45
      },
      specialist_training: {
        minimum_staff_percentage: 80,
        required_modules: [
          'sensory_processing',
          'communication_support',
          'behavior_management'
        ]
      }
    },
    environment: {
      sensory: {
        noise_control: true,
        lighting_control: true,
        quiet_spaces: true,
        sensory_room: true
      },
      routine: {
        visual_schedules: true,
        structured_environment: true
      }
    },
    care_quality: {
      sensory_assessment: {
        frequency: 30, // Days
        environmental_triggers: true
      },
      communication: {
        support_plan_review: 14, // Days
        alternative_methods: true
      }
    }
  },
  elderly_care: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.2
      },
      specialist_roles: {
        falls_prevention: true,
        dementia_care: true
      }
    },
    environment: {
      safety: {
        fall_prevention: true,
        handrails: true,
        night_lighting: true
      },
      accessibility: {
        mobility_aids: true,
        rest_areas: true
      }
    },
    care_quality: {
      falls_assessment: {
        frequency: 14, // Days
        prevention_plan: true
      },
      nutrition: {
        assessment_frequency: 30, // Days
        hydration_monitoring: true
      }
    }
  },
  rehabilitation: {
    staffing: {
      nurse_ratio: {
        multiplier: 1.3
      },
      therapy_team: {
        physiotherapist: true,
        occupational_therapist: true,
        speech_therapist: true
      }
    },
    environment: {
      therapy_facilities: {
        exercise_area: true,
        treatment_room: true,
        assessment_kitchen: true
      },
      equipment: {
        rehabilitation_equipment: true,
        maintenance_frequency: 7 // Days
      }
    },
    care_quality: {
      therapy_plans: {
        review_frequency: 7, // Days
        goal_setting: true,
        progress_tracking: true
      },
      discharge_planning: {
        start_from_admission: true,
        home_assessment: true
      }
    }
  }
}

// Add regulatory reporting requirements
export const regulatoryReporting = {
  CQC: {
    incidents: {
      reporting_timeframe: 24, // Hours
      categories: [
        'death',
        'serious_injury',
        'abuse',
        'medication_error'
      ]
    },
    inspections: {
      self_assessment_frequency: 90, // Days
      evidence_requirements: [
        'care_plans',
        'staff_records',
        'incident_logs',
        'medication_records'
      ]
    }
  },
  HIQA: {
    incidents: {
      reporting_timeframe: 72, // Hours
      quarterly_returns: true
    },
    documentation: {
      retention_period: 7, // Years
      electronic_backup: true
    }
  },
  RQIA: {
    notifications: {
      immediate: [
        'death',
        'serious_injury'
      ],
      within_24_hours: [
        'safeguarding',
        'medication_error'
      ],
      within_72_hours: [
        'staff_changes',
        'policy_updates'
      ]
    }
  },
  CIW: {
    reporting: {
      online_system: true,
      timeframes: {
        serious_incidents: 24, // Hours
        quarterly_returns: 90 // Days
      }
    }
  },
  CI: {
    notifications: {
      immediate: [
        'death',
        'serious_injury',
        'infection_outbreak'
      ],
      grades_submission: {
        frequency: 180, // Days
        self_assessment: true
      }
    }
  }
} 


