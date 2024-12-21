# Resident Management Module

A comprehensive resident management system with integrated DoLS and capacity assessment features, designed for care homes across the UK and Ireland.

## Compliance & Regional Support

This module is compliant with the following regulatory bodies:
- Care Quality Commission (CQC) - England
- Care Inspectorate Wales (CIW) - Wales
- Care Inspectorate - Scotland
- Health Information and Quality Authority (HIQA) - Ireland
- Regulation and Quality Improvement Authority (RQIA) - Northern Ireland

## Module Structure

```
src/features/resident/
├── components/           # UI Components
│   ├── forms/           # Form components
│   │   └── ResidentForm/
│   ├── details/         # Detail view components
│   │   └── ResidentProfile/
│   ├── dols/           # DoLS related components
│   │   ├── DoLSManager/
│   │   ├── DoLSCompliance/
│   │   └── DoLSNotifications/
│   └── assessments/    # Assessment components
│       ├── CapacityAssessment/
│       ├── RestrictionsLog/
│       └── CarePlanIntegration/
├── database/           # Data access layer
│   └── repositories/   # Data repositories with audit + cache
├── services/          # Business logic layer
├── types/            # TypeScript types
│   ├── resident.types.ts
│   └── dols.types.ts
├── hooks/           # React hooks
└── index.ts        # Public API exports
```

## Features

### Core Features
- Personal information management
- Care type specification (Residential, Nursing, Dementia, etc.)
- Room assignment
- Admission/Discharge tracking

### Care Management
- Mobility status tracking
- Communication needs
- Medical conditions and allergies
- DNR status
- Power of Attorney information

### Cultural & Personal Preferences
- Religious preferences
- Dietary requirements
- Cultural practices
- Personal preferences

### Risk Management
- Risk assessments
- Mobility assistance requirements
- Communication aids needed

### DoLS and Capacity Management
- Comprehensive DoLS tracking and management
- Mental capacity assessments (MCA 2005 compliant)
- Restrictions logging and monitoring
- Care plan integration with DoLS
- Compliance monitoring and notifications
- Representative visit tracking

## Components

### Core Components
### ResidentProfile
Displays comprehensive resident information including:
- Personal details
- Care status
- Medical information
- Cultural preferences
- Risk assessments

### ResidentForm
Provides form interface for:
- Creating new residents
- Editing existing resident information
- Managing care preferences
- Updating medical information

### DoLS Components

#### DoLSManager
Provides comprehensive DoLS management:
- View current and historical DoLS
- Add new DoLS applications
- Track assessments and reviews
- Monitor representative visits
- Regional compliance checks
- Multi-language support

#### DoLSCompliance
Monitors compliance with DoLS requirements:
- Expiry tracking with regional variations
- Assessment completion status
- Review scheduling based on local requirements
- Representative visit monitoring
- Compliance reporting for different regulatory bodies

#### DoLSNotifications
Real-time notification system for:
- DoLS expiry alerts
- Missing assessments
- Upcoming reviews
- Representative visit reminders
- Regional compliance deadlines

### Assessment Components

#### CapacityAssessment
Interface for mental capacity assessments:
- Diagnostic tests
- Functional assessments
- Best interests decision-making
- Consultation tracking
- Regional variations in assessment criteria
- Multi-language support

#### RestrictionsLog
Management of resident restrictions:
- Physical restrictions
- Chemical restrictions
- Environmental restrictions
- Surveillance measures
- Approval tracking
- Review scheduling
- Regional compliance checks

#### CarePlanIntegration
Integration of DoLS with care planning:
- DoLS condition impact analysis
- Care plan updates based on restrictions
- Gap analysis for missing care plans
- Timeline view of restricted care plans
- Regional care standards compliance

## Types

The module uses TypeScript for type safety and includes:
- Resident interface
- Care type enums
- Mobility status types
- Communication needs interface
- Cultural preferences interface
- Risk assessment types
- DoLS status types
- Assessment types
- Review interfaces
- Representative information
- Document management types

## Usage

```typescript
import { ResidentProfile } from '@/features/resident/components/ResidentProfile';
import { ResidentForm } from '@/features/resident/components/ResidentForm';
import type { Resident } from '@/features/resident/types/resident.types';

// Display resident profile
<ResidentProfile resident={residentData} />

// Create/Edit resident form
<ResidentForm 
  initialValues={existingResident} 
  onSubmit={handleSubmit} 
/>

// DoLS Management
import { DoLSManager } from '@/features/resident/components/DoLSManager';
import { DoLSCompliance } from '@/features/resident/components/DoLSCompliance';
import { DoLSNotifications } from '@/features/resident/components/DoLSNotifications';
import type { DoLS } from '@/features/resident/types/dols.types';

// Display DoLS management interface
<DoLSManager 
  resident={residentData}
  onUpdateDoLS={handleUpdate}
/>

// Monitor DoLS compliance
<DoLSCompliance
  dolsList={residentDoLS}
  onComplianceUpdate={handleComplianceUpdate}
/>

// Show DoLS notifications
<DoLSNotifications
  dolsList={residentDoLS}
  onScheduleReview={handleReviewScheduling}
/>

// Capacity Assessment
import { CapacityAssessment } from '@/features/resident/components/CapacityAssessment';

<CapacityAssessment
  resident={residentData}
  onAssessmentComplete={handleAssessmentComplete}
/>

// Restrictions Management
import { RestrictionsLog } from '@/features/resident/components/RestrictionsLog';
import { CarePlanIntegration } from '@/features/resident/components/CarePlanIntegration';

<RestrictionsLog
  restrictions={residentRestrictions}
  onUpdateRestriction={handleRestrictionUpdate}
/>

<CarePlanIntegration
  dols={currentDoLS}
  restrictions={activeRestrictions}
  carePlans={residentCarePlans}
  onUpdateCarePlan={handleCarePlanUpdate}
/>

## Regional Considerations

### England (CQC)
- Specific DoLS forms and templates
- CQC notification requirements
- England-specific capacity assessment criteria

### Wales (CIW)
- Bilingual support (English/Welsh)
- Wales-specific DoLS forms
- CIW compliance requirements

### Scotland
- Adults with Incapacity (Scotland) Act compliance
- Care Inspectorate requirements
- Scottish capacity assessment framework

### Ireland (HIQA)
- HIQA notification requirements
- Irish capacity assessment framework
- Specific documentation requirements

### Northern Ireland (RQIA)
- RQIA compliance requirements
- Northern Ireland capacity legislation
- Specific documentation standards
