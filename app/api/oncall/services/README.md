/**
 * @writecarenotes.com
 * @fileoverview OnCall Module Integration Documentation
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

# OnCall Module Integration

## Service Dependencies

### Core Service Imports
```typescript
// Core services used across the OnCall module
import { StaffManagement } from '@/features/staff/services/staffManagement';
import { CommunicationService } from '@/features/telehealth/services/communicationService';
import { ComplianceService } from '@/lib/services/compliance';
```

## Service Files

### OnCallStaffService
Location: `APP/API/oncall/services/StaffService.ts`
```typescript
import { StaffManagement } from '@/features/staff/services/staffManagement';

class OnCallStaffService {
  private static instance: OnCallStaffService;
  private staffManagement: StaffManagement;
  
  public async updateOnCallAvailability(staffId: string, status: StaffStatus): Promise<StaffMember>
  public async getOnCallSchedule(staffId: string): Promise<{ staff: StaffMember; schedules: Schedule[] }>
  public async getOnCallQualifications(region: Region): Promise<string[]>
  public async listAvailableOnCallStaff(params: { region: Region; date?: Date; qualifications?: string[] }): Promise<StaffMember[]>
}
```

### OnCallCallService
Location: `APP/API/oncall/services/CallService.ts`
```typescript
import { CommunicationService } from '@/features/telehealth/services/communicationService';

class OnCallCallService {
  private static instance: OnCallCallService;
  private communicationService: CommunicationService;
  
  public async handleIncomingCall(phoneNumber: string, region: Region): Promise<Call>
  public async endCall(callId: string): Promise<void>
  public async getCallDetails(callId: string): Promise<Call>
  public async listCalls(filters?: { status?: CallStatus; startDate?: Date; endDate?: Date; region?: Region }): Promise<Call[]>
}
```

### ComplianceService
Location: `APP/API/oncall/services/ComplianceService.ts`
```typescript
import { ComplianceService } from '@/lib/services/compliance';

class OnCallComplianceService {
  private static instance: OnCallComplianceService;
  private complianceService: ComplianceService;
  
  public async validateCallCompliance(call: Call): Promise<ComplianceResult>
  public async validateStaffCompliance(staff: StaffMember): Promise<ComplianceResult>
  public async generateComplianceReport(period: DateRange): Promise<ComplianceReport>
}
```

### RecordingService
Location: `APP/API/oncall/services/RecordingService.ts`
```typescript
class OnCallRecordingService {
  private static instance: OnCallRecordingService;
  
  public async startRecording(callId: string): Promise<string>
  public async stopRecording(recordingId: string): Promise<void>
  public async getRecording(recordingId: string): Promise<Recording>
}
```

### ScheduleService
Location: `APP/API/oncall/services/ScheduleService.ts`
```typescript
class OnCallScheduleService {
  private static instance: OnCallScheduleService;
  
  public async createSchedule(schedule: Schedule): Promise<Schedule>
  public async updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<Schedule>
  public async getSchedule(scheduleId: string): Promise<Schedule>
}
```

## Integration Points

### Staff Management
Core Service: `@/features/staff/services/staffManagement.ts`
- Staff profiles and qualifications
- Availability tracking
- Schedule management

### Communication
Core Service: `@/features/telehealth/services/communicationService.ts`
- Call handling
- Recording management
- Real-time communication

### Compliance
Core Service: `@/lib/services/compliance.ts`
- Regulatory compliance
- Audit logging
- Report generation

## Performance Integration

### Shared Resources
- Uses existing caching system
- Extends notification system
- Uses core authentication
- Shares data storage

### Additional Requirements
- Emergency routing: < 1s
- Availability updates: < 2s
- Escalation triggers: < 1s

## Testing Integration

### Integration Tests
- Staff service integration
- Incident routing integration
- Handover process integration
- Notification system integration

## Monitoring Integration

### Shared Metrics
- Uses core monitoring
- Adds on-call specific alerts
- Integrates with existing dashboards
- Extends audit logging 