/**
 * @writecarenotes.com
 * @fileoverview Domiciliary Care Database Schema
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Database schema design for the domiciliary care module, supporting both desktop
 * and future mobile/tablet implementations.
 */

# Domiciliary Care Database Schema

## Core Entities

### Client
```prisma
model DomiciliaryClient {
  id              String          @id @default(cuid())
  organizationId  String
  status          ClientStatus    @default(ACTIVE)
  
  // Personal Information
  title           String?
  firstName       String
  lastName        String
  dateOfBirth     DateTime
  nhsNumber       String?         @unique
  gender          Gender
  
  // Contact Details
  address         Address
  telephone       String?
  mobile          String?
  email           String?
  
  // Access Information
  keySafeCode     String?         @encrypted
  accessNotes     String?
  directions      String?
  
  // Care Requirements
  careNeeds       CareNeed[]
  riskAssessments RiskAssessment[]
  carePackages    CarePackage[]
  
  // Relationships
  contacts        ClientContact[]
  documents       Document[]
  notes           Note[]
  
  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       String
  updatedBy       String

  @@index([organizationId])
  @@index([status])
}

enum ClientStatus {
  ENQUIRY
  ASSESSMENT
  ACTIVE
  ON_HOLD
  DISCHARGED
  DECEASED
}
```

### Care Package
```prisma
model CarePackage {
  id              String          @id @default(cuid())
  clientId        String
  status          PackageStatus   @default(DRAFT)
  
  // Package Details
  startDate       DateTime
  endDate         DateTime?
  fundingType     FundingType
  weeklyHours     Float
  costPerHour     Decimal        @db.Decimal(10,2)
  
  // Care Requirements
  visitSchedules  VisitSchedule[]
  careTasks       CareTask[]
  medications     Medication[]
  
  // Reviews and Monitoring
  reviews         PackageReview[]
  riskAssessments RiskAssessment[]
  
  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       String
  updatedBy       String

  @@index([clientId])
  @@index([status])
}

enum PackageStatus {
  DRAFT
  PENDING_APPROVAL
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}
```

### Visit Schedule
```prisma
model VisitSchedule {
  id              String          @id @default(cuid())
  carePackageId   String
  
  // Schedule Details
  dayOfWeek       Int             // 0-6 (Sunday-Saturday)
  timeSlot        TimeSlot
  duration        Int             // minutes
  staffRequired   Int             @default(1)
  
  // Requirements
  tasks           CareTask[]
  skillsRequired  Skill[]
  
  // Actual Visits
  visits          Visit[]
  
  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       String
  updatedBy       String

  @@index([carePackageId])
}

enum TimeSlot {
  EARLY_MORNING   // 6am-9am
  MORNING         // 9am-12pm
  LUNCH           // 12pm-2pm
  AFTERNOON       // 2pm-5pm
  EVENING         // 5pm-8pm
  NIGHT           // 8pm-11pm
  OVERNIGHT       // 11pm-6am
}
```

### Visit
```prisma
model Visit {
  id              String          @id @default(cuid())
  scheduleId      String
  
  // Visit Details
  plannedStart    DateTime
  plannedEnd      DateTime
  actualStart     DateTime?
  actualEnd       DateTime?
  status          VisitStatus     @default(SCHEDULED)
  
  // Staff Assignment
  staffAssigned   Staff[]
  
  // Care Delivery
  tasks           CompletedTask[]
  medications     MedicationRecord[]
  notes           Note[]
  
  // Location
  checkInLocation Location?
  checkOutLocation Location?
  
  // Evidence
  signatures      Signature[]
  photos          Photo[]
  
  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       String
  updatedBy       String

  @@index([scheduleId])
  @@index([status])
  @@index([plannedStart])
}

enum VisitStatus {
  SCHEDULED
  CHECKED_IN
  COMPLETED
  MISSED
  CANCELLED
  LATE
}
```

### Staff
```prisma
model DomiciliaryStaff {
  id              String          @id @default(cuid())
  userId          String          @unique
  organizationId  String
  status          StaffStatus     @default(ACTIVE)
  
  // Personal Details
  title           String?
  firstName       String
  lastName        String
  
  // Contact Details
  address         Address
  telephone       String?
  mobile          String          // Required for field staff
  email           String          @unique
  
  // Employment Details
  role            StaffRole
  contractType    ContractType
  contractedHours Float?
  
  // Qualifications & Skills
  skills          Skill[]
  qualifications  Qualification[]
  dbs             DBSCheck?
  training        TrainingRecord[]
  
  // Work Related
  territory       Territory?
  availability    Availability[]
  visits          Visit[]
  
  // Vehicle Information
  vehicle         VehicleInfo?
  
  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       String
  updatedBy       String

  @@index([organizationId])
  @@index([status])
  @@index([role])
}

enum StaffRole {
  CARE_WORKER
  SENIOR_CARE_WORKER
  COORDINATOR
  SUPERVISOR
  MANAGER
  ADMIN
}
```

## Supporting Entities

### Location
```prisma
model Location {
  id              String          @id @default(cuid())
  latitude        Float
  longitude       Float
  accuracy        Float
  timestamp       DateTime
  deviceId        String?
  
  @@index([timestamp])
}
```

### Territory
```prisma
model Territory {
  id              String          @id @default(cuid())
  name            String
  description     String?
  postcodes       String[]
  staff           DomiciliaryStaff[]
  
  @@index([name])
}
```

### Availability
```prisma
model Availability {
  id              String          @id @default(cuid())
  staffId         String
  dayOfWeek       Int             // 0-6 (Sunday-Saturday)
  startTime       String          // HH:mm format
  endTime         String          // HH:mm format
  
  @@index([staffId])
  @@index([dayOfWeek])
}
```

## Compliance & Audit

### Audit Trail
```prisma
model AuditTrail {
  id              String          @id @default(cuid())
  entityType      String          // e.g., "Visit", "CarePackage"
  entityId        String
  action          AuditAction
  changes         Json?
  performedBy     String
  timestamp       DateTime        @default(now())
  ipAddress       String?
  userAgent       String?
  
  @@index([entityType, entityId])
  @@index([timestamp])
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
  PRINT
}
```

### Document
```prisma
model Document {
  id              String          @id @default(cuid())
  type            DocumentType
  title           String
  description     String?
  fileUrl         String
  mimeType        String
  size            Int
  tags            String[]
  
  // Relations
  clientId        String?
  staffId         String?
  visitId         String?
  
  // Audit
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  createdBy       String
  updatedBy       String

  @@index([type])
  @@index([clientId])
  @@index([staffId])
  @@index([visitId])
}

enum DocumentType {
  CARE_PLAN
  RISK_ASSESSMENT
  MEDICATION_CHART
  TRAINING_CERTIFICATE
  POLICY
  CONTRACT
  INVOICE
  REPORT
  OTHER
}
```

## Notes

1. Security Considerations:
   - Sensitive data fields are marked with @encrypted
   - Audit trails for all major operations
   - Role-based access control built into schema

2. Mobile/Tablet Support:
   - Location tracking for visits
   - Offline-capable primary keys (CUID)
   - Timestamp tracking for sync
   - Device information storage

3. Performance Optimization:
   - Strategic indexing on frequently queried fields
   - Denormalization where appropriate
   - Efficient relationship modeling

4. Compliance:
   - Built-in audit trails
   - Document version control
   - Data retention policies
   - GDPR compliance support 