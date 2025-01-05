# Medications Module Structure

## Current Implementation

### Directory Structure
```
wsapp/
├── src/
│   ├── components/
│   │   └── medications/
│   │       ├── AddMedicationButton.tsx    # Add new medication UI
│   │       ├── AddMedicationForm.tsx      # Medication form component
│   │       ├── MedicationList.tsx         # List of medications
│   │       ├── MedicationSchedule.tsx     # Medication schedule view
│   │       ├── PINEntry.tsx              # PIN entry component
│   │       ├── PINManagement.tsx         # PIN management UI
│   │       └── icons.ts                  # Medication-related icons
│   └── lib/
│       └── medications/                  # (Planned)
└── prisma/
    └── schema.prisma                    # Database schema

```

### Current Database Models

#### Core Models
```prisma
enum MedicationCategory {
  REGULAR
  PRN
  CONTROLLED
  OVER_THE_COUNTER
}

enum MedicationStatus {
  SCHEDULED
  DISCONTINUED
  ON_HOLD
  PENDING_APPROVAL
  PENDING_REFILL
}

enum MedicationRoute {
  ORAL
  TOPICAL
  INJECTION
  INHALATION
  SUBLINGUAL
  RECTAL
  TRANSDERMAL
  OPHTHALMIC
  OTIC
  NASAL
  OTHER
}

model Medication {
  // Current implementation
}

model MedicationAdministration {
  // Current implementation
}
```

## Planned Structure

### New API Routes
```
wsapp/
├── app/
│   └── api/
│       └── medications/
│           ├── administration/
│           │   └── route.ts               # Administration endpoints
│           ├── clinical/
│           │   ├── vitals.ts             # Vital signs tracking
│           │   ├── monitoring.ts         # Clinical monitoring
│           │   └── specialized.ts        # Specialized admin
│           ├── emergency/
│           │   ├── protocols.ts          # Emergency protocols
│           │   └── incidents.ts          # Incident reporting
│           ├── integration/
│           │   ├── gp.ts                # GP communication
│           │   ├── pharmacy.ts          # Pharmacy integration
│           │   └── hospital.ts          # Hospital updates
│           └── quality/
│               ├── tracking.ts          # Quality metrics
│               └── reporting.ts         # Compliance reporting
```

### New Components
```
wsapp/
└── src/
    ├── components/
    │   └── medications/
    │       ├── clinical/
    │       │   ├── VitalSigns.tsx
    │       │   ├── Monitoring.tsx
    │       │   └── SpecializedAdmin.tsx
    │       ├── emergency/
    │       │   ├── Protocols.tsx
    │       │   └── IncidentReport.tsx
    │       ├── integration/
    │       │   ├── GPComms.tsx
    │       │   └── PharmacyOrder.tsx
    │       └── quality/
    │           ├── Tracking.tsx
    │           └── Reports.tsx
    └── lib/
        └── medications/
            ├── clinical.ts
            ├── emergency.ts
            ├── integration.ts
            └── quality.ts
```

### Planned Database Models

#### Clinical Models
```prisma
model ClinicalMonitoring {
  id              String    @id @default(cuid())
  residentId      String
  type            String    // blood sugar, weight, etc.
  value           String
  timestamp       DateTime
  notes           String?
  recordedBy      String
}

model EmergencyProtocol {
  id              String    @id @default(cuid())
  residentId      String
  type            String    // epilepsy, anaphylaxis, etc.
  instructions    String
  medications     String[]
  contacts        String[]
  lastReview      DateTime
}

model HealthcareProvider {
  id              String    @id @default(cuid())
  name            String
  type            String    // GP, specialist, etc.
  contact         String
  residents       String[]
}
```

## Implementation Priority
1. Clinical monitoring models and components
2. Emergency protocol system
3. Healthcare provider integration
4. Quality monitoring tools
5. Regional compliance features
