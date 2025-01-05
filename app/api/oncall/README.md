/**
 * @writecarenotes.com
 * @fileoverview OnCall Module Documentation
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

# OnCall Module

## Overview

The OnCall module is a comprehensive solution for managing on-call services in care homes across the UK and Ireland. It provides functionality for call management, staff scheduling, compliance tracking, and recording management.

## Features

### Call Management
- Incoming call handling
- Call priority management
- Emergency call routing
- Call recording and transcription
- Call history and analytics

### Staff Management
- Staff availability tracking
- Schedule management
- Qualifications and certifications
- Emergency staff allocation
- Regional staff pools

### Scheduling
- Shift scheduling
- Rotation management
- Emergency coverage
- Schedule compliance checks
- Staff availability optimization

### Compliance
- Regional regulation adherence
- Audit logging
- Compliance reporting
- Quality monitoring
- Regulatory requirements tracking

### Recording
- Call recording
- Transcription services
- Recording storage
- Compliance archival
- Quality analysis

## API Endpoints

### Call Routes (`/api/oncall/calls`)
- `POST /` - Create new call
- `GET /` - List calls with filters
- `GET /:callId` - Get specific call
- `PUT /:callId/status` - Update call status
- `POST /:callId/recording` - Start recording
- `PUT /:callId/recording` - Stop recording
- `POST /emergency` - Create emergency call
- `GET /:callId/recording` - Get call recording

### Staff Routes (`/api/oncall/staff`)
- `POST /` - Register staff member
- `GET /` - List staff with filters
- `GET /:staffId` - Get specific staff member
- `PUT /:staffId/status` - Update staff status
- `POST /:staffId/schedule` - Add schedule
- `GET /:staffId/schedule` - Get staff schedule
- `DELETE /:staffId/schedule/:scheduleId` - Remove schedule
- `GET /available` - Get available staff
- `POST /emergency` - Register emergency staff

### Schedule Routes (`/api/oncall/schedules`)
- `POST /` - Create schedule
- `GET /` - List schedules
- `GET /current` - Get current schedule
- `POST /rotation` - Create rotation
- `GET /rotation/:rotationId` - Get rotation
- `PUT /rotation/:rotationId` - Update rotation
- `POST /coverage` - Add emergency coverage
- `GET /coverage` - Get emergency coverage
- `DELETE /:scheduleId` - Delete schedule

### Compliance Routes (`/api/oncall/compliance`)
- `GET /requirements` - Get compliance requirements
- `GET /audit-log` - Get audit log
- `POST /reports` - Generate report
- `GET /reports/:reportId` - Get report
- `POST /verify-call` - Verify call compliance
- `GET /regulations` - Get regulations
- `POST /validate-schedule` - Validate schedule
- `GET /metrics` - Get compliance metrics

### Recording Routes (`/api/oncall/recordings`)
- `GET /` - List recordings
- `GET /:recordingId` - Get recording
- `GET /call/:callId` - Get call recordings
- `POST /:recordingId/transcribe` - Generate transcription
- `GET /:recordingId/transcription` - Get transcription
- `DELETE /:recordingId` - Delete recording
- `GET /:recordingId/download` - Download recording
- `POST /:recordingId/analyze` - Analyze recording

## Authentication

All endpoints require authentication using JWT tokens. Two levels of authentication are supported:
- `authenticateOnCall` - Standard authentication for regular operations
- `authenticateEmergency` - Enhanced authentication for emergency operations

## Regional Support

The module supports operations across different regions:
- England (CQC)
- Wales (CIW)
- Scotland (Care Inspectorate)
- Northern Ireland (RQIA)
- Ireland (HIQA)

## Compliance Requirements

The module adheres to:
- Data Protection Act 2018
- GDPR requirements
- Regional care standards
- Healthcare regulations
- Recording retention policies

## Error Handling

All endpoints follow a consistent error handling pattern:
- HTTP status codes for response types
- Detailed error messages
- Validation error specifics
- Compliance violation details

## Data Types

Comprehensive type definitions are available in `types.ts`:
- Call-related types
- Staff-related types
- Schedule-related types
- Compliance-related types
- Recording-related types
- Filter types
- Response types

## Development

### Prerequisites
- Node.js 18+
- TypeScript 4.5+
- PostgreSQL 13+

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Run migrations:
   ```bash
   npm run migrate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Testing
```bash
npm run test
npm run test:e2e
```

### Building
```bash
npm run build
```

## Documentation

Additional documentation:
- API Documentation: `/docs/api`
- Integration Guide: `/docs/integration`
- Compliance Guide: `/docs/compliance`
- Development Guide: `/docs/development` 