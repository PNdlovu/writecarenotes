import { OfstedRequirements } from '@/types/regulatory';

export const mockOfstedData: OfstedRequirements = {
  registration: {
    registrationNumber: "SC123456",
    registrationDate: new Date("2023-01-01"),
    registrationType: "FULL",
    conditions: ["Standard condition 1", "Standard condition 2"]
  },
  inspections: [
    {
      date: new Date("2023-06-01"),
      type: "FULL",
      overallEffectiveness: "GOOD",
      outcomes: {
        overallExperiences: "Good",
        qualityOfCare: "Good",
        safeguarding: "Good",
        leadership: "Good",
        education: "Good"
      },
      recommendations: ["Improve documentation", "Enhanced staff training"],
      requirements: []
    }
  ],
  qualityStandards: {
    statement: {
      lastUpdated: new Date("2023-05-01"),
      content: "Quality statement content",
      approved: true
    },
    childrensGuide: {
      lastUpdated: new Date("2023-05-01"),
      formats: ["Written", "Digital", "Easy Read"],
      accessible: true
    },
    staffQualifications: [
      {
        role: "Care Worker",
        requiredQualifications: ["Level 3 Diploma"],
        completedQualifications: ["Level 3 Diploma"],
        inProgress: []
      }
    ]
  },
  safeguarding: {
    designatedLead: {
      name: "John Smith",
      qualification: "Level 5 Safeguarding",
      lastTraining: new Date("2023-04-01")
    },
    policies: [
      {
        name: "Child Protection Policy",
        lastReviewed: new Date("2023-05-01"),
        nextReview: new Date("2024-05-01"),
        version: "2.0"
      }
    ],
    training: [
      {
        type: "Basic Safeguarding",
        completedBy: ["Staff 1", "Staff 2"],
        dueBy: ["Staff 3"],
        refreshDate: new Date("2024-01-01")
      }
    ]
  },
  educationProvision: {
    arrangements: {
      type: "MIXED",
      providers: [
        {
          name: "Local School",
          dfENumber: "123456",
          ofstedRating: "Good",
          lastInspection: new Date("2023-03-01")
        }
      ]
    },
    monitoring: {
      attendance: [
        {
          period: "Term 1 2023",
          percentage: 95,
          issues: []
        }
      ],
      progress: [
        {
          subject: "English",
          level: "Year 8",
          achievements: ["Reading improvement", "Writing skills development"]
        }
      ]
    }
  },
  healthAndWellbeing: {
    medicalOfficer: {
      name: "Dr. Jane Doe",
      qualification: "GP",
      registrationNumber: "GMC123456"
    },
    healthAssessments: [
      {
        type: "Annual Health Check",
        frequency: "Yearly",
        lastCompleted: new Date("2023-01-01"),
        nextDue: new Date("2024-01-01")
      }
    ],
    mentalHealthSupport: [
      {
        type: "Counselling",
        provider: "Local CAMHS",
        frequency: "Weekly",
        lastReview: new Date("2023-05-01")
      }
    ]
  }
};
